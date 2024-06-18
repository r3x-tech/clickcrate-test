use anchor_lang::prelude::*;
#[error_code]
pub enum ClickCrateErrors {
    #[msg("ClickCrate has already been registered")]
    ClickCrateExists,

    #[msg("ClickCrate already actived!")]
    ClickCrateActivated,

    #[msg("ClickCrate already deactived!")]
    ClickCrateDeactivated,

    #[msg("ClickCrate not found")]
    ClickCrateNotFound,

    #[msg("Invalid clickcrate registration")]
    InvalidClickCrateRegistration,

    #[msg("Product Listing was not found")]
    ProductNotFound,

    #[msg("Product Listing has already been registered")]
    ProductListingExists,

    #[msg("Product Listing already actived!")]
    ProductListingActivated,

    #[msg("Product Listing already deactived!")]
    ProductListingDeactivated,

    #[msg("Product is out of stock")]
    ProductOutOfStock,

    #[msg("Invalid product listing registration")]
    InvalidProductListingRegistration,

    #[msg("Order not found")]
    OrderNotFound,

    #[msg("Order not confirmed")]
    OrderNotConfirmed,

    #[msg("Order not completed")]
    OrderNotCompleted,
}
