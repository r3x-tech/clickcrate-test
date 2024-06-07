use anchor_lang::prelude::*;

#[account]
pub struct ClickCrateState {
    pub id: Pubkey,
    pub owner: Pubkey,
    pub manager: Pubkey,
    pub eligible_placement_type: PlacementType,
    pub eligible_product_category: ProductCategory,
    pub product: Option<Pubkey>,
    pub is_active: bool,
}

impl MaxSize for ClickCrateState {
    fn get_max_size() -> usize {
        return 8 + 32 + 32 + 32 + 1 + 1 + (1 + 32) + 1;
    }
}

#[account]
pub struct ProductListingState {
    pub id: Pubkey,
    pub origin: Origin,
    pub owner: Pubkey,
    pub manager: Pubkey,
    pub placement_type: PlacementType,
    pub product_category: ProductCategory,
    pub in_stock: u64,
    pub sold: u64,
    pub clickcrate_pos: Option<Pubkey>,
    pub is_active: bool,
}

impl MaxSize for ProductListingState {
    fn get_max_size() -> usize {
        return 8 + 32 + 1 + 32 + 32 + 1 + 1 + 8 + 8 + (1 + 32) + 1;
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PlacementType {
    Digitalreplica,
    Relatedpurchase,
    Targetedplacement,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProductCategory {
    Clothing,
    Electronics,
    Books,
    Home,
    Beauty,
    Toys,
    Sports,
    Automotive,
    Grocery,
    Health,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Origin {
    Clickcrate,
    Shopify,
    Square,
}

pub trait MaxSize {
    fn get_max_size() -> usize;
}
