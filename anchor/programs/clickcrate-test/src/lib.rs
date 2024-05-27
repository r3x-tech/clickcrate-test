use anchor_lang::prelude::*;

declare_id!("RcGXdMiga83T527zSoCQDaWdMmU2qVQA3GCkfZyGrXc");

pub mod account;
pub mod anchor;
pub mod context;
pub mod error;

use crate::account::*;
// use crate::anchor::*;
use crate::context::*;
use crate::error::*;

#[program]
pub mod clickcrate_test {
    use super::*;

    pub fn register_clickcrate(
        ctx: Context<RegisterClickCrate>,
        id: Pubkey,
        eligible_placement_type: PlacementType,
        eligible_product_category: ProductCategory,
        manager: Pubkey,
    ) -> Result<()> {
        let clickcrate = &mut ctx.accounts.clickcrate;
        clickcrate.id = id;
        clickcrate.owner = ctx.accounts.owner.key();
        clickcrate.manager = manager;
        clickcrate.eligible_placement_type = eligible_placement_type;
        clickcrate.eligible_product_category = eligible_product_category;
        clickcrate.product = None;
        clickcrate.is_active = false;
        Ok(())
    }

    pub fn update_clickcrate(
        ctx: Context<UpdateClickCrate>,
        id: Pubkey,
        eligible_placement_type: PlacementType,
        eligible_product_category: ProductCategory,
        manager: Pubkey,
    ) -> Result<()> {
        let clickcrate = &mut ctx.accounts.clickcrate;
        clickcrate.id = id;
        clickcrate.manager = manager;
        clickcrate.eligible_placement_type = eligible_placement_type;
        clickcrate.eligible_product_category = eligible_product_category;
        Ok(())
    }

    pub fn register_product_listing(
        ctx: Context<RegisterProductListing>,
        id: Pubkey,
        origin: Origin,
        placement_type: PlacementType,
        product_category: ProductCategory,
        in_stock: u64,
        manager: Pubkey,
    ) -> Result<()> {
        let product_listing = &mut ctx.accounts.product_listing;
        product_listing.id = id;
        product_listing.origin = origin;
        product_listing.owner = ctx.accounts.owner.key();
        product_listing.manager = manager;
        product_listing.placement_type = placement_type;
        product_listing.product_category = product_category;
        product_listing.in_stock = in_stock;
        product_listing.sold = 0;
        product_listing.is_active = false;
        Ok(())
    }

    pub fn update_product_listing(
        ctx: Context<UpdateProductListing>,
        new_placement_type: PlacementType,
        new_product_category: ProductCategory,
        new_manager: Pubkey,
    ) -> Result<()> {
        let product_listing = &mut ctx.accounts.product_listing;
        product_listing.manager = new_manager;
        product_listing.placement_type = new_placement_type;
        product_listing.product_category = new_product_category;
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
        product_id: Pubkey,
    ) -> Result<()> {
        let clickcrate = &mut ctx.accounts.clickcrate;
        clickcrate.product = Some(product_id);
        Ok(())
    }

    pub fn remove_product_listing(ctx: Context<RemoveProductListing>) -> Result<()> {
        let clickcrate = &mut ctx.accounts.clickcrate;
        clickcrate.product = None;
        Ok(())
    }

    pub fn make_purchase(ctx: Context<MakePurchase>, product_id: Pubkey) -> Result<()> {
        let clickcrate = &mut ctx.accounts.clickcrate;
        let product_listing = &mut ctx.accounts.product_listing;

        if let Some(product) = clickcrate.product {
            require_keys_eq!(product, product_id, ClickCrateErrors::ProductNotFound);

            if product_listing.in_stock > 0 {
                product_listing.in_stock -= 1;
                product_listing.sold += 1;
            } else {
                return Err(ClickCrateErrors::ProductOutOfStock.into());
            }
        } else {
            return Err(ClickCrateErrors::ProductNotFound.into());
        }

        Ok(())
    }
}
