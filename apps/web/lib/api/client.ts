import type {
  AccountProfile,
  AddCartItemRequest,
  AddWishlistItemRequest,
  AddressRequest,
  AddressResponse,
  AddressesResponse,
  ApiErrorResponse,
  ApplyCartCouponRequest,
  AuthenticationResponse,
  CurrentUserResponse,
  FeaturedProductsResponse,
  LoginRequest,
  LogoutResponse,
  MessageResponse,
  ProductDetailsResponse,
  ProductListResponse,
  RegisterRequest,
  ServerCart,
  UpdateCartItemRequest,
  UpdateProfileRequest,
  WishlistResponse,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000/api/v1";

export const GUEST_CART_TOKEN_STORAGE_KEY =
  "hotlap-guest-cart-token";

let accessToken: string | null = null;

let terminalAuthenticationFailureHandler:
  | (() => void)
  | null = null;

export function setTerminalAuthenticationFailureHandler(
  handler: (() => void) | null,
): void {
  terminalAuthenticationFailureHandler =
    handler;
}

function handleTerminalAuthenticationFailure(): void {
  setAccessToken(null);
  terminalAuthenticationFailureHandler?.();
}

export class ApiClientError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor({
    statusCode,
    code,
    message,
    details,
  }: {
    statusCode: number;
    code: string;
    message: string;
    details?: unknown;
  }) {
    super(message);

    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.code = code;

    if (details !== undefined) {
      this.details = details;
    }
  }
}

type ApiRequestOptions = {
  includeAuthentication?: boolean;
  includeCartToken?: boolean;
  retryAfterRefresh?: boolean;
};

export type ProductSortApiValue =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "name";

export type ProductListQuery = {
  search?: string;
  category?: string;
  brand?: string;
  minimumPrice?: number;
  maximumPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  sort?: ProductSortApiValue;
  page?: number;
  pageSize?: number;
};

function getStoredGuestCartToken():
  | string
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(
    GUEST_CART_TOKEN_STORAGE_KEY,
  );
}

export function setStoredGuestCartToken(
  token: string,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    GUEST_CART_TOKEN_STORAGE_KEY,
    token,
  );
}

export function clearStoredGuestCartToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(
    GUEST_CART_TOKEN_STORAGE_KEY,
  );
}

export function getAccessToken():
  | string
  | null {
  return accessToken;
}

function setAccessToken(
  nextAccessToken: string | null,
): void {
  accessToken = nextAccessToken;
}

async function readResponseBody(
  response: Response,
): Promise<unknown> {
  const contentType =
    response.headers.get(
      "content-type",
    );

  if (
    !contentType?.includes(
      "application/json",
    )
  ) {
    return null;
  }

  return response.json();
}

function createApiError(
  response: Response,
  responseBody: unknown,
): ApiClientError {
  if (
    responseBody &&
    typeof responseBody === "object" &&
    "message" in responseBody &&
    typeof responseBody.message ===
      "string"
  ) {
    const apiError =
      responseBody as ApiErrorResponse;

    return new ApiClientError({
      statusCode:
        response.status,

      code:
        typeof apiError.code ===
        "string"
          ? apiError.code
          : "REQUEST_FAILED",

      message:
        apiError.message,

      details:
        apiError.details,
    });
  }

  return new ApiClientError({
    statusCode:
      response.status,

    code:
      "REQUEST_FAILED",

    message:
      response.statusText ||
      "The request could not be completed.",
  });
}

async function performRequest<T>(
  path: string,
  requestInit: RequestInit,
  options: ApiRequestOptions,
): Promise<T> {
  const headers = new Headers(
    requestInit.headers,
  );

  if (
    requestInit.body &&
    !(
      requestInit.body instanceof
      FormData
    ) &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  if (
    options.includeAuthentication !==
      false &&
    accessToken
  ) {
    headers.set(
      "Authorization",
      `Bearer ${accessToken}`,
    );
  }

  if (
    options.includeCartToken
  ) {
    const guestCartToken =
      getStoredGuestCartToken();

    if (guestCartToken) {
      headers.set(
        "X-Cart-Token",
        guestCartToken,
      );
    }
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...requestInit,
      headers,
      credentials: "include",
    },
  );

  const returnedCartToken =
    response.headers.get(
      "X-Cart-Token",
    );

  if (returnedCartToken) {
    setStoredGuestCartToken(
      returnedCartToken,
    );
  }

  const responseBody =
    await readResponseBody(
      response,
    );

  if (!response.ok) {
    throw createApiError(
      response,
      responseBody,
    );
  }

  return responseBody as T;
}

async function refreshSessionRequest(): Promise<
  AuthenticationResponse
> {
  const response =
    await performRequest<AuthenticationResponse>(
      "/auth/refresh",
      {
        method: "POST",
      },
      {
        includeAuthentication:
          false,

        retryAfterRefresh:
          false,
      },
    );

  setAccessToken(
    response.accessToken,
  );

  return response;
}

export async function apiRequest<T>(
  path: string,
  requestInit: RequestInit = {},
  options: ApiRequestOptions = {},
): Promise<T> {
  const retryAfterRefresh =
    options.retryAfterRefresh ??
    true;

  try {
    return await performRequest<T>(
      path,
      requestInit,
      options,
    );
  } catch (error) {
    const shouldRefresh =
      error instanceof
        ApiClientError &&
      error.statusCode === 401 &&
      options.includeAuthentication !==
        false &&
      retryAfterRefresh;

    if (!shouldRefresh) {
      throw error;
    }

    try {
      await refreshSessionRequest();
    } catch (refreshError) {
      if (
        refreshError instanceof ApiClientError &&
        refreshError.statusCode === 401
      ) {
        handleTerminalAuthenticationFailure();
      }

      throw refreshError;
    }

    try {
      return await performRequest<T>(
        path,
        requestInit,
        {
          ...options,

          retryAfterRefresh:
            false,
        },
      );
    } catch (retryError) {
      if (
        retryError instanceof ApiClientError &&
        retryError.statusCode === 401
      ) {
        handleTerminalAuthenticationFailure();
      }

      throw retryError;
    }
  }
}

function buildProductQueryString(
  query: ProductListQuery,
): string {
  const searchParams =
    new URLSearchParams();

  if (
    query.search?.trim()
  ) {
    searchParams.set(
      "search",
      query.search.trim(),
    );
  }

  if (
    query.category?.trim()
  ) {
    searchParams.set(
      "category",
      query.category.trim(),
    );
  }

  if (
    query.brand?.trim()
  ) {
    searchParams.set(
      "brand",
      query.brand.trim(),
    );
  }

  if (
    query.minimumPrice !==
    undefined
  ) {
    searchParams.set(
      "minimumPrice",
      String(
        query.minimumPrice,
      ),
    );
  }

  if (
    query.maximumPrice !==
    undefined
  ) {
    searchParams.set(
      "maximumPrice",
      String(
        query.maximumPrice,
      ),
    );
  }

  if (
    query.inStock !==
    undefined
  ) {
    searchParams.set(
      "inStock",
      String(query.inStock),
    );
  }

  if (
    query.featured !==
    undefined
  ) {
    searchParams.set(
      "featured",
      String(
        query.featured,
      ),
    );
  }

  if (query.sort) {
    searchParams.set(
      "sort",
      query.sort,
    );
  }

  if (
    query.page !==
    undefined
  ) {
    searchParams.set(
      "page",
      String(query.page),
    );
  }

  if (
    query.pageSize !==
    undefined
  ) {
    searchParams.set(
      "pageSize",
      String(
        query.pageSize,
      ),
    );
  }

  const queryString =
    searchParams.toString();

  return queryString
    ? `?${queryString}`
    : "";
}

export async function getProducts(
  query: ProductListQuery = {},
): Promise<ProductListResponse> {
  const queryString =
    buildProductQueryString(
      query,
    );

  return apiRequest<ProductListResponse>(
    `/products${queryString}`,
    {},
    {
      includeAuthentication:
        false,

      retryAfterRefresh:
        false,
    },
  );
}

export async function getFeaturedProducts(
  limit = 6,
): Promise<FeaturedProductsResponse> {
  const searchParams =
    new URLSearchParams({
      limit: String(limit),
    });

  return apiRequest<FeaturedProductsResponse>(
    `/products/featured?${searchParams.toString()}`,
    {},
    {
      includeAuthentication:
        false,

      retryAfterRefresh:
        false,
    },
  );
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetailsResponse> {
  return apiRequest<ProductDetailsResponse>(
    `/products/${encodeURIComponent(
      slug,
    )}`,
    {},
    {
      includeAuthentication:
        false,

      retryAfterRefresh:
        false,
    },
  );
}

export async function getCart(): Promise<
  ServerCart
> {
  return apiRequest<ServerCart>(
    "/cart",
    {},
    {
      includeCartToken:
        true,
    },
  );
}

export async function addCartItem(
  request: AddCartItemRequest,
): Promise<ServerCart> {
  return apiRequest<ServerCart>(
    "/cart/items",
    {
      method: "POST",

      body:
        JSON.stringify(
          request,
        ),
    },
    {
      includeCartToken:
        true,
    },
  );
}

export async function updateCartItem(
  productId: string,
  request: UpdateCartItemRequest,
): Promise<ServerCart> {
  return apiRequest<ServerCart>(
    `/cart/items/${encodeURIComponent(
      productId,
    )}`,
    {
      method: "PATCH",

      body:
        JSON.stringify(
          request,
        ),
    },
    {
      includeCartToken:
        true,
    },
  );
}

export async function removeCartItem(
  productId: string,
): Promise<ServerCart> {
  return apiRequest<ServerCart>(
    `/cart/items/${encodeURIComponent(
      productId,
    )}`,
    {
      method: "DELETE",
    },
    {
      includeCartToken:
        true,
    },
  );
}

export async function applyCartCoupon(
  request: ApplyCartCouponRequest,
): Promise<ServerCart> {
  return apiRequest<ServerCart>(
    "/cart/coupon",
    {
      method: "POST",

      body:
        JSON.stringify(
          request,
        ),
    },
    {
      includeCartToken:
        true,
    },
  );
}

export async function removeCartCoupon(): Promise<
  ServerCart
> {
  return apiRequest<ServerCart>(
    "/cart/coupon",
    {
      method: "DELETE",
    },
    {
      includeCartToken:
        true,
    },
  );
}

export async function getWishlist(): Promise<
  WishlistResponse
> {
  return apiRequest<WishlistResponse>(
    "/wishlist",
  );
}

export async function addWishlistItem(
  request: AddWishlistItemRequest,
): Promise<WishlistResponse> {
  return apiRequest<WishlistResponse>(
    "/wishlist/items",
    {
      method: "POST",

      body:
        JSON.stringify(
          request,
        ),
    },
  );
}

export async function removeWishlistItem(
  productId: string,
): Promise<WishlistResponse> {
  return apiRequest<WishlistResponse>(
    `/wishlist/items/${encodeURIComponent(
      productId,
    )}`,
    {
      method: "DELETE",
    },
  );
}

async function mergeStoredGuestCart(): Promise<void> {
  const guestCartToken =
    getStoredGuestCartToken();

  if (!guestCartToken) {
    return;
  }

  try {
    await apiRequest(
      "/cart/merge",
      {
        method: "POST",

        body:
          JSON.stringify({
            guestCartToken,
          }),
      },
      {
        retryAfterRefresh:
          false,
      },
    );

    clearStoredGuestCartToken();
  } catch (error) {
    const cartNoLongerExists =
      error instanceof
        ApiClientError &&
      error.code ===
        "GUEST_CART_NOT_FOUND";

    if (
      cartNoLongerExists
    ) {
      clearStoredGuestCartToken();

      return;
    }

    throw error;
  }
}

async function completeAuthentication(
  response: AuthenticationResponse,
): Promise<AuthenticationResponse> {
  setAccessToken(
    response.accessToken,
  );

  try {
    await mergeStoredGuestCart();
  } catch (error) {
    console.error(
      "Guest cart merge failed:",
      error,
    );
  }

  return response;
}

export async function loginUser(
  request: LoginRequest,
): Promise<AuthenticationResponse> {
  const response =
    await performRequest<AuthenticationResponse>(
      "/auth/login",
      {
        method: "POST",

        body:
          JSON.stringify(
            request,
          ),
      },
      {
        includeAuthentication:
          false,

        retryAfterRefresh:
          false,
      },
    );

  return completeAuthentication(
    response,
  );
}

export async function registerUser(
  request: RegisterRequest,
): Promise<AuthenticationResponse> {
  const response =
    await performRequest<AuthenticationResponse>(
      "/auth/register",
      {
        method: "POST",

        body:
          JSON.stringify(
            request,
          ),
      },
      {
        includeAuthentication:
          false,

        retryAfterRefresh:
          false,
      },
    );

  return completeAuthentication(
    response,
  );
}

export async function hydrateAuthentication(): Promise<
  AuthenticationResponse | null
> {
  try {
    return await refreshSessionRequest();
  } catch (error) {
    setAccessToken(null);

    if (
      error instanceof
        ApiClientError &&
      error.statusCode === 401
    ) {
      return null;
    }

    throw error;
  }
}

export async function getCurrentUser(): Promise<
  CurrentUserResponse
> {
  return apiRequest<CurrentUserResponse>(
    "/auth/me",
  );
}

export async function logoutUser(): Promise<void> {
  try {
    await performRequest<LogoutResponse>(
      "/auth/logout",
      {
        method: "POST",
      },
      {
        includeAuthentication:
          false,

        retryAfterRefresh:
          false,
      },
    );
  } finally {
    setAccessToken(null);
  }
}

export async function getAccountProfile(): Promise<
  AccountProfile
> {
  return apiRequest<AccountProfile>(
    "/account/profile",
  );
}

export async function updateAccountProfile(
  request: UpdateProfileRequest,
): Promise<AccountProfile> {
  return apiRequest<AccountProfile>(
    "/account/profile",
    {
      method: "PATCH",

      body:
        JSON.stringify(
          request,
        ),
    },
  );
}

export async function getAccountAddresses(): Promise<
  AddressesResponse
> {
  return apiRequest<AddressesResponse>(
    "/account/addresses",
  );
}

export async function createAccountAddress(
  request: AddressRequest,
): Promise<AddressResponse> {
  return apiRequest<AddressResponse>(
    "/account/addresses",
    {
      method: "POST",

      body:
        JSON.stringify(
          request,
        ),
    },
  );
}

export async function updateAccountAddress(
  addressId: string,
  request: AddressRequest,
): Promise<AddressResponse> {
  return apiRequest<AddressResponse>(
    `/account/addresses/${addressId}`,
    {
      method: "PUT",

      body:
        JSON.stringify(
          request,
        ),
    },
  );
}

export async function setAccountDefaultAddress(
  addressId: string,
): Promise<AddressResponse> {
  return apiRequest<AddressResponse>(
    `/account/addresses/${addressId}/default`,
    {
      method: "PATCH",
    },
  );
}

export async function deleteAccountAddress(
  addressId: string,
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>(
    `/account/addresses/${addressId}`,
    {
      method: "DELETE",
    },
  );
}
