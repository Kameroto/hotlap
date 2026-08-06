export type UserRole =
  | "CUSTOMER"
  | "ADMIN"
  | "STAFF";

export type PublicUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
  emailVerifiedAt: string | null;
  createdAt: string;
};

export type AuthenticationResponse = {
  accessToken: string;
  user: PublicUser;
};

export type CurrentUserResponse = {
  user: PublicUser;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

export type ApiErrorResponse = {
  statusCode: number;
  error: string;
  code: string;
  message: string;
  details?: unknown;
};

export type LogoutResponse = {
  message: string;
};