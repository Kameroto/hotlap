import {
  Prisma,
  type Address,
} from "../generated/prisma/client.js";

import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";

import type {
  AddressBody,
  UpdateProfileBody,
} from "./account-schemas.js";

export type AccountProfileResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AddressResponse = {
  id: string;
  label: string | null;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

function toAddressResponse(
  address: Address,
): AddressResponse {
  return {
    id: address.id,
    label: address.label,
    recipientName:
      address.recipientName,
    phone: address.phone,
    addressLine1:
      address.addressLine1,
    addressLine2:
      address.addressLine2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    isDefault: address.isDefault,
    createdAt:
      address.createdAt.toISOString(),
    updatedAt:
      address.updatedAt.toISOString(),
  };
}

export async function getAccountProfile(
  userId: string,
): Promise<AccountProfileResponse> {
  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        emailVerifiedAt: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
    });

  if (!user || !user.isActive) {
    throw new ApiError({
      statusCode: 404,
      code: "USER_NOT_FOUND",
      message:
        "The authenticated user no longer exists.",
    });
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    emailVerifiedAt:
      user.emailVerifiedAt?.toISOString() ??
      null,
    createdAt:
      user.createdAt.toISOString(),
    updatedAt:
      user.updatedAt.toISOString(),
  };
}

export async function updateAccountProfile({
  userId,
  information,
}: {
  userId: string;
  information: UpdateProfileBody;
}): Promise<AccountProfileResponse> {
  try {
    await prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        firstName:
          information.firstName,
        lastName:
          information.lastName,
        phone: information.phone,
      },
    });
  } catch (error) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new ApiError({
        statusCode: 404,
        code: "USER_NOT_FOUND",
        message:
          "The authenticated user no longer exists.",
      });
    }

    throw error;
  }

  return getAccountProfile(userId);
}

export async function getAddresses(
  userId: string,
): Promise<{
  addresses: AddressResponse[];
  totalAddresses: number;
}> {
  const addresses =
    await prisma.address.findMany({
      where: {
        userId,
      },

      orderBy: [
        {
          isDefault: "desc",
        },
        {
          createdAt: "asc",
        },
      ],
    });

  return {
    addresses: addresses.map(
      toAddressResponse,
    ),
    totalAddresses:
      addresses.length,
  };
}

const maximumAddressTransactionAttempts = 3;
const maximumSavedAddresses = 5;

function addressTransactionCanBeRetried(
  error: unknown,
): boolean {
  return (
    error instanceof
      Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034"
  );
}

async function runSerializableAddressTransaction<T>(
  operation: (
    transaction: Prisma.TransactionClient,
  ) => Promise<T>,
): Promise<T> {
  for (
    let attempt = 1;
    attempt <=
    maximumAddressTransactionAttempts;
    attempt += 1
  ) {
    try {
      return await prisma.$transaction(
        operation,
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel
              .Serializable,
        },
      );
    } catch (error) {
      if (
        !addressTransactionCanBeRetried(
          error,
        ) ||
        attempt ===
          maximumAddressTransactionAttempts
      ) {
        throw error;
      }
    }
  }

  throw new Error(
    "The address transaction retry loop ended unexpectedly.",
  );
}

async function clearDefaultAddress(
  transaction: Prisma.TransactionClient,
  userId: string,
): Promise<void> {
  await transaction.address.updateMany({
    where: {
      userId,
      isDefault: true,
    },

    data: {
      isDefault: false,
    },
  });
}

export async function createAddress({
  userId,
  information,
}: {
  userId: string;
  information: AddressBody;
}): Promise<{
  address: AddressResponse;
}> {
  const address =
    await runSerializableAddressTransaction(
      async (transaction) => {
        const existingAddressCount =
          await transaction.address.count({
            where: {
              userId,
            },
          });

        if (
          existingAddressCount >=
          maximumSavedAddresses
        ) {
          throw new ApiError({
            statusCode: 409,
            code: "ADDRESS_LIMIT_REACHED",
            message:
              "You can save up to 5 addresses.",
          });
        }

        const shouldBeDefault =
          information.isDefault ||
          existingAddressCount === 0;

        if (shouldBeDefault) {
          await clearDefaultAddress(
            transaction,
            userId,
          );
        }

        return transaction.address.create({
          data: {
            userId,
            label:
              information.label ?? null,
            recipientName:
              information.recipientName,
            phone: information.phone,
            addressLine1:
              information.addressLine1,
            addressLine2:
              information.addressLine2 ??
              null,
            city: information.city,
            state: information.state,
            postalCode:
              information.postalCode,
            country:
              information.country,
            isDefault:
              shouldBeDefault,
          },
        });
      },
    );

  return {
    address:
      toAddressResponse(address),
  };
}

export async function updateAddress({
  userId,
  addressId,
  information,
}: {
  userId: string;
  addressId: string;
  information: AddressBody;
}): Promise<{
  address: AddressResponse;
}> {
  const address =
    await runSerializableAddressTransaction(
      async (transaction) => {
        const existingAddress =
          await transaction.address.findFirst({
            where: {
              id: addressId,
              userId,
            },
          });

        if (!existingAddress) {
          throw new ApiError({
            statusCode: 404,
            code: "ADDRESS_NOT_FOUND",
            message:
              "The requested address was not found.",
          });
        }

        if (information.isDefault) {
          await clearDefaultAddress(
            transaction,
            userId,
          );
        }

        return transaction.address.update({
          where: {
            id: addressId,
          },

          data: {
            label:
              information.label ?? null,
            recipientName:
              information.recipientName,
            phone: information.phone,
            addressLine1:
              information.addressLine1,
            addressLine2:
              information.addressLine2 ??
              null,
            city: information.city,
            state: information.state,
            postalCode:
              information.postalCode,
            country:
              information.country,

            isDefault:
              information.isDefault ||
              existingAddress.isDefault,
          },
        });
      },
    );

  return {
    address:
      toAddressResponse(address),
  };
}

export async function setDefaultAddress({
  userId,
  addressId,
}: {
  userId: string;
  addressId: string;
}): Promise<{
  address: AddressResponse;
}> {
  const address =
    await runSerializableAddressTransaction(
      async (transaction) => {
        const existingAddress =
          await transaction.address.findFirst({
            where: {
              id: addressId,
              userId,
            },
          });

        if (!existingAddress) {
          throw new ApiError({
            statusCode: 404,
            code: "ADDRESS_NOT_FOUND",
            message:
              "The requested address was not found.",
          });
        }

        await clearDefaultAddress(
          transaction,
          userId,
        );

        return transaction.address.update({
          where: {
            id: addressId,
          },

          data: {
            isDefault: true,
          },
        });
      },
    );

  return {
    address:
      toAddressResponse(address),
  };
}

export async function deleteAddress({
  userId,
  addressId,
}: {
  userId: string;
  addressId: string;
}): Promise<{
  message: string;
}> {
  await runSerializableAddressTransaction(
    async (transaction) => {
      const existingAddress =
        await transaction.address.findFirst({
          where: {
            id: addressId,
            userId,
          },
        });

      if (!existingAddress) {
        throw new ApiError({
          statusCode: 404,
          code: "ADDRESS_NOT_FOUND",
          message:
            "The requested address was not found.",
        });
      }

      await transaction.address.delete({
        where: {
          id: addressId,
        },
      });

      if (existingAddress.isDefault) {
        const nextAddress =
          await transaction.address.findFirst({
            where: {
              userId,
            },

            orderBy: {
              createdAt: "asc",
            },
          });

        if (nextAddress) {
          await transaction.address.update({
            where: {
              id: nextAddress.id,
            },

            data: {
              isDefault: true,
            },
          });
        }
      }
    },
  );

  return {
    message:
      "The address has been deleted.",
  };
}
