export type Bindings = {
  ENVIRONMENT: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  JWT_SECRET: string;
  FRONTEND_ORIGIN: string;
};

export type RequestUser = {
  id: string;
  email: string;
  role: 'ADMIN' | 'ESTUDIANTE';
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: {
    user?: RequestUser;
  };
};
