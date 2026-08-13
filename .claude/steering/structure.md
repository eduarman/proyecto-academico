# Structure Steering — Organización del proyecto

## Layout raíz (monorepo)
```
proyecto-academico/
├── .claude/
│   ├── steering/         # product.md, tech.md, structure.md (este archivo)
│   ├── specs/            # requirements.md + design.md por módulo funcional
│   └── tasks/            # checklist de implementación por módulo + roadmap.md
├── frontend/              # Vue 3 + Vite
├── backend/               # NestJS
├── docker-compose.yml
├── .env.example
└── README.md
```

## Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/        # botones, inputs, modal, tabla, paginación
│   │   ├── layout/         # AppHeader, AppSidebar, AdminLayout, UserLayout
│   │   ├── auth/            # LoginForm, RegisterForm, ForgotPasswordForm
│   │   ├── courses/         # CourseCard, CourseForm, CourseFilters
│   │   ├── enrollments/     # EnrollmentTable, EnrollmentStatusBadge
│   │   └── users/           # UserTable, UserForm, RoleSelect
│   ├── views/
│   │   ├── auth/             # LoginView, RegisterView
│   │   ├── admin/            # AdminDashboardView, AdminCoursesView, AdminCourseEnrollmentsView, AdminUsersView
│   │   └── user/              # CatalogView, MyCoursesView, ProfileView, CourseDetailView
│   ├── router/
│   │   ├── index.ts
│   │   ├── guards.ts        # requireAuth, requireRole
│   │   └── routes/           # auth.routes.ts, admin.routes.ts, user.routes.ts
│   ├── stores/               # Pinia: auth.store.ts, courses.store.ts, enrollments.store.ts, users.store.ts
│   ├── services/              # http.ts (axios instance), auth.service.ts, courses.service.ts, enrollments.service.ts, users.service.ts
│   ├── composables/           # useAuth.ts, usePermissions.ts, useForm.ts
│   ├── types/                  # user.types.ts, course.types.ts, enrollment.types.ts
│   ├── styles/                  # SCSS 7-1: abstracts/, base/, components/, layout/, pages/, themes/, main.scss
│   ├── App.vue
│   └── main.ts
├── vite.config.ts
└── package.json
```

## Backend (`/backend`)
```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/            # auth.module.ts, auth.controller.ts, auth.service.ts, strategies/, dto/
│   │   ├── users/            # users.module.ts, users.controller.ts, users.service.ts, dto/
│   │   ├── roles/            # roles.module.ts (seed + lookup de roles)
│   │   ├── courses/          # courses.module.ts, courses.controller.ts, courses.service.ts, dto/
│   │   └── enrollments/       # enrollments.module.ts, enrollments.controller.ts, enrollments.service.ts, dto/
│   ├── common/
│   │   ├── decorators/         # roles.decorator.ts, current-user.decorator.ts
│   │   ├── guards/              # jwt-auth.guard.ts, roles.guard.ts
│   │   ├── filters/              # http-exception.filter.ts
│   │   ├── interceptors/          # transform-response.interceptor.ts
│   │   └── pipes/                  # validation config global
│   ├── config/                      # env validation (Joi/Zod), configuración tipada
│   ├── prisma/                       # schema.prisma, migrations/, seed.ts
│   ├── app.module.ts
│   └── main.ts
├── test/                              # e2e (Supertest)
└── package.json
```

## Convenciones de nombres
- Carpetas de módulo/spec en **kebab-case** (`gestion-cursos`, `panel-administrador`).
- Componentes Vue en **PascalCase** (`CourseCard.vue`).
- Composables con prefijo `use` (`useAuth.ts`).
- Servicios/stores con sufijo explícito (`courses.service.ts`, `courses.store.ts`).
- Rutas del backend en plural y kebab/lowercase (`/api/courses`, `/api/enrollments`).

## Relación specs ↔ código
Cada carpeta en `.claude/specs/<modulo>/` (requirements + design) debe poder mapearse a:
- Un módulo de backend en `backend/src/modules/<modulo>`.
- Un conjunto de vistas/componentes/store en `frontend/src/{views,components,stores}/<modulo>`.
- Un checklist en `.claude/tasks/<modulo>.md`.

Si un módulo crece y dejan de corresponder 1:1, se actualiza este documento antes de seguir agregando código (evitar drift entre specs y estructura real).
