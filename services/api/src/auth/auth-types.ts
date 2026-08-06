import type { UserRole } from "../generated/prisma/enums.js";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

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

export type AuthenticatedUser = AccessTokenPayload;