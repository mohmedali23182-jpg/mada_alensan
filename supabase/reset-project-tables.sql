-- تحذير: هذا الملف يحذف جداول مشروع مدى الإنسان من schema public.
-- استخدمه فقط إذا كنت تريد تنظيف قاعدة المشروع وإعادة إنشائها عبر Prisma.
-- خذ نسخة احتياطية قبل التشغيل على قاعدة مهمة.

begin;

drop table if exists "PostWorkflowEvent" cascade;
drop table if exists "PostRevision" cascade;
drop table if exists "PostBlock" cascade;
drop table if exists "PostMedia" cascade;
drop table if exists "PostSeo" cascade;
drop table if exists "PostStats" cascade;
drop table if exists "PostView" cascade;
drop table if exists "PostReaction" cascade;
drop table if exists "Bookmark" cascade;
drop table if exists "Comment" cascade;
drop table if exists "PostTag" cascade;
drop table if exists "Media" cascade;
drop table if exists "CaseUpdate" cascade;
drop table if exists "TelegramPublishLog" cascade;
drop table if exists "TelegramDraft" cascade;
drop table if exists "Post" cascade;
drop table if exists "Case" cascade;
drop table if exists "Submission" cascade;
drop table if exists "ContactMessage" cascade;
drop table if exists "Contributor" cascade;
drop table if exists "Tag" cascade;
drop table if exists "MenuItem" cascade;
drop table if exists "Menu" cascade;
drop table if exists "Page" cascade;
drop table if exists "Redirect" cascade;
drop table if exists "NewsletterSubscriber" cascade;
drop table if exists "SocialLink" cascade;
drop table if exists "SiteSetting" cascade;
drop table if exists "ActivityLog" cascade;
drop table if exists "Region" cascade;
drop table if exists "Category" cascade;
drop table if exists "User" cascade;
drop table if exists "Organization" cascade;

-- إزالة enum types القديمة والجديدة الخاصة بالمشروع إن وجدت.
drop type if exists "UserRole" cascade;
drop type if exists "PostStatus" cascade;
drop type if exists "PostType" cascade;
drop type if exists "ContentVisibility" cascade;
drop type if exists "ContentBlockType" cascade;
drop type if exists "EditorialAction" cascade;
drop type if exists "CaseStatus" cascade;
drop type if exists "SubmissionType" cascade;
drop type if exists "SubmissionStatus" cascade;
drop type if exists "MediaType" cascade;
drop type if exists "MediaUsageType" cascade;
drop type if exists "CommentStatus" cascade;
drop type if exists "ReactionType" cascade;
drop type if exists "RedirectStatusCode" cascade;
drop type if exists "PageStatus" cascade;
drop type if exists "TelegramDraftStep" cascade;

commit;
