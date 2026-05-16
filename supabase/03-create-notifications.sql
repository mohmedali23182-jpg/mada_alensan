-- Optional helper SQL for push notifications.
-- Prefer Prisma as the source of truth: npx prisma db push --accept-data-loss
-- Use this file only if you need to create notification tables manually in Supabase SQL Editor.

create table if not exists public."PushDevice" (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  platform text not null default 'android',
  enabled boolean not null default true,
  "appVersion" text,
  locale text default 'ar',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "lastSeenAt" timestamptz,
  "userId" uuid references public."User"(id) on delete set null
);

create index if not exists "PushDevice_userId_idx" on public."PushDevice"("userId");
create index if not exists "PushDevice_enabled_idx" on public."PushDevice"(enabled);
create index if not exists "PushDevice_platform_idx" on public."PushDevice"(platform);

create table if not exists public."Notification" (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  type text not null default 'SYSTEM',
  url text,
  "imageUrl" text,
  status text not null default 'SENT',
  target text default 'ALL',
  "sentCount" integer not null default 0,
  "failedCount" integer not null default 0,
  error text,
  "createdAt" timestamptz not null default now(),
  "sentAt" timestamptz
);

create index if not exists "Notification_type_idx" on public."Notification"(type);
create index if not exists "Notification_status_idx" on public."Notification"(status);
create index if not exists "Notification_createdAt_idx" on public."Notification"("createdAt");

create table if not exists public."NotificationPreference" (
  id uuid primary key default gen_random_uuid(),
  "deviceToken" text unique,
  "enableAll" boolean not null default true,
  "newArticles" boolean not null default true,
  "breakingNews" boolean not null default true,
  updates boolean not null default true,
  "systemMessages" boolean not null default true,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "userId" uuid references public."User"(id) on delete set null
);

create index if not exists "NotificationPreference_userId_idx" on public."NotificationPreference"("userId");
create index if not exists "NotificationPreference_enableAll_idx" on public."NotificationPreference"("enableAll");
