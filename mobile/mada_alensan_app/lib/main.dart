import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

const apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'https://mada-alensan.vercel.app',
);

void main() {
  runApp(const MadaAlensanApp());
}

class MadaAlensanApp extends StatelessWidget {
  const MadaAlensanApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'مدى الإنسان',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xff0f766e)),
        scaffoldBackgroundColor: const Color(0xfff4fbf8),
        fontFamily: 'Roboto',
      ),
      builder: (context, child) => Directionality(
        textDirection: TextDirection.rtl,
        child: child ?? const SizedBox.shrink(),
      ),
      home: const MainShell(),
    );
  }
}

class ApiClient {
  ApiClient(this.token);
  final String? token;

  Uri uri(String path, [Map<String, String?>? query]) {
    final base = apiBaseUrl.endsWith('/') ? apiBaseUrl.substring(0, apiBaseUrl.length - 1) : apiBaseUrl;
    final cleanQuery = <String, String>{};
    query?.forEach((key, value) {
      if (value != null && value.trim().isNotEmpty) cleanQuery[key] = value;
    });
    return Uri.parse('$base$path').replace(queryParameters: cleanQuery.isEmpty ? null : cleanQuery);
  }

  Map<String, String> get headers => {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        if (token != null && token!.isNotEmpty) 'Authorization': 'Bearer $token',
      };

  Future<Map<String, dynamic>> getJson(String path, [Map<String, String?>? query]) async {
    final response = await http.get(uri(path, query), headers: headers).timeout(const Duration(seconds: 25));
    return _decode(response);
  }

  Future<Map<String, dynamic>> postJson(String path, Map<String, dynamic> body) async {
    final response = await http.post(uri(path), headers: headers, body: jsonEncode(body)).timeout(const Duration(seconds: 25));
    return _decode(response);
  }

  Future<Map<String, dynamic>> patchJson(String path, Map<String, dynamic> body) async {
    final response = await http.patch(uri(path), headers: headers, body: jsonEncode(body)).timeout(const Duration(seconds: 25));
    return _decode(response);
  }

  Map<String, dynamic> _decode(http.Response response) {
    final contentType = response.headers['content-type'] ?? '';
    final body = utf8.decode(response.bodyBytes).trim();

    if (!contentType.toLowerCase().contains('application/json')) {
      if (body.startsWith('<!DOCTYPE') || body.startsWith('<html')) {
        throw ApiException('رابط API غير صحيح أو المسار غير منشور. تأكد من نشر واجهات API في الموقع.', response.statusCode);
      }
      throw ApiException('الخادم أعاد ردًا غير صالح. حاول لاحقًا.', response.statusCode);
    }

    final dynamic decoded;
    try {
      decoded = body.isEmpty ? <String, dynamic>{} : jsonDecode(body);
    } on FormatException {
      throw ApiException('تعذر قراءة رد الخادم. حاول لاحقًا.', response.statusCode);
    }

    if (decoded is! Map<String, dynamic>) {
      throw ApiException('رد الخادم غير متوقع.', response.statusCode);
    }

    if (response.statusCode >= 400 || decoded['ok'] == false) {
      throw ApiException((decoded['message'] ?? decoded['error'] ?? 'حدث خطأ غير متوقع').toString(), response.statusCode);
    }

    return decoded;
  }
}

class ApiException implements Exception {
  ApiException(this.message, this.statusCode);
  final String message;
  final int statusCode;
  @override
  String toString() => message;
}

class SessionStore extends ChangeNotifier {
  String? token;
  Map<String, dynamic>? user;
  bool ready = false;

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    token = prefs.getString('admin_token');
    final rawUser = prefs.getString('admin_user');
    if (rawUser != null) {
      try {
        user = jsonDecode(rawUser) as Map<String, dynamic>;
      } catch (_) {
        user = null;
      }
    }
    ready = true;
    notifyListeners();
  }

  Future<void> save(String newToken, Map<String, dynamic> newUser) async {
    token = newToken;
    user = newUser;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('admin_token', newToken);
    await prefs.setString('admin_user', jsonEncode(newUser));
    notifyListeners();
  }

  Future<void> logout() async {
    token = null;
    user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('admin_token');
    await prefs.remove('admin_user');
    notifyListeners();
  }
}

final session = SessionStore();

String str(dynamic value, [String fallback = '']) => value == null ? fallback : value.toString();
List<dynamic> listFrom(Map<String, dynamic>? data, String key) => (data?[key] as List? ?? const <dynamic>[]).cast<dynamic>();

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int index = 0;

  @override
  void initState() {
    super.initState();
    session.load();
    session.addListener(_refresh);
  }

  @override
  void dispose() {
    session.removeListener(_refresh);
    super.dispose();
  }

  void _refresh() => setState(() {});

  @override
  Widget build(BuildContext context) {
    final screens = [
      HomeScreen(onOpenTab: (value) => setState(() => index = value)),
      const ArticlesScreen(),
      const CategoriesScreen(),
      const SubmitStoryScreen(),
      session.token == null ? const AdminLoginScreen() : const AdminHomeScreen(),
    ];
    return Scaffold(
      appBar: AppBar(
        title: const Text('مدى الإنسان'),
        centerTitle: true,
        actions: [
          IconButton(
            tooltip: 'تواصل',
            onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ContactScreen())),
            icon: const Icon(Icons.mail_outline),
          ),
          if (session.token != null)
            IconButton(
              tooltip: 'تسجيل الخروج',
              onPressed: () => session.logout(),
              icon: const Icon(Icons.logout),
            ),
        ],
      ),
      body: screens[index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (value) => setState(() => index = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'الرئيسية'),
          NavigationDestination(icon: Icon(Icons.article_outlined), selectedIcon: Icon(Icons.article), label: 'المقالات'),
          NavigationDestination(icon: Icon(Icons.grid_view_outlined), selectedIcon: Icon(Icons.grid_view), label: 'الأقسام'),
          NavigationDestination(icon: Icon(Icons.edit_note_outlined), selectedIcon: Icon(Icons.edit_note), label: 'أرسل قصة'),
          NavigationDestination(icon: Icon(Icons.admin_panel_settings_outlined), selectedIcon: Icon(Icons.admin_panel_settings), label: 'الأدمن'),
        ],
      ),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.onOpenTab});
  final ValueChanged<int> onOpenTab;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final api = ApiClient(null);
  late Future<Map<String, dynamic>> articlesFuture = api.getJson('/api/v1/articles', {'limit': '8'});
  late Future<Map<String, dynamic>> categoriesFuture = api.getJson('/api/v1/categories');

  Future<void> _refresh() async {
    setState(() {
      articlesFuture = api.getJson('/api/v1/articles', {'limit': '8'});
      categoriesFuture = api.getJson('/api/v1/categories');
    });
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _refresh,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          HeaderCard(onOpenTab: widget.onOpenTab),
          const SizedBox(height: 16),
          SectionTitle(title: 'أحدث المقالات', action: 'عرض الكل', onTap: () => widget.onOpenTab(1)),
          FutureBuilder<Map<String, dynamic>>(
            future: articlesFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) return const Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator()));
              if (snapshot.hasError) return InlineError(message: snapshot.error.toString(), onRetry: _refresh);
              final items = listFrom(snapshot.data, 'items');
              if (items.isEmpty) return const EmptyInline(message: 'لا توجد مقالات منشورة بعد.');
              return Column(children: items.take(4).map((item) => CompactArticleCard(item: (item as Map).cast<String, dynamic>())).toList());
            },
          ),
          const SizedBox(height: 16),
          SectionTitle(title: 'الأقسام', action: 'كل الأقسام', onTap: () => widget.onOpenTab(2)),
          FutureBuilder<Map<String, dynamic>>(
            future: categoriesFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) return const Padding(padding: EdgeInsets.all(16), child: LinearProgressIndicator());
              if (snapshot.hasError) return InlineError(message: snapshot.error.toString(), onRetry: _refresh);
              final items = listFrom(snapshot.data, 'items');
              if (items.isEmpty) return const EmptyInline(message: 'لا توجد أقسام بعد.');
              return Wrap(
                spacing: 8,
                runSpacing: 8,
                children: items.take(8).map((item) {
                  final category = (item as Map).cast<String, dynamic>();
                  return ActionChip(
                    label: Text(str(category['name'], 'قسم')),
                    onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => CategoryArticlesScreen(category: category))),
                  );
                }).toList(),
              );
            },
          ),
        ],
      ),
    );
  }
}

class HeaderCard extends StatelessWidget {
  const HeaderCard({super.key, required this.onOpenTab});
  final ValueChanged<int> onOpenTab;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('منصة إنسانية - اجتماعية - ثقافية - علمية - متنوعة', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('اقرأ، شارك قصة، وتابع المواد المنشورة من موقع مدى الإنسان الرسمي.'),
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                FilledButton.icon(onPressed: () => onOpenTab(3), icon: const Icon(Icons.edit_note), label: const Text('أرسل قصة')),
                OutlinedButton.icon(onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ContactScreen())), icon: const Icon(Icons.mail_outline), label: const Text('تواصل')),
                OutlinedButton.icon(onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const NewsletterScreen())), icon: const Icon(Icons.mark_email_read_outlined), label: const Text('النشرة')),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class ArticlesScreen extends StatefulWidget {
  const ArticlesScreen({super.key});

  @override
  State<ArticlesScreen> createState() => _ArticlesScreenState();
}

class _ArticlesScreenState extends State<ArticlesScreen> {
  final api = ApiClient(null);
  final search = TextEditingController();
  String query = '';
  late Future<Map<String, dynamic>> future = _load();

  Future<Map<String, dynamic>> _load() => api.getJson('/api/v1/articles', {'limit': '30', 'q': query});

  void _search() => setState(() {
        query = search.text.trim();
        future = _load();
      });

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async => setState(() => future = _load()),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            controller: search,
            textInputAction: TextInputAction.search,
            onSubmitted: (_) => _search(),
            decoration: InputDecoration(
              hintText: 'ابحث في المقالات',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: IconButton(onPressed: _search, icon: const Icon(Icons.arrow_back)),
              border: const OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          FutureBuilder<Map<String, dynamic>>(
            future: future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) return const Padding(padding: EdgeInsets.all(32), child: Center(child: CircularProgressIndicator()));
              if (snapshot.hasError) return ErrorView(message: snapshot.error.toString(), onRetry: () => setState(() => future = _load()));
              final items = listFrom(snapshot.data, 'items');
              if (items.isEmpty) return const EmptyView(message: 'لا توجد مقالات مطابقة.');
              return Column(children: items.map((item) => ArticleCard(item: (item as Map).cast<String, dynamic>())).toList());
            },
          ),
        ],
      ),
    );
  }
}

class ArticleCard extends StatelessWidget {
  const ArticleCard({super.key, required this.item});
  final Map<String, dynamic> item;

  @override
  Widget build(BuildContext context) {
    final cover = str(item['coverImage'] ?? item['thumbnail']);
    return Card(
      clipBehavior: Clip.antiAlias,
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ArticleDetailsScreen(slug: str(item['slug'])))),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            CoverImage(url: cover, height: 170),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(str(item['title']), style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text(str(item['summary'] ?? item['excerpt']), maxLines: 3, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 10),
                  Text('قراءة ${str(item['readingTime'], '3')} دقائق', style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class CompactArticleCard extends StatelessWidget {
  const CompactArticleCard({super.key, required this.item});
  final Map<String, dynamic> item;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        contentPadding: const EdgeInsets.all(10),
        leading: ClipRRect(borderRadius: BorderRadius.circular(10), child: CoverImage(url: str(item['thumbnail'] ?? item['coverImage']), height: 62)),
        title: Text(str(item['title']), maxLines: 2, overflow: TextOverflow.ellipsis),
        subtitle: Text('قراءة ${str(item['readingTime'], '3')} دقائق'),
        onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ArticleDetailsScreen(slug: str(item['slug'])))),
      ),
    );
  }
}

class ArticleDetailsScreen extends StatefulWidget {
  const ArticleDetailsScreen({super.key, required this.slug});
  final String slug;

  @override
  State<ArticleDetailsScreen> createState() => _ArticleDetailsScreenState();
}

class _ArticleDetailsScreenState extends State<ArticleDetailsScreen> {
  late final api = ApiClient(null);
  late Future<Map<String, dynamic>> future = api.getJson('/api/v1/articles/${widget.slug}');

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('المقال')),
      body: FutureBuilder<Map<String, dynamic>>(
        future: future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
          if (snapshot.hasError) return ErrorView(message: snapshot.error.toString(), onRetry: () => setState(() => future = api.getJson('/api/v1/articles/${widget.slug}')));
          final item = (snapshot.data?['item'] as Map? ?? snapshot.data?['article'] as Map? ?? {}).cast<String, dynamic>();
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              CoverImage(url: str(item['coverImage'] ?? item['thumbnail']), height: 220),
              const SizedBox(height: 16),
              Text(str(item['title']), style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              Text(str(item['summary'] ?? item['excerpt']), style: Theme.of(context).textTheme.bodyLarge),
              const Divider(height: 32),
              Text(str(item['content']), style: Theme.of(context).textTheme.bodyLarge?.copyWith(height: 1.8)),
            ],
          );
        },
      ),
    );
  }
}

class CategoriesScreen extends StatefulWidget {
  const CategoriesScreen({super.key});

  @override
  State<CategoriesScreen> createState() => _CategoriesScreenState();
}

class _CategoriesScreenState extends State<CategoriesScreen> {
  final api = ApiClient(null);
  late Future<Map<String, dynamic>> future = api.getJson('/api/v1/categories');

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>>(
      future: future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
        if (snapshot.hasError) return ErrorView(message: snapshot.error.toString(), onRetry: () => setState(() => future = api.getJson('/api/v1/categories')));
        final items = listFrom(snapshot.data, 'items');
        if (items.isEmpty) return const EmptyView(message: 'لا توجد أقسام بعد.');
        return GridView.builder(
          padding: const EdgeInsets.all(16),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 10, mainAxisSpacing: 10, childAspectRatio: 1.45),
          itemCount: items.length,
          itemBuilder: (context, index) {
            final item = (items[index] as Map).cast<String, dynamic>();
            return Card(
              child: InkWell(
                borderRadius: BorderRadius.circular(12),
                onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => CategoryArticlesScreen(category: item))),
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.folder_open),
                      const Spacer(),
                      Text(str(item['name'], 'قسم'), style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                      Text(str(item['description']), maxLines: 2, overflow: TextOverflow.ellipsis),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }
}

class CategoryArticlesScreen extends StatefulWidget {
  const CategoryArticlesScreen({super.key, required this.category});
  final Map<String, dynamic> category;

  @override
  State<CategoryArticlesScreen> createState() => _CategoryArticlesScreenState();
}

class _CategoryArticlesScreenState extends State<CategoryArticlesScreen> {
  late final slug = str(widget.category['slug']);
  late Future<Map<String, dynamic>> future = ApiClient(null).getJson('/api/v1/articles', {'category': slug, 'limit': '30'});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(str(widget.category['name'], 'القسم'))),
      body: FutureBuilder<Map<String, dynamic>>(
        future: future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
          if (snapshot.hasError) return ErrorView(message: snapshot.error.toString(), onRetry: () => setState(() => future = ApiClient(null).getJson('/api/v1/articles', {'category': slug, 'limit': '30'})));
          final items = listFrom(snapshot.data, 'items');
          if (items.isEmpty) return const EmptyView(message: 'لا توجد مقالات في هذا القسم.');
          return ListView(padding: const EdgeInsets.all(16), children: items.map((e) => ArticleCard(item: (e as Map).cast<String, dynamic>())).toList());
        },
      ),
    );
  }
}

class SubmitStoryScreen extends StatefulWidget {
  const SubmitStoryScreen({super.key});

  @override
  State<SubmitStoryScreen> createState() => _SubmitStoryScreenState();
}

class _SubmitStoryScreenState extends State<SubmitStoryScreen> {
  final formKey = GlobalKey<FormState>();
  final title = TextEditingController();
  final body = TextEditingController();
  final fullName = TextEditingController();
  final phone = TextEditingController();
  final email = TextEditingController();
  bool isAnonymous = false;
  String submissionType = 'STORY';
  bool loading = false;

  @override
  Widget build(BuildContext context) {
    return FormPage(
      title: 'إرسال قصة أو مقال',
      subtitle: 'تُحفظ المشاركة في لوحة الإدارة للمراجعة قبل النشر.',
      formKey: formKey,
      loading: loading,
      buttonText: 'إرسال المشاركة',
      onSubmit: _submit,
      children: [
        SegmentedButton<String>(
          segments: const [
            ButtonSegment(value: 'STORY', label: Text('قصة'), icon: Icon(Icons.auto_stories_outlined)),
            ButtonSegment(value: 'ARTICLE', label: Text('مقال'), icon: Icon(Icons.article_outlined)),
          ],
          selected: {submissionType},
          onSelectionChanged: (value) => setState(() => submissionType = value.first),
        ),
        SwitchListTile(value: isAnonymous, onChanged: (v) => setState(() => isAnonymous = v), title: const Text('إخفاء الاسم عند النشر')),
        if (!isAnonymous) AppTextField(controller: fullName, label: 'الاسم', required: false),
        AppTextField(controller: email, label: 'البريد الإلكتروني', required: false, keyboardType: TextInputType.emailAddress),
        AppTextField(controller: phone, label: 'رقم الهاتف', required: false, keyboardType: TextInputType.phone),
        AppTextField(controller: title, label: 'عنوان المشاركة'),
        AppTextField(controller: body, label: 'المحتوى', minLines: 7),
      ],
    );
  }

  Future<void> _submit() async {
    if (!formKey.currentState!.validate()) return;
    setState(() => loading = true);
    try {
      await ApiClient(null).postJson('/api/v1/submissions', {
        'type': submissionType,
        'submissionType': submissionType,
        'title': title.text.trim(),
        'content': body.text.trim(),
        'body': body.text.trim(),
        'name': isAnonymous ? '' : fullName.text.trim(),
        'fullName': isAnonymous ? '' : fullName.text.trim(),
        'email': email.text.trim(),
        'phone': phone.text.trim(),
        'isAnonymous': isAnonymous,
        'allowPublish': true,
        'source': 'MOBILE_APP',
      });
      if (!mounted) return;
      title.clear();
      body.clear();
      fullName.clear();
      phone.clear();
      email.clear();
      showMessage(context, submissionType == 'ARTICLE' ? 'تم إرسال المقال بنجاح، سنراجعه قبل النشر.' : 'تم إرسال مشاركتك بنجاح، سنراجعها قبل النشر.');
    } catch (e) {
      if (mounted) showMessage(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }
}

class ContactScreen extends StatefulWidget {
  const ContactScreen({super.key});

  @override
  State<ContactScreen> createState() => _ContactScreenState();
}

class _ContactScreenState extends State<ContactScreen> {
  final formKey = GlobalKey<FormState>();
  final name = TextEditingController();
  final email = TextEditingController();
  final subject = TextEditingController();
  final message = TextEditingController();
  bool loading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تواصل معنا')),
      body: FormPage(
        title: 'تواصل معنا',
        subtitle: 'تصل الرسائل إلى البريد الرسمي: mtzallqmy@gmail.com',
        formKey: formKey,
        loading: loading,
        buttonText: 'إرسال الرسالة',
        onSubmit: _submit,
        children: [
          AppTextField(controller: name, label: 'الاسم'),
          AppTextField(controller: email, label: 'البريد الإلكتروني', required: false, keyboardType: TextInputType.emailAddress),
          AppTextField(controller: subject, label: 'الموضوع', required: false),
          AppTextField(controller: message, label: 'الرسالة', minLines: 6),
        ],
      ),
    );
  }

  Future<void> _submit() async {
    if (!formKey.currentState!.validate()) return;
    setState(() => loading = true);
    try {
      await ApiClient(null).postJson('/api/v1/contact', {'name': name.text.trim(), 'email': email.text.trim(), 'subject': subject.text.trim(), 'message': message.text.trim()});
      if (!mounted) return;
      name.clear();
      email.clear();
      subject.clear();
      message.clear();
      showMessage(context, 'تم إرسال الرسالة بنجاح.');
    } catch (e) {
      if (mounted) showMessage(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }
}

class NewsletterScreen extends StatefulWidget {
  const NewsletterScreen({super.key});

  @override
  State<NewsletterScreen> createState() => _NewsletterScreenState();
}

class _NewsletterScreenState extends State<NewsletterScreen> {
  final formKey = GlobalKey<FormState>();
  final email = TextEditingController();
  bool loading = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('النشرة البريدية')),
      body: FormPage(
        title: 'النشرة البريدية',
        subtitle: 'اشترك ليصلك جديد المنصة الإنسانية، الفكرية، الثقافية.',
        formKey: formKey,
        loading: loading,
        buttonText: 'اشتراك',
        onSubmit: _submit,
        children: [AppTextField(controller: email, label: 'البريد الإلكتروني', keyboardType: TextInputType.emailAddress)],
      ),
    );
  }

  Future<void> _submit() async {
    if (!formKey.currentState!.validate()) return;
    setState(() => loading = true);
    try {
      await ApiClient(null).postJson('/api/v1/newsletter', {'email': email.text.trim()});
      if (!mounted) return;
      email.clear();
      showMessage(context, 'تم الاشتراك بنجاح.');
    } catch (e) {
      if (mounted) showMessage(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }
}

class AdminLoginScreen extends StatefulWidget {
  const AdminLoginScreen({super.key});

  @override
  State<AdminLoginScreen> createState() => _AdminLoginScreenState();
}

class _AdminLoginScreenState extends State<AdminLoginScreen> {
  final formKey = GlobalKey<FormState>();
  final email = TextEditingController(text: 'mtzallqmy@gmail.com');
  final password = TextEditingController();
  bool loading = false;
  bool obscure = true;

  @override
  Widget build(BuildContext context) {
    return FormPage(
      title: 'دخول الأدمن',
      subtitle: 'ادخل بنفس بريد ورمز أدمن الموقع.',
      formKey: formKey,
      loading: loading,
      buttonText: 'دخول',
      onSubmit: _login,
      children: [
        AppTextField(controller: email, label: 'البريد الإلكتروني', keyboardType: TextInputType.emailAddress),
        TextFormField(
          controller: password,
          obscureText: obscure,
          decoration: InputDecoration(
            labelText: 'كلمة المرور',
            border: const OutlineInputBorder(),
            suffixIcon: IconButton(icon: Icon(obscure ? Icons.visibility : Icons.visibility_off), onPressed: () => setState(() => obscure = !obscure)),
          ),
          validator: (v) => (v == null || v.length < 6) ? 'كلمة المرور مطلوبة' : null,
        ),
      ],
    );
  }

  Future<void> _login() async {
    if (!formKey.currentState!.validate()) return;
    setState(() => loading = true);
    try {
      final data = await ApiClient(null).postJson('/api/v1/auth/login', {'email': email.text.trim().toLowerCase(), 'password': password.text});
      await session.save(str(data['token']), (data['user'] as Map).cast<String, dynamic>());
      if (mounted) showMessage(context, 'تم تسجيل الدخول.');
    } catch (e) {
      if (mounted) showMessage(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }
}

class AdminHomeScreen extends StatefulWidget {
  const AdminHomeScreen({super.key});

  @override
  State<AdminHomeScreen> createState() => _AdminHomeScreenState();
}

class _AdminHomeScreenState extends State<AdminHomeScreen> {
  int tab = 0;

  @override
  Widget build(BuildContext context) {
    const pages = [AdminDashboardScreen(), AdminPostsScreen(), AdminSubmissionsScreen(), AdminCreatePostScreen()];
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: SegmentedButton<int>(
              segments: const [
                ButtonSegment(value: 0, label: Text('لوحة'), icon: Icon(Icons.dashboard)),
                ButtonSegment(value: 1, label: Text('المقالات'), icon: Icon(Icons.article)),
                ButtonSegment(value: 2, label: Text('الوارد'), icon: Icon(Icons.inbox)),
                ButtonSegment(value: 3, label: Text('مقال جديد'), icon: Icon(Icons.add)),
              ],
              selected: {tab},
              onSelectionChanged: (v) => setState(() => tab = v.first),
            ),
          ),
        ),
        Expanded(child: pages[tab]),
      ],
    );
  }
}

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  late Future<Map<String, dynamic>> future = ApiClient(session.token).getJson('/api/v1/admin/dashboard');

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('مرحبًا ${str(session.user?['name'], 'بالأدمن')}', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        FutureBuilder<Map<String, dynamic>>(
          future: future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
            if (snapshot.hasError) return ErrorView(message: snapshot.error.toString(), onRetry: () => setState(() => future = ApiClient(session.token).getJson('/api/v1/admin/dashboard')));
            final stats = (snapshot.data?['stats'] as Map? ?? {}).cast<String, dynamic>();
            return Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                StatCard(label: 'المقالات', value: str(stats['posts'], '0')),
                StatCard(label: 'الوارد', value: str(stats['submissions'], '0')),
                StatCard(label: 'رسائل التواصل', value: str(stats['contacts'], '0')),
                StatCard(label: 'المشتركون', value: str(stats['subscribers'], '0')),
              ],
            );
          },
        ),
      ],
    );
  }
}

class StatCard extends StatelessWidget {
  const StatCard({super.key, required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 150,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(value, style: Theme.of(context).textTheme.headlineMedium), Text(label)]),
        ),
      ),
    );
  }
}

class AdminPostsScreen extends StatefulWidget {
  const AdminPostsScreen({super.key});

  @override
  State<AdminPostsScreen> createState() => _AdminPostsScreenState();
}

class _AdminPostsScreenState extends State<AdminPostsScreen> {
  late Future<Map<String, dynamic>> future = ApiClient(session.token).getJson('/api/v1/admin/posts');

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>>(
      future: future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
        if (snapshot.hasError) return ErrorView(message: snapshot.error.toString(), onRetry: () => setState(() => future = ApiClient(session.token).getJson('/api/v1/admin/posts')));
        final items = listFrom(snapshot.data, 'items');
        if (items.isEmpty) return const EmptyView(message: 'لا توجد مقالات في لوحة الإدارة.');
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: items.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (context, i) {
            final item = (items[i] as Map).cast<String, dynamic>();
            return Card(
              child: ListTile(
                title: Text(str(item['title'])),
                subtitle: Text('الحالة: ${str(item['status'])}'),
                trailing: const Icon(Icons.chevron_left),
                onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => AdminPostDetailsScreen(item: item))).then((_) => setState(() => future = ApiClient(session.token).getJson('/api/v1/admin/posts'))),
              ),
            );
          },
        );
      },
    );
  }
}


class AdminPostDetailsScreen extends StatefulWidget {
  const AdminPostDetailsScreen({super.key, required this.item});
  final Map<String, dynamic> item;

  @override
  State<AdminPostDetailsScreen> createState() => _AdminPostDetailsScreenState();
}

class _AdminPostDetailsScreenState extends State<AdminPostDetailsScreen> {
  bool loading = false;

  Future<void> _setStatus(String status) async {
    setState(() => loading = true);
    try {
      await ApiClient(session.token).patchJson('/api/v1/admin/posts/${str(widget.item['id'])}', {
        'title': str(widget.item['title']),
        'content': str(widget.item['content']),
        'excerpt': str(widget.item['excerpt']),
        'coverImage': str(widget.item['coverImage']),
        'type': str(widget.item['type'], 'NEWS'),
        'status': status,
      });
      if (!mounted) return;
      showMessage(context, status == 'PUBLISHED' ? 'تم نشر المقال.' : 'تم تحديث حالة المقال.');
      Navigator.of(context).pop();
    } catch (e) {
      if (mounted) showMessage(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('تفاصيل المقال')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          CoverImage(url: str(widget.item['coverImage'] ?? widget.item['thumbnail']), height: 180),
          const SizedBox(height: 12),
          Text(str(widget.item['title']), style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text('الحالة: ${str(widget.item['status'])}'),
          const Divider(height: 28),
          Text(str(widget.item['excerpt'] ?? widget.item['content']), maxLines: 6, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              FilledButton.icon(onPressed: loading ? null : () => _setStatus('PUBLISHED'), icon: const Icon(Icons.publish), label: const Text('نشر')),
              OutlinedButton.icon(onPressed: loading ? null : () => _setStatus('DRAFT'), icon: const Icon(Icons.drafts), label: const Text('مسودة')),
              OutlinedButton.icon(onPressed: loading ? null : () => _setStatus('ARCHIVED'), icon: const Icon(Icons.archive), label: const Text('أرشفة')),
            ],
          ),
        ],
      ),
    );
  }
}

class AdminSubmissionsScreen extends StatefulWidget {
  const AdminSubmissionsScreen({super.key});

  @override
  State<AdminSubmissionsScreen> createState() => _AdminSubmissionsScreenState();
}

class _AdminSubmissionsScreenState extends State<AdminSubmissionsScreen> {
  late Future<Map<String, dynamic>> future = ApiClient(session.token).getJson('/api/v1/admin/submissions');

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>>(
      future: future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
        if (snapshot.hasError) return ErrorView(message: snapshot.error.toString(), onRetry: () => setState(() => future = ApiClient(session.token).getJson('/api/v1/admin/submissions')));
        final items = listFrom(snapshot.data, 'items');
        if (items.isEmpty) return const EmptyView(message: 'لا توجد قصص أو رسائل واردة.');
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: items.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (context, i) {
            final item = (items[i] as Map).cast<String, dynamic>();
            return Card(
              child: ListTile(
                title: Text(str(item['title'], 'بدون عنوان')),
                subtitle: Text('الحالة: ${str(item['status'])}\n${str(item['body'] ?? item['content'])}', maxLines: 3, overflow: TextOverflow.ellipsis),
                trailing: const Icon(Icons.chevron_left),
                onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => AdminSubmissionDetailsScreen(item: item))).then((_) => setState(() => future = ApiClient(session.token).getJson('/api/v1/admin/submissions'))),
              ),
            );
          },
        );
      },
    );
  }
}


class AdminSubmissionDetailsScreen extends StatefulWidget {
  const AdminSubmissionDetailsScreen({super.key, required this.item});
  final Map<String, dynamic> item;

  @override
  State<AdminSubmissionDetailsScreen> createState() => _AdminSubmissionDetailsScreenState();
}

class _AdminSubmissionDetailsScreenState extends State<AdminSubmissionDetailsScreen> {
  bool loading = false;
  final notes = TextEditingController();

  Future<void> _patch(Map<String, dynamic> body, String success) async {
    setState(() => loading = true);
    try {
      await ApiClient(session.token).patchJson('/api/v1/admin/submissions/${str(widget.item['id'])}', body);
      if (!mounted) return;
      showMessage(context, success);
      Navigator.of(context).pop();
    } catch (e) {
      if (mounted) showMessage(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final body = str(widget.item['body'] ?? widget.item['content']);
    return Scaffold(
      appBar: AppBar(title: const Text('تفاصيل الوارد')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(str(widget.item['title'], 'بدون عنوان'), style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text('الحالة: ${str(widget.item['status'])}'),
          Text('الاسم: ${str(widget.item['fullName'] ?? widget.item['name'], 'غير مرفق')}'),
          Text('البريد: ${str(widget.item['email'], 'غير مرفق')}'),
          const Divider(height: 28),
          Text(body, style: Theme.of(context).textTheme.bodyLarge?.copyWith(height: 1.7)),
          const SizedBox(height: 16),
          AppTextField(controller: notes, label: 'ملاحظة إدارية', required: false, minLines: 2),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              FilledButton.icon(onPressed: loading ? null : () => _patch({'status': 'UNDER_REVIEW', 'reviewNotes': notes.text.trim()}, 'تم تحديث الحالة.'), icon: const Icon(Icons.visibility), label: const Text('قيد المراجعة')),
              FilledButton.icon(onPressed: loading ? null : () => _patch({'status': 'APPROVED', 'reviewNotes': notes.text.trim()}, 'تمت الموافقة.'), icon: const Icon(Icons.check), label: const Text('موافقة')),
              OutlinedButton.icon(onPressed: loading ? null : () => _patch({'status': 'REJECTED', 'reviewNotes': notes.text.trim()}, 'تم الرفض.'), icon: const Icon(Icons.close), label: const Text('رفض')),
              FilledButton.icon(onPressed: loading ? null : () => _patch({'action': 'convert-to-post', 'reviewNotes': notes.text.trim()}, 'تم تحويل الوارد إلى مقال.'), icon: const Icon(Icons.article), label: const Text('تحويل إلى مقال')),
            ],
          ),
        ],
      ),
    );
  }
}

class AdminCreatePostScreen extends StatefulWidget {
  const AdminCreatePostScreen({super.key});

  @override
  State<AdminCreatePostScreen> createState() => _AdminCreatePostScreenState();
}

class _AdminCreatePostScreenState extends State<AdminCreatePostScreen> {
  final formKey = GlobalKey<FormState>();
  final title = TextEditingController();
  final excerpt = TextEditingController();
  final content = TextEditingController();
  final coverImage = TextEditingController();
  bool loading = false;
  bool publish = false;

  @override
  Widget build(BuildContext context) {
    return FormPage(
      title: 'إنشاء مقال من التطبيق',
      subtitle: 'يحفظ في نفس قاعدة بيانات الموقع عبر API الأدمن.',
      formKey: formKey,
      loading: loading,
      buttonText: publish ? 'نشر المقال' : 'حفظ مسودة',
      onSubmit: _save,
      children: [
        SwitchListTile(value: publish, onChanged: (v) => setState(() => publish = v), title: const Text('نشر مباشرة')),
        AppTextField(controller: title, label: 'العنوان'),
        AppTextField(controller: excerpt, label: 'الموجز', required: false, minLines: 2),
        AppTextField(controller: coverImage, label: 'رابط صورة الغلاف', required: false, keyboardType: TextInputType.url),
        AppTextField(controller: content, label: 'المحتوى', minLines: 8),
      ],
    );
  }

  Future<void> _save() async {
    if (!formKey.currentState!.validate()) return;
    setState(() => loading = true);
    try {
      await ApiClient(session.token).postJson('/api/v1/admin/posts', {
        'title': title.text.trim(),
        'excerpt': excerpt.text.trim(),
        'content': content.text.trim(),
        'coverImage': coverImage.text.trim(),
        'status': publish ? 'PUBLISHED' : 'DRAFT',
        'type': 'NEWS',
      });
      if (!mounted) return;
      title.clear();
      excerpt.clear();
      content.clear();
      coverImage.clear();
      showMessage(context, publish ? 'تم نشر المقال.' : 'تم حفظ المسودة.');
    } catch (e) {
      if (mounted) showMessage(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }
}

class FormPage extends StatelessWidget {
  const FormPage({super.key, required this.title, required this.formKey, required this.loading, required this.buttonText, required this.onSubmit, required this.children, this.subtitle});

  final String title;
  final String? subtitle;
  final GlobalKey<FormState> formKey;
  final bool loading;
  final String buttonText;
  final Future<void> Function() onSubmit;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        Text(title, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
        if (subtitle != null) ...[const SizedBox(height: 8), Text(subtitle!)],
        const SizedBox(height: 18),
        Form(
          key: formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              ...children.map((e) => Padding(padding: const EdgeInsets.only(bottom: 12), child: e)),
              FilledButton.icon(
                onPressed: loading ? null : onSubmit,
                icon: loading ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.send),
                label: Text(buttonText),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class AppTextField extends StatelessWidget {
  const AppTextField({super.key, required this.controller, required this.label, this.required = true, this.minLines = 1, this.keyboardType});
  final TextEditingController controller;
  final String label;
  final bool required;
  final int minLines;
  final TextInputType? keyboardType;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      minLines: minLines,
      maxLines: minLines > 1 ? null : 1,
      keyboardType: keyboardType,
      decoration: InputDecoration(labelText: label, border: const OutlineInputBorder()),
      validator: (v) {
        if (!required) return null;
        if (v == null || v.trim().isEmpty) return 'هذا الحقل مطلوب';
        if (minLines > 1 && v.trim().length < 10) return 'النص قصير جدًا';
        return null;
      },
    );
  }
}

class CoverImage extends StatelessWidget {
  const CoverImage({super.key, required this.url, required this.height});
  final String url;
  final double height;

  @override
  Widget build(BuildContext context) {
    if (url.isEmpty) return PlaceholderBox(height: height);
    return Image.network(
      url,
      height: height,
      width: double.infinity,
      fit: BoxFit.cover,
      errorBuilder: (_, __, ___) => PlaceholderBox(height: height),
      loadingBuilder: (context, child, progress) => progress == null ? child : PlaceholderBox(height: height),
    );
  }
}

class PlaceholderBox extends StatelessWidget {
  const PlaceholderBox({super.key, required this.height});
  final double height;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      color: Theme.of(context).colorScheme.surfaceContainerHighest,
      alignment: Alignment.center,
      child: const Icon(Icons.image_outlined, size: 42),
    );
  }
}

class EmptyView extends StatelessWidget {
  const EmptyView({super.key, required this.message});
  final String message;
  @override
  Widget build(BuildContext context) => Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(message, textAlign: TextAlign.center)));
}

class EmptyInline extends StatelessWidget {
  const EmptyInline({super.key, required this.message});
  final String message;
  @override
  Widget build(BuildContext context) => Padding(padding: const EdgeInsets.all(18), child: Text(message, textAlign: TextAlign.center));
}

class InlineError extends StatelessWidget {
  const InlineError({super.key, required this.message, required this.onRetry});
  final String message;
  final FutureOr<void> Function() onRetry;
  @override
  Widget build(BuildContext context) => Card(child: Padding(padding: const EdgeInsets.all(12), child: Column(children: [Text(message, textAlign: TextAlign.center), TextButton(onPressed: () => onRetry(), child: const Text('إعادة المحاولة'))])));
}

class ErrorView extends StatelessWidget {
  const ErrorView({super.key, required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline, size: 42),
            const SizedBox(height: 12),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 12),
            OutlinedButton(onPressed: onRetry, child: const Text('إعادة المحاولة')),
          ],
        ),
      ),
    );
  }
}

class SectionTitle extends StatelessWidget {
  const SectionTitle({super.key, required this.title, this.action, this.onTap});
  final String title;
  final String? action;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: Text(title, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold))),
        if (action != null) TextButton(onPressed: onTap, child: Text(action!)),
      ],
    );
  }
}

void showMessage(BuildContext context, String message, {bool error = false}) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(message), backgroundColor: error ? Theme.of(context).colorScheme.error : null),
  );
}
