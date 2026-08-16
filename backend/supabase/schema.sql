-- Esquema para proyecto-academico. Ejecutar una sola vez en el SQL Editor de Supabase.
create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  first_name text not null,
  last_name text not null,
  role text not null check (role in ('ADMIN', 'ESTUDIANTE')) default 'ESTUDIANTE',
  status text not null check (status in ('ACTIVO', 'INACTIVO')) default 'ACTIVO',
  created_at timestamptz not null default now()
);

create table if not exists refresh_tokens (
  token uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists password_reset_tokens (
  token uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  code text primary key,
  label text not null
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null references categories(code),
  status text not null check (status in ('BORRADOR', 'PUBLICADO', 'ARCHIVADO')) default 'BORRADOR',
  max_seats int not null,
  start_date date not null,
  end_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  status text not null check (status in ('PENDIENTE', 'ACTIVA', 'COMPLETADA', 'CANCELADA')) default 'PENDIENTE',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references course_modules(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  type text not null check (type in ('PDF', 'VIDEO')),
  file_key text not null,
  original_name text not null,
  mime_type text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_enrollments_user on enrollments(user_id);
create index if not exists idx_enrollments_course on enrollments(course_id, status);
create index if not exists idx_courses_category on courses(category);
create index if not exists idx_courses_status on courses(status);
create index if not exists idx_modules_course on course_modules(course_id);
create index if not exists idx_lessons_module on lessons(module_id);

-- RLS habilitado sin policies públicas: solo la service_role key (usada por el Worker) puede leer/escribir.
alter table users enable row level security;
alter table refresh_tokens enable row level security;
alter table password_reset_tokens enable row level security;
alter table categories enable row level security;
alter table courses enable row level security;
alter table enrollments enable row level security;
alter table course_modules enable row level security;
alter table lessons enable row level security;
