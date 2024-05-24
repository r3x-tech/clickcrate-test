import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export type PlacementType =
  | { digitalReplica: {} }
  | { relatedPurchase: {} }
  | { targetedPlacement: {} };

export type ProductCategory =
  | { clothing: {} }
  | { electronics: {} }
  | { books: {} }
  | { home: {} }
  | { beauty: {} }
  | { toys: {} }
  | { sports: {} }
  | { automotive: {} }
  | { grocery: {} }
  | { health: {} };

export type Origin = { clickcrate: {} } | { shopify: {} } | { square: {} };

export interface ClickCrateState {
  id: PublicKey;
  owner: PublicKey;
  manager: PublicKey;
  eligiblePlacementTypes: PlacementType[];
  eligibleProductCategories: ProductCategory[];
  product: PublicKey | null;
  isActive: boolean;
}

export interface ProductListingState {
  id: PublicKey;
  origin: Origin;
  owner: PublicKey;
  manager: PublicKey;
  placementTypes: PlacementType[];
  productCategory: ProductCategory;
  inStock: BN;
  sold: BN;
  isActive: boolean;
}

// Define instruction argument types
export type RegisterClickCrateArgs = {
  id: PublicKey;
  owner: PublicKey;
  manager: PublicKey;
  eligiblePlacementTypes: PlacementType[];
  eligibleProductCategories: ProductCategory[];
};

export type UpdateClickCrateArgs = {
  id: PublicKey;
  eligiblePlacementTypes: PlacementType[];
  eligibleProductCategories: ProductCategory[];
  manager: PublicKey;
};

export type RegisterProductListingArgs = {
  id: PublicKey;
  origin: Origin;
  owner: PublicKey;
  manager: PublicKey;
  placementTypes: PlacementType[];
  productCategory: ProductCategory;
  inStock: BN;
};

export type UpdateProductListingArgs = {
  newPlacementTypes: PlacementType[];
  newProductCategory: ProductCategory;
  newManager: PublicKey;
};

export type PlaceProductListingArgs = {
  productId: PublicKey;
};

export type MakePurchaseArgs = {
  productId: PublicKey;
};

// Define error types
export type ClickCrateExistsError = { clickCrateExists: { msg: string } };
export type ClickCrateActivatedError = { clickCrateActivated: { msg: string } };
export type ClickCrateDeactivatedError = {
  clickCrateDeactivated: { msg: string };
};
export type InvalidClickCrateRegistrationError = {
  invalidClickCrateRegistration: { msg: string };
};
export type ProductNotFoundError = { productNotFound: { msg: string } };
export type ProductListingExistsError = {
  productListingExists: { msg: string };
};
export type ProductListingActivatedError = {
  productListingActivated: { msg: string };
};
export type ProductListingDeactivatedError = {
  productListingDeactivated: { msg: string };
};
export type ProductOutOfStockError = { productOutOfStock: { msg: string } };
export type InvalidProductListingRegistrationError = {
  invalidProductListingRegistration: { msg: string };
};
export type PurchaseFailedError = { purchaseFailed: { msg: string } };
