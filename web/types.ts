import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

// export enum PlacementType {
//   DIGITALREPLICA,
//   RELATEDPURCHASE,
//   TARGETEDPLACEMENT,
// }

// export enum ProductCategory {
//   CLOTHING,
//   ELECTRONICS,
//   BOOKS,
//   HOME,
//   BEAUTY,
//   TOYS,
//   SPORTS,
//   AUTOMOTIVE,
//   GROCERY,
//   HEALTH,
// }

export type PlacementType =
  | 'Digitalreplica'
  | 'Relatedpurchase'
  | 'Targetedplacement';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getPlacementTypeFromString = (placementType: string): any => {
  switch (placementType) {
    case 'Digitalreplica':
      return { digitalreplica: {} };
    case 'Relatedpurchase':
      return { relatedpurchase: {} };
    case 'Targetedplacement':
      return { targetedplacement: {} };
    default:
      throw new Error(`Invalid placement type: ${placementType}`);
  }
};

export type ProductCategory =
  | 'Clothing'
  | 'Electronics'
  | 'Books'
  | 'Home'
  | 'Beauty'
  | 'Toys'
  | 'Sports'
  | 'Automotive'
  | 'Grocery'
  | 'Health';

export const getProductCategoryFromString = (
  productCategory: string
): // eslint-disable-next-line @typescript-eslint/no-explicit-any
any => {
  switch (productCategory) {
    case 'Clothing':
      return { clothing: {} };
    case 'Electronics':
      return { electronics: {} };
    case 'Books':
      return { boks: {} };
    case 'Home':
      return { home: {} };
    case 'Beauty':
      return { beauty: {} };
    case 'Toys':
      return { toys: {} };
    case 'Sports':
      return { sports: {} };
    case 'Automotive':
      return { automotive: {} };
    case 'Grocery':
      return { grocery: {} };
    case 'Health':
      return { health: {} };
    default:
      throw new Error(`Invalid product category: ${productCategory}`);
  }
};

export type Origin = 'ClickCrate' | 'Shopify' | 'Square';
export const getOriginFromString = (
  origin: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  switch (origin) {
    case 'Clickcrate':
      return { clickcrate: {} };
    case 'Shopify':
      return { shopify: {} };
    case 'Square':
      return { square: {} };
    default:
      throw new Error(`Invalid origin: ${origin}`);
  }
};

export interface ClickCrateState {
  id: PublicKey;
  owner: PublicKey;
  manager: PublicKey;
  eligiblePlacementType: PlacementType;
  eligibleProductCategory: ProductCategory;
  product: PublicKey | null;
  isActive: boolean;
}

export interface ProductListingState {
  id: PublicKey;
  origin: Origin;
  owner: PublicKey;
  manager: PublicKey;
  placementType: PlacementType;
  productCategory: ProductCategory;
  inStock: BN;
  sold: BN;
  isActive: boolean;
}

export type RegisterClickCrateArgs = {
  id: PublicKey;
  eligiblePlacementType: PlacementType;
  eligibleProductCategory: ProductCategory;
  manager: PublicKey;
};

export type RemoveProductListingArgs = {
  productId: PublicKey;
  clickcrateId: PublicKey;
};

export type PlaceProductListingArgs = {
  productId: PublicKey;
  clickcrateId: PublicKey;
};

export type MakePurchaseArgs = {
  productId: PublicKey;
  clickcrateId: PublicKey;
};

export interface NFT {
  name: string;
  symbol: string;
  royalty: number;
  image_uri: string;
  cached_image_uri: string;
  animation_url: string;
  cached_animation_url: string;
  metadata_uri: string;
  description: string;
  mint: string;
  owner: string;
  update_authority: string;
  creators: {
    address: string;
    share: number;
    verified: boolean;
  }[];
  collection: {
    address: string;
    verified: boolean;
  };
  attributes: unknown;
  attributes_array: {
    trait_type: string;
    value: string;
  }[];
  files: {
    uri: string;
    type: string;
  }[];
  external_url: string;
  primary_sale_happened: boolean;
  is_mutable: boolean;
  token_standard: string;
  is_loaded_metadata: boolean;
  is_compressed?: boolean;
}
