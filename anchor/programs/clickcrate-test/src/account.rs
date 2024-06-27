use anchor_lang::prelude::*;
use mpl_core::programs::MPL_CORE_ID;

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
    const MAX_SIZE: usize = 8 + 32 + 32 + 32 + 1 + 1 + (1 + 32) + 1;
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
    pub order_manager: Origin,
}

impl MaxSize for ProductListingState {
    const MAX_SIZE: usize = 8 + 32 + 1 + 32 + 32 + 1 + 1 + 8 + 8 + (1 + 32) + 1 + 8 + 32 + 1;
}

#[account]
pub struct VaultAccount {
    pub bump: u8,
}

impl MaxSize for VaultAccount {
    const MAX_SIZE: usize = 8 + 1;
}

#[account]
pub struct OrderOracle {
    pub order_status: OrderStatus,
    pub order_manager: Origin,
    pub validation: OracleValidation,
    pub bump: u8,
}

impl MaxSize for OrderOracle {
    const MAX_SIZE: usize = 8 + 1 + 1 + 5 + 1;
}

// #[account]
// pub struct OrderOracle {
//     pub order_status: OrderStatus,
//     pub order_manager: Origin,
//     pub validation: OracleValidation,
//     pub bump: u8,
// }

// impl OrderOracle {
//     pub fn initialize(&mut self, order_manager: Origin, bump: u8) -> Result<()> {
//         self.order_status = OrderStatus::Placed;
//         self.order_manager = order_manager;
//         self.validation = OracleValidation::V1 {
//             create: ExternalValidationResult::Pass,
//             transfer: ExternalValidationResult::Rejected,
//             burn: ExternalValidationResult::Pass,
//             update: ExternalValidationResult::Pass,
//         };
//         self.bump = bump;
//         Ok(())
//     }

//     pub fn size() -> usize {
//         8 + // discriminator
//         1 + // order_status
//         1 + // order_manager
//         5 + // validation
//         1 // bump
//     }
// }

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
    const MAX_SIZE: usize;
}

pub struct Core;

impl anchor_lang::Id for Core {
    fn id() -> Pubkey {
        MPL_CORE_ID
    }
}
