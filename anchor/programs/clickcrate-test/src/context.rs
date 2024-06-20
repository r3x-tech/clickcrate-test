use crate::account::*;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(id: Pubkey, eligible_placement_type: PlacementType, eligible_product_category: ProductCategory, manager: Pubkey,
)]
pub struct RegisterClickCrate<'info> {
    #[account(
        init,
        seeds = [b"clickcrate".as_ref(), id.key().as_ref()],
        bump,
        payer = owner,
        space = 8 + ClickCrateState::get_max_size(),
    )]
    pub clickcrate: Account<'info, ClickCrateState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(id: Pubkey, eligible_placement_type: PlacementType, eligible_product_category: ProductCategory, manager: Pubkey)]
pub struct UpdateClickCrate<'info> {
    #[account(
        mut,
        seeds = [b"clickcrate".as_ref(), id.key().as_ref()],
        bump,
        realloc = 8 + ClickCrateState::get_max_size(),
        realloc::payer = owner,
        realloc::zero = true,
    )]
    pub clickcrate: Account<'info, ClickCrateState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(id: Pubkey, origin: Origin, placement_type: PlacementType, product_category: ProductCategory, in_stock: u64, manager: Pubkey)]
pub struct RegisterProductListing<'info> {
    #[account(
        init,
        seeds = [b"listing".as_ref(), id.key().as_ref()],
        bump,
        payer = owner,
        space = 8 + ProductListingState::get_max_size(),
    )]
    pub product_listing: Account<'info, ProductListingState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(id: Pubkey, origin: Origin, placement_type: PlacementType, product_category: ProductCategory, in_stock: u64, manager: Pubkey)]
pub struct UpdateProductListing<'info> {
    #[account(
        mut,
        seeds = [b"listing".as_ref(), id.key().as_ref()],
        bump,
        realloc= 8 + ProductListingState::get_max_size(),
        realloc::payer = owner,
        realloc::zero = true,
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
#[instruction(product_id: Pubkey, clickcrate_id: Pubkey)]
pub struct PlaceProductListing<'info> {
    #[account(
        mut,
        has_one = owner,
        seeds = [b"clickcrate".as_ref(), clickcrate_id.key().as_ref()],
        bump,
    )]
    pub clickcrate: Account<'info, ClickCrateState>,
    #[account(
        mut,
        has_one = owner,
        seeds = [b"listing".as_ref(), product_id.key().as_ref()],
        bump,
    )]
    pub product_listing: Account<'info, ProductListingState>,
    #[account(mut)]
    pub asset_account: AccountInfo<'info>,
    #[account(
      init,
      seeds = [b"order_oracle", product_listing.key().as_ref()],
      bump,
      payer = owner,
      space = 8 + OrderOracle::get_max_size(),
  )]
    pub order_oracle: Account<'info, OrderOracle>,
    #[account(
        mut,
        constraint = vault.owner == system_program.key(),
    )]
    pub vault: Account<'info, VaultAccount>,
    #[account(
        seeds = [b"authority"],
        bump,
    )]
    pub authority: AccountInfo<'info>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// New context for initializing the vault account
#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        seeds = [b"vault", owner.key().as_ref()],
        bump,
        payer = owner,
        space = 8 + VaultAccount::get_max_size(),
    )]
    pub vault: Account<'info, VaultAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeOracle<'info> {
    #[account(
        init,
        seeds = [b"oracle", seller.key().as_ref()],
        bump,
        payer = payer,
        space = 8 + OrderOracle::get_max_size(),
    )]
    pub oracle: Account<'info, OrderOracle>,
    pub seller: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(product_id: Pubkey, clickcrate_id: Pubkey)]
pub struct RemoveProductListing<'info> {
    #[account(
        mut,
        has_one = owner,
        seeds = [b"clickcrate".as_ref(), clickcrate_id.key().as_ref()],
        bump,
    )]
    pub clickcrate: Account<'info, ClickCrateState>,
    #[account(
        mut,
        seeds = [b"listing".as_ref(), product_id.key().as_ref()],
        bump,
    )]
    pub product_listing: Account<'info, ProductListingState>,
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(product_id: Pubkey, clickcrate_id: Pubkey)]
pub struct MakePurchase<'info> {
    #[account(
        mut,
        has_one = owner,
        seeds = [b"clickcrate".as_ref(), clickcrate_id.key().as_ref()],
        bump,
    )]
    pub clickcrate: Account<'info, ClickCrateState>,
    #[account(
        mut,
        seeds = [b"listing".as_ref(), product_id.key().as_ref()],
        bump,
    )]
    pub product_listing: Account<'info, ProductListingState>,
    #[account(
        seeds = [b"order_oracle".as_ref()],
        bump,
    )]
    pub order_oracle: Account<'info, OrderOracle>,
    #[account(
      mut,
      seeds = [b"vault", product_listing.owner.as_ref()],
      bump,
    )]
    pub vault: AccountInfo<'info>,
    #[account(
      seeds = [b"authority"],
      bump,
    )]
    pub authority: AccountInfo<'info>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(product_id: Pubkey, new_order_status: OrderStatus)]
pub struct UpdateOrderStatus<'info> {
    #[account(
        mut,
        seeds = [b"oracle", seller.key().as_ref()],
        bump = oracle.bump,
    )]
    pub oracle: Account<'info, OrderOracle>,
    pub seller: Signer<'info>,
    #[account(mut)]
    pub product_nft: Account<'info, ProductListingState>,
}

#[derive(Accounts)]
pub struct CompleteOrder<'info> {
    #[account(
        mut,
        seeds = [b"oracle", seller.key().as_ref()],
        bump = oracle.bump,
    )]
    pub oracle: Account<'info, OrderOracle>,
    #[account(mut)]
    pub seller: Signer<'info>,
    #[account(mut)]
    pub product_nft: Account<'info, ProductListingState>,
    #[account(
        mut,
        seeds = [b"vault", seller.key().as_ref()],
        bump,
    )]
    pub vault: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}
