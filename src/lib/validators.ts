import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
});

export const categorySchema = z.object({
  name: z.string().min(2, "اسم القسم مطلوب"),
  slug: z
    .string()
    .min(2, "الرابط المختصر مطلوب")
    .regex(/^[a-z0-9-]+$/, "استخدم حروفًا إنجليزية صغيرة وأرقامًا وشرطة فقط"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

export const contributorSchema = z.object({
  name: z.string().min(2, "اسم الكاتب مطلوب"),
  slug: z
    .string()
    .min(2, "الرابط المختصر مطلوب")
    .regex(/^[a-z0-9-]+$/),
  email: z
    .string()
    .email("البريد الإلكتروني غير صحيح")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  coverUrl: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  xUrl: z.string().url().optional().or(z.literal("")),
  whatsappUrl: z.string().optional(),
  telegramUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
});

export const postSchema = z.object({
  title: z.string().min(4, "العنوان قصير جدًا"),
  slug: z
    .string()
    .regex(/^[\p{L}\p{N}-]+$/u)
    .optional()
    .or(z.literal("")),
  excerpt: z.string().optional(),
  content: z.string().min(20, "محتوى المقال قصير جدًا"),
  coverImage: z.string().url().optional().or(z.literal("")),
  thumbnail: z.string().url().optional().or(z.literal("")),
  type: z.string().default("NEWS"),
  status: z.string().default("DRAFT"),
  categoryId: z.string().optional().or(z.literal("")),
  contributorId: z.string().optional().or(z.literal("")),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  scheduledAt: z.string().datetime().optional().or(z.literal("")),
});

const optionalText = (schema: z.ZodString = z.string()) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }, schema.optional());

export const articleSubmissionSchema = z.object({
  fullName: z
    .string({ required_error: "الاسم الكامل مطلوب" })
    .trim()
    .min(2, "الاسم الكامل يجب أن يحتوي على حرفين على الأقل"),
  email: z
    .string({ required_error: "البريد الإلكتروني مطلوب" })
    .trim()
    .email("البريد الإلكتروني غير صحيح"),
  phone: optionalText(),
  authorBio: optionalText(
    z
      .string()
      .trim()
      .min(5, "نبذة الكاتب يجب أن تحتوي على 5 أحرف على الأقل إذا كُتبت"),
  ),
  title: z
    .string({ required_error: "عنوان المقال مطلوب" })
    .trim()
    .min(5, "عنوان المقال يجب أن يحتوي على 5 أحرف على الأقل"),
  summary: optionalText(),
  body: z
    .string({ required_error: "نص المقال مطلوب" })
    .trim()
    .min(20, "نص المقال يجب أن يحتوي على 20 حرفًا على الأقل"),
  socialUrl: optionalText(z.string().trim().url("الرابط الاجتماعي غير صحيح")),
  allowPublish: z.coerce.boolean().default(true),
  allowPhoto: z.coerce.boolean().default(false),
});

export const storySubmissionSchema = z.object({
  fullName: z.string().optional(),
  phone: z.string().optional(),
  email: z
    .string()
    .email("البريد الإلكتروني غير صحيح")
    .optional()
    .or(z.literal("")),
  isAnonymous: z.coerce.boolean().default(false),
  title: z.string().min(4, "عنوان القصة مطلوب"),
  body: z.string().min(20, "تفاصيل القصة يجب أن تكون أوضح"),
  allowPublish: z.coerce.boolean().default(false),
});

export const caseReportSchema = z.object({
  fullName: z.string().optional(),
  phone: z.string().optional(),
  email: z
    .string()
    .email("البريد الإلكتروني غير صحيح")
    .optional()
    .or(z.literal("")),
  title: z.string().min(4, "عنوان البلاغ مطلوب"),
  body: z.string().min(20, "تفاصيل البلاغ يجب أن تحتوي على 20 حرفًا على الأقل"),
  caseType: z.string().optional(),
  urgencyLevel: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يحتوي على حرفين على الأقل"),
  email: z
    .string()
    .email("البريد الإلكتروني غير صحيح")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, "الرسالة يجب أن تحتوي على 10 أحرف على الأقل"),
});
