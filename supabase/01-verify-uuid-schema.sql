-- Verify that the rebuilt database uses UUID ids, not text ids.

with expected_tables(table_name) as (
  values
    ('Organization'), ('User'), ('Contributor'), ('Category'), ('Region'),
    ('Post'), ('PostSeo'), ('PostBlock'), ('PostRevision'), ('PostWorkflowEvent'),
    ('Tag'), ('PostTag'), ('PostStats'), ('PostView'), ('Comment'), ('PostReaction'),
    ('Bookmark'), ('Case'), ('CaseUpdate'), ('Submission'), ('ContactMessage'),
    ('Media'), ('PostMedia'), ('Page'), ('Menu'), ('MenuItem'), ('Redirect'),
    ('NewsletterSubscriber'), ('SocialLink'), ('SiteSetting'), ('ActivityLog'),
    ('TelegramDraft'), ('TelegramPublishLog')
)
select
  e.table_name,
  case when t.table_name is null then 'MISSING' else 'OK' end as table_status
from expected_tables e
left join information_schema.tables t
  on t.table_schema = 'public'
 and t.table_name = e.table_name
order by e.table_name;

-- Main primary id columns should be uuid.
select
  table_name,
  column_name,
  data_type,
  case when data_type = 'uuid' then 'OK' else 'NOT_UUID' end as uuid_status
from information_schema.columns
where table_schema = 'public'
  and column_name = 'id'
  and table_name in (
    'Organization','User','Contributor','Category','Region','Post','PostSeo','PostBlock',
    'PostRevision','PostWorkflowEvent','Tag','PostView','Comment','PostReaction','Bookmark',
    'Case','CaseUpdate','Submission','ContactMessage','Media','Page','Menu','MenuItem',
    'Redirect','NewsletterSubscriber','SocialLink','SiteSetting','ActivityLog','TelegramDraft','TelegramPublishLog'
  )
order by table_name;

-- Admin check.
select
  email,
  role,
  "isActive",
  pg_typeof(id) as id_type,
  case
    when "passwordHash" is null then 'NO_PASSWORD_HASH'
    when length("passwordHash") < 20 then 'INVALID_HASH'
    else 'OK'
  end as password_status,
  "createdAt"
from "User"
where email = 'mtzallqmy@gmail.com';
