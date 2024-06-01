import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export enum PlacementType {
  DIGITALREPLICA,
  RELATEDPURCHASE,
  TARGETEDPLACEMENT,
}

export enum ProductCategory {
  CLOTHING,
  ELECTRONICS,
  BOOKS,
  HOME,
  BEAUTY,
  TOYS,
  SPORTS,
  AUTOMOTIVE,
  GROCERY,
  HEALTH,
}

export type PlacementTypee =
  | 'DIGITALREPLICA'
  | 'RELATEDPURCHASE'
  | 'TARGETEDPLACEMENT';

export const getPlacementTypeFromString = (
  placementType: string
): PlacementTypee => {
  switch (placementType) {
    case 'DIGITALREPLICA':
      return 'DIGITALREPLICA';
    case 'RELATEDPURCHASE':
      return 'RELATEDPURCHASE';
    case 'TARGETEDPLACEMENT':
      return 'TARGETEDPLACEMENT';
    default:
      throw new Error(`Invalid placement type: ${placementType}`);
  }
};

export type ProductCategoryy =
  | 'CLOTHING'
  | 'ELECTRONIC'
  | 'BOOKS'
  | 'HOME'
  | 'BEAUTY'
  | 'TOYS'
  | 'SPORTS'
  | 'AUTOMOTIVE'
  | 'GROCERY'
  | 'HEALTH';

export const getProductCategoryFromString = (
  productCategory: string
):
  | { CLOTHING: Record<string, never> }
  | { ELECTRONICS: Record<string, never> }
  | { BOOKS: Record<string, never> }
  | { HOME: Record<string, never> }
  | { BEAUTY: Record<string, never> }
  | { TOYS: Record<string, never> }
  | { SPORTS: Record<string, never> }
  | { AUTOMOTIVE: Record<string, never> }
  | { GROCERY: Record<string, never> }
  | { HEALTH: Record<string, never> } => {
  switch (productCategory) {
    case 'CLOTHING':
      return { CLOTHING: {} as Record<string, never> };
    case 'ELECTRONICS':
      return { ELECTRONICS: {} as Record<string, never> };
    case 'BOOKS':
      return { BOOKS: {} as Record<string, never> };
    case 'HOME':
      return { HOME: {} as Record<string, never> };
    case 'BEAUTY':
      return { BEAUTY: {} as Record<string, never> };
    case 'TOYS':
      return { TOYS: {} as Record<string, never> };
    case 'SPORTS':
      return { SPORTS: {} as Record<string, never> };
    case 'AUTOMOTIVE':
      return { AUTOMOTIVE: {} as Record<string, never> };
    case 'GROCERY':
      return { GROCERY: {} as Record<string, never> };
    case 'HEALTH':
      return { HEALTH: {} as Record<string, never> };
    default:
      throw new Error(`Invalid product category: ${productCategory}`);
  }
};

export type Origin = 'CLICKCRATE' | 'SHOPIFY' | 'SQUARE';
export const getOriginFromString = (
  origin: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  switch (origin) {
    case 'CLICKCRATE':
      return { cLICKCRATE: {} };
    case 'SHOPIFY':
      return { sHOPIFY: {} };
    case 'SQUARE':
      return { sQUARE: {} };
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

export type PlaceProductListingArgs = {
  productId: PublicKey;
};

export type MakePurchaseArgs = {
  productId: PublicKey;
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
