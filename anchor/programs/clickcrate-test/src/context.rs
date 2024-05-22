use anchor_lang::prelude::*;

use crate::account::*;

#[derive(Accounts)]
#[instruction(id: Pubkey, eligible_placement_types: Vec<PlacementType>, eligible_product_categories: Vec<ProductCategory>)]
pub struct RegisterClickCrate<'info> {
    #[account(
        init,
        seeds = [b"clickcrate", owner.key().as_ref()],
        bump,
        payer = owner,
        space = 8 + ClickCrateState::get_max_size()
    )]
    pub clickcrate: Account<'info, ClickCrateState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(id: Pubkey, origin: Origin, placement_types: Vec<PlacementType>, product_category: ProductCategory, in_stock: u64)]
pub struct RegisterProductListing<'info> {
    #[account(
        init,
        seeds = [b"product_listing", owner.key().as_ref()],
        bump,
        payer = owner,
        space = 8 + ProductListingState::get_max_size()
    )]
    pub product_listing: Account<'info, ProductListingState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ActivateClickCrate<'info> {
    #[account(mut, has_one = owner)]
    pub clickcrate: Account<'info, ClickCrateState>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeactivateClickCrate<'info> {
    #[account(mut, has_one = owner)]
    pub clickcrate: Account<'info, ClickCrateState>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct ActivateProductListing<'info> {
    #[account(mut, has_one = owner)]
    pub product_listing: Account<'info, ProductListingState>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeactivateProductListing<'info> {
    #[account(mut, has_one = owner)]
    pub product_listing: Account<'info, ProductListingState>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct PlaceProductListing<'info> {
    #[account(mut, has_one = owner)]
    pub clickcrate: Account<'info, ClickCrateState>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct MakePurchase<'info> {
    #[account(mut, has_one = owner)]
    pub clickcrate: Account<'info, ClickCrateState>,
    pub owner: Signer<'info>,
}
