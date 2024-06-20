use anchor_lang::prelude::*;
use mpl_core::types::{Key, UpdateAuthority};
use std::collections::BTreeMap;
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
    pub price: u64,
    pub vault: Pubkey,
    pub order_oracle: Pubkey,
}

impl MaxSize for ProductListingState {
    fn get_max_size() -> usize {
        return 8 + 32 + 1 + 32 + 32 + 1 + 1 + 8 + 8 + (1 + 32) + 1 + 8 + 32 + 32;
    }
}

#[account]
pub struct VaultAccount {
    pub owner: Pubkey,
    pub bump: u8,
}

impl MaxSize for VaultAccount {
    fn get_max_size() -> usize {
        return 8 + 32 + 1;
    }
}

#[account]
pub struct OrderOracle {
    pub validation: OracleValidation,
    pub order_statuses: BTreeMap<Pubkey, OrderStatus>,
    pub bump: u8,
}

impl MaxSize for OrderOracle {
    fn get_max_size() -> usize {
        return 8 + 5 + 4 + (32 + 1) * 100; // Discriminator (8) + Validation (5) + Map (4 + (32 + 1) * 100)
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum OracleValidation {
    Uninitialized,
    V1 {
        create: ExternalValidationResult,
        transfer: ExternalValidationResult,
        burn: ExternalValidationResult,
        update: ExternalValidationResult,
    },
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ExternalValidationResult {
    Approved,
    Rejected,
    Pass,
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

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum OrderStatus {
    Pending,
    Placed,
    Confirmed,
    Fulfilled,
    Delivered,
    Completed,
    Cancelled,
}

pub trait MaxSize {
    fn get_max_size() -> usize;
}
