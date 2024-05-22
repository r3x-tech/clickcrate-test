use anchor_lang::prelude::*;
pub mod account;
pub mod context;
pub mod error;

use crate::account::*;
use crate::context::*;
use crate::error::*;

declare_id!("7AGmMcgd1SjoMsCcXAAYwRgB9ihCyM8cZqjsUqriNRQt");

#[program]
pub mod clickcrate_registry {
    use super::*;

    pub fn register_clickcrate(
        ctx: Context<RegisterClickCrate>,
        id: Pubkey,
        eligible_placement_types: Vec<PlacementType>,
        eligible_product_categories: Vec<ProductCategory>,
        manager: Pubkey,
    ) -> Result<()> {
        let clickcrate = &mut ctx.accounts.clickcrate;
        clickcrate.id = id;
        clickcrate.owner = ctx.accounts.owner.key();
        clickcrate.manager = manager;
        clickcrate.eligible_placement_types = eligible_placement_types;
        clickcrate.eligible_product_categories = eligible_product_categories;
        clickcrate.product = None;
        clickcrate.is_active = false;
        Ok(())
    }

    pub fn register_product_listing(
        ctx: Context<RegisterProductListing>,
        id: Pubkey,
        origin: Origin,
        placement_types: Vec<PlacementType>,
        product_category: ProductCategory,
        in_stock: u64,
        manager: Pubkey,
    ) -> Result<()> {
        let product_listing = &mut ctx.accounts.product_listing;
        product_listing.id = id;
        product_listing.origin = origin;
        product_listing.owner = ctx.accounts.owner.key();
        product_listing.manager = manager;
        product_listing.placement_types = placement_types;
        product_listing.product_category = product_category;
        product_listing.in_stock = in_stock;
        product_listing.sold = 0;
        product_listing.is_active = false;
        Ok(())
    }

    pub fn activate_clickcrate(ctx: Context<ActivateClickCrate>) -> Result<()> {
        let clickcrate = &mut ctx.accounts.clickcrate;
        clickcrate.is_active = true;
        Ok(())
    }

    pub fn deactivate_clickcrate(ctx: Context<DeactivateClickCrate>) -> Result<()> {
        let clickcrate = &mut ctx.accounts.clickcrate;
        clickcrate.is_active = false;
        Ok(())
    }

    pub fn activate_product_listing(ctx: Context<ActivateProductListing>) -> Result<()> {
        let product_listing = &mut ctx.accounts.product_listing;
        product_listing.is_active = true;
        Ok(())
    }

    pub fn deactivate_product_listing(ctx: Context<DeactivateProductListing>) -> Result<()> {
        let product_listing = &mut ctx.accounts.product_listing;
        product_listing.is_active = false;
        Ok(())
    }

    pub fn place_product_listing(
        ctx: Context<PlaceProductListing>,
        product_pubkey: Pubkey,
    ) -> Result<()> {
        let clickcrate = &mut ctx.accounts.clickcrate;
        clickcrate.product = Some(product_pubkey);
        Ok(())
    }

    pub fn make_purchase(ctx: Context<MakePurchase>, product_pubkey: Pubkey) -> Result<()> {
        let clickcrate = &mut ctx.accounts.clickcrate;
        if let Some(product) = clickcrate.product {
            require_keys_eq!(product, product_pubkey, ClickCrateErrors::ProductNotFound);
        }
        Ok(())
    }
}
