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

    #[msg("The product is out of stock")]
    ProductOutOfStock,

    #[msg("Invalid product listing registration")]
    InvalidProductListingRegistration,

    #[msg("Purchase did not go through")]
    PurchaseFailed,
}
