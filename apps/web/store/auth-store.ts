import { create } from "zustand";

import {
  hydrateAuthentication,
  loginUser,
  logoutUser,
  registerUser,
  setTerminalAuthenticationFailureHandler,
  updateAccountProfile,
} from "@/lib/api/client";

import type {
  LoginRequest,
  PublicUser,
  RegisterRequest,
  UpdateProfileRequest,
} from "@/lib/api/types";

type AuthenticationStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

type AuthState = {
  user: PublicUser | null;
  status: AuthenticationStatus;
  hasInitialized: boolean;
  initializationError: string | null;

  initialize: () => Promise<void>;

  login: (
    credentials: LoginRequest,
  ) => Promise<PublicUser>;

  register: (
    information: RegisterRequest,
  ) => Promise<PublicUser>;

  updateProfile: (
    information: UpdateProfileRequest,
  ) => Promise<PublicUser>;

  logout: () => Promise<void>;

  setUser: (
    user: PublicUser | null,
  ) => void;
};

let initializationPromise:
  | Promise<void>
  | null = null;

export const useAuthStore =
  create<AuthState>()((set, get) => ({
    user: null,
    status: "idle",
    hasInitialized: false,
    initializationError: null,

    initialize: async () => {
      if (get().hasInitialized) {
        return;
      }

      if (initializationPromise) {
        return initializationPromise;
      }

      initializationPromise =
        (async () => {
          set({
            status: "loading",
            initializationError: null,
          });

          try {
            const authentication =
              await hydrateAuthentication();

            if (!authentication) {
              set({
                user: null,
                status: "unauthenticated",
                hasInitialized: true,
                initializationError: null,
              });

              return;
            }

            set({
              user: authentication.user,
              status: "authenticated",
              hasInitialized: true,
              initializationError: null,
            });
          } catch (error) {
            set({
              user: null,
              status: "error",
              hasInitialized: false,
              initializationError:
                "We could not verify your session. Check your connection and try again.",
            });

            throw error;
          } finally {
            initializationPromise =
              null;
          }
        })();

      return initializationPromise;
    },

    login: async (credentials) => {
      set({
        status: "loading",
        initializationError: null,
      });

      try {
        const authentication =
          await loginUser(credentials);

        set({
          user: authentication.user,
          status: "authenticated",
          hasInitialized: true,
          initializationError: null,
        });

        return authentication.user;
      } catch (error) {
        set({
          user: null,
          status: "unauthenticated",
          hasInitialized: true,
          initializationError: null,
        });

        throw error;
      }
    },

    register: async (information) => {
      set({
        status: "loading",
        initializationError: null,
      });

      try {
        const authentication =
          await registerUser(
            information,
          );

        set({
          user: authentication.user,
          status: "authenticated",
          hasInitialized: true,
          initializationError: null,
        });

        return authentication.user;
      } catch (error) {
        set({
          user: null,
          status: "unauthenticated",
          hasInitialized: true,
          initializationError: null,
        });

        throw error;
      }
    },

    updateProfile: async (
      information,
    ) => {
      const profile =
        await updateAccountProfile(
          information,
        );

      const updatedUser: PublicUser = {
        id: profile.id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        role: profile.role,
        emailVerifiedAt:
          profile.emailVerifiedAt,
        createdAt: profile.createdAt,
      };

      set({
        user: updatedUser,
        status: "authenticated",
        hasInitialized: true,
        initializationError: null,
      });

      return updatedUser;
    },

    logout: async () => {
      try {
        await logoutUser();
      } finally {
        set({
          user: null,
          status: "unauthenticated",
          hasInitialized: true,
          initializationError: null,
        });
      }
    },

    setUser: (user) => {
      set({
        user,
        status: user
          ? "authenticated"
          : "unauthenticated",
        hasInitialized: true,
        initializationError: null,
      });
    },
  }));

setTerminalAuthenticationFailureHandler(
  () => {
    useAuthStore.setState({
      user: null,
      status: "unauthenticated",
      hasInitialized: true,
      initializationError: null,
    });
  },
);
