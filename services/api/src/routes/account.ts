import type {
  FastifyPluginAsync,
} from "fastify";

import { authenticateRequest } from "../auth/authenticate.js";

import {
  addressBodySchema,
  addressIdParamsSchema,
  updateProfileBodySchema,
  type AddressBody,
  type AddressIdParams,
  type UpdateProfileBody,
} from "../account/account-schemas.js";

import {
  createAddress,
  deleteAddress,
  getAccountProfile,
  getAddresses,
  setDefaultAddress,
  updateAccountProfile,
  updateAddress,
} from "../account/account-service.js";

import { ApiError } from "../utils/api-error.js";

export const accountRoutes: FastifyPluginAsync =
  async (app) => {
    app.addHook(
      "preHandler",
      authenticateRequest,
    );

    app.get(
      "/profile",
      async (request) => {
        return getAccountProfile(
          request.user.sub,
        );
      },
    );

    app.patch<{
      Body: UpdateProfileBody;
    }>(
      "/profile",
      async (request) => {
        const parsedBody =
          updateProfileBodySchema.safeParse(
            request.body,
          );

        if (!parsedBody.success) {
          throw new ApiError({
            statusCode: 400,
            code:
              "INVALID_PROFILE_INFORMATION",
            message:
              "The profile information is invalid.",
            details:
              parsedBody.error.flatten()
                .fieldErrors,
          });
        }

        return updateAccountProfile({
          userId:
            request.user.sub,
          information:
            parsedBody.data,
        });
      },
    );

    app.get(
      "/addresses",
      async (request) => {
        return getAddresses(
          request.user.sub,
        );
      },
    );

    app.post<{
      Body: AddressBody;
    }>(
      "/addresses",
      async (request, reply) => {
        const parsedBody =
          addressBodySchema.safeParse(
            request.body,
          );

        if (!parsedBody.success) {
          throw new ApiError({
            statusCode: 400,
            code:
              "INVALID_ADDRESS_INFORMATION",
            message:
              "The address information is invalid.",
            details:
              parsedBody.error.flatten()
                .fieldErrors,
          });
        }

        const response =
          await createAddress({
            userId:
              request.user.sub,
            information:
              parsedBody.data,
          });

        return reply
          .code(201)
          .send(response);
      },
    );

    app.put<{
      Params: AddressIdParams;
      Body: AddressBody;
    }>(
      "/addresses/:addressId",
      async (request) => {
        const parsedParams =
          addressIdParamsSchema.safeParse(
            request.params,
          );

        const parsedBody =
          addressBodySchema.safeParse(
            request.body,
          );

        if (
          !parsedParams.success ||
          !parsedBody.success
        ) {
          throw new ApiError({
            statusCode: 400,
            code:
              "INVALID_ADDRESS_INFORMATION",
            message:
              "The address information is invalid.",
          });
        }

        return updateAddress({
          userId:
            request.user.sub,
          addressId:
            parsedParams.data.addressId,
          information:
            parsedBody.data,
        });
      },
    );

    app.patch<{
      Params: AddressIdParams;
    }>(
      "/addresses/:addressId/default",
      async (request) => {
        const parsedParams =
          addressIdParamsSchema.safeParse(
            request.params,
          );

        if (!parsedParams.success) {
          throw new ApiError({
            statusCode: 400,
            code:
              "INVALID_ADDRESS_ID",
            message:
              "The address ID is invalid.",
          });
        }

        return setDefaultAddress({
          userId:
            request.user.sub,
          addressId:
            parsedParams.data.addressId,
        });
      },
    );

    app.delete<{
      Params: AddressIdParams;
    }>(
      "/addresses/:addressId",
      async (request) => {
        const parsedParams =
          addressIdParamsSchema.safeParse(
            request.params,
          );

        if (!parsedParams.success) {
          throw new ApiError({
            statusCode: 400,
            code:
              "INVALID_ADDRESS_ID",
            message:
              "The address ID is invalid.",
          });
        }

        return deleteAddress({
          userId:
            request.user.sub,
          addressId:
            parsedParams.data.addressId,
        });
      },
    );
  };