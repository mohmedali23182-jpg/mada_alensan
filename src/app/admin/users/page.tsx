import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { AdminSection, StatusBadge } from "@/components/admin/AdminCards";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { prisma } from "@/lib/prisma";
import { safeAdminQuery } from "@/lib/admin-safe";
import { formatMakkahDateTime } from "@/lib/date";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function saveUser(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "EDITOR") as never;
  const isActive = formData.get("isActive") === "on";
  if (!name || !email) throw new Error("الاسم والبريد مطلوبان");
  const data: any = { name, email, role, isActive };
  if (password) data.passwordHash = await bcrypt.hash(password, 12);
  if (!id && !password) throw new Error("كلمة المرور مطلوبة عند إنشاء مستخدم جديد");
  if (id) await prisma.user.update({ where: { id }, data });
  else await prisma.user.upsert({ where: { email }, update: data, create: data });
  revalidatePath("/admin/users");
}

export default async function AdminUsersPage() {
  const users = await safeAdminQuery(
    "users-list",
    () => prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 50, select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true } }),
    [] as Array<any>,
  );

  return (
    <div className="space-y-6">
      <AdminSection title="إضافة مستخدم" description="أضف محررًا أو مراجعًا أو مديرًا. لا تحفظ كلمات المرور كنص صريح، بل تُشفّر قبل الحفظ.">
        <form action={saveUser} className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input name="name" required placeholder="الاسم" className="input-field" />
          <input name="email" required type="email" placeholder="البريد" className="input-field" />
          <input name="password" required type="password" placeholder="كلمة المرور" className="input-field" />
          <select name="role" className="input-field"><option value="OWNER">OWNER</option><option value="ADMIN">ADMIN</option><option value="EDITOR">EDITOR</option><option value="REVIEWER">REVIEWER</option><option value="CONTRIBUTOR">CONTRIBUTOR</option><option value="FIELD_REPORTER">FIELD_REPORTER</option><option value="VIEWER">VIEWER</option></select>
          <label className="rounded-xl bg-ivory-light px-4 py-3 text-sm font-bold"><input name="isActive" type="checkbox" defaultChecked /> نشط</label>
          <SubmitButton>حفظ المستخدم</SubmitButton>
        </form>
      </AdminSection>

      <AdminSection title="المستخدمون والصلاحيات" description="مستخدمون فعليون من قاعدة البيانات.">
        <div className="space-y-4">
          {users.length ? users.map((user) => (
            <div key={user.id} className="rounded-3xl bg-ivory-light p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div><h3 className="font-bold">{user.name}</h3><p className="text-sm text-navy/60">{user.email} • أنشئ {formatMakkahDateTime(user.createdAt)}</p></div>
                <StatusBadge tone={user.isActive ? "success" : "danger"}>{user.role}</StatusBadge>
              </div>
              <form action={saveUser} className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <input type="hidden" name="id" value={user.id} />
                <input name="name" defaultValue={user.name} className="input-field" />
                <input name="email" type="email" defaultValue={user.email} className="input-field" />
                <input name="password" type="password" placeholder="اتركها فارغة لعدم التغيير" className="input-field" />
                <select name="role" defaultValue={user.role} className="input-field"><option value="OWNER">OWNER</option><option value="ADMIN">ADMIN</option><option value="EDITOR">EDITOR</option><option value="REVIEWER">REVIEWER</option><option value="CONTRIBUTOR">CONTRIBUTOR</option><option value="FIELD_REPORTER">FIELD_REPORTER</option><option value="VIEWER">VIEWER</option></select>
                <label className="rounded-xl bg-white px-4 py-3 text-sm font-bold"><input name="isActive" type="checkbox" defaultChecked={user.isActive} /> نشط</label>
                <SubmitButton>تحديث</SubmitButton>
              </form>
            </div>
          )) : <p className="rounded-2xl bg-ivory-light p-5 text-sm font-bold text-navy/60">لا يوجد مستخدمون بعد.</p>}
        </div>
      </AdminSection>
    </div>
  );
}
