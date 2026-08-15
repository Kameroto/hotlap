import type {
  FeaturedProductsResponse,
  Product,
  ProductDetailsResponse,
  ProductListResponse,
} from "@/types/product";

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

export type AccountProfile =
  PublicUser & {
    updatedAt: string;
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

export type UpdateProfileRequest = {
  firstName: string;
  lastName: string;
  phone: string | null;
};

export type Address = {
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

export type AddressRequest = {
  label?: string | null;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export type AddressesResponse = {
  addresses: Address[];
  totalAddresses: number;
};

export type AddressResponse = {
  address: Address;
};

export type MessageResponse = {
  message: string;
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

export type CartCoupon = {
  code: string;
  name: string;
  description: string | null;
  isValid: boolean;
  discountAmount: number;
  message: string;
};

export type ServerCartItem = {
  id: string;
  quantity: number;
  lineTotal: number;
  isPurchasable: boolean;
  product: Product;
};

export type ServerCart = {
  id: string;
  items: ServerCartItem[];
  totalQuantity: number;
  subtotal: number;
  discountAmount: number;
  totalBeforeShipping: number;
  coupon: CartCoupon | null;
  updatedAt: string;
};

export type AddCartItemRequest = {
  productId: string;
  quantity: number;
};

export type UpdateCartItemRequest = {
  quantity: number;
};

export type ApplyCartCouponRequest = {
  code: string;
};

export type WishlistItem = {
  id: string;
  addedAt: string;
  product: Product;
};

export type WishlistResponse = {
  items: WishlistItem[];
  totalItems: number;
};

export type AddWishlistItemRequest = {
  productId: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  productCount: number;
};

export type CategoriesResponse = {
  categories: Category[];
  totalItems: number;
};

export type {
  ProductListResponse,
  FeaturedProductsResponse,
  ProductDetailsResponse,
};
