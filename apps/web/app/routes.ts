type PublicRoute = {
  login: string;
  register: string;
  verifyEmail: string;
  forgotPassword: string;
  resetPassword: string;
};

type PrivateRoute = {
  home: string;
};

type AllRoutes = PublicRoute & PrivateRoute;

export const PUBLIC_ROUTES: PublicRoute = {
  login: "/login",
  register: "/register",
  verifyEmail: "/verify-email",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
};

export const PRIVATE_ROUTES: PrivateRoute = {
  home: "/",
};

export const ALL_ROUTES: AllRoutes = {
  ...PUBLIC_ROUTES,
  ...PRIVATE_ROUTES,
};
