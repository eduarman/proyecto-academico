-- Datos semilla, equivalentes a los arrays hardcodeados del backend anterior.
-- Ejecutar una sola vez, después de schema.sql.

insert into users (id, email, password_hash, first_name, last_name, role, status) values
  ('a0000000-0000-4000-8000-000000000001', 'admin@academia.com', '$2a$10$jMzzzDX5ySTaItq8KI9vOua/zy7WAimT.r4llBImGU3un9m5Qx4IG', 'Admin', 'Sistema', 'ADMIN', 'ACTIVO'),
  ('a0000000-0000-4000-8000-000000000002', 'estudiante@academia.com', '$2a$10$z55BMDmFS0ShGrk3ZKZ6EeCncd1FCpyRT53laWUwyc8xnp8GC7kqG', 'Ana', 'García', 'ESTUDIANTE', 'ACTIVO')
on conflict (email) do nothing;

insert into categories (code, label) values
  ('OFFICE', 'Office'),
  ('SQL', 'SQL'),
  ('ANALISIS_DATOS', 'Análisis de Datos'),
  ('MARKETING', 'Marketing')
on conflict (code) do nothing;

insert into courses (id, title, category, status, max_seats, start_date, end_date) values
  ('c0000000-0000-4000-8000-000000000001', 'Excel Avanzado', 'OFFICE', 'PUBLICADO', 20, '2026-09-01', '2026-09-15'),
  ('c0000000-0000-4000-8000-000000000002', 'SQL para análisis', 'SQL', 'BORRADOR', 15, '2026-10-01', '2026-10-20')
on conflict (id) do nothing;

insert into enrollments (id, user_id, course_id, status, created_at) values
  ('e0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001', 'PENDIENTE', '2026-08-01T00:00:00.000Z')
on conflict (id) do nothing;

-- Credenciales de prueba:
--   admin@academia.com / Admin123
--   estudiante@academia.com / Estudiante123
