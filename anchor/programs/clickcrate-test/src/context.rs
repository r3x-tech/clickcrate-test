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
#[instruction(id: Pubkey, origin: Origin, placement_type: PlacementType, product_category: ProductCategory, manager: Pubkey)]
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
#[instruction(id: Pubkey, origin: Origin, placement_type: PlacementType, product_category: ProductCategory, manager: Pubkey)]
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
    #[account(
        mut,
        seeds = [b"clickcrate".as_ref(), clickcrate.id.as_ref()],
        bump,
        has_one = owner
    )]
    pub clickcrate: Account<'info, ClickCrateState>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeactivateClickCrate<'info> {
    #[account(
        mut,
        seeds = [b"clickcrate".as_ref(), clickcrate.id.as_ref()],
        bump,
        has_one = owner
    )]
    pub clickcrate: Account<'info, ClickCrateState>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct ActivateProductListing<'info> {
    #[account(
        mut,
        seeds = [b"listing".as_ref(), product_listing.id.as_ref()],
        bump,
        has_one = owner
    )]
    pub product_listing: Account<'info, ProductListingState>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeactivateProductListing<'info> {
    #[account(
        mut,
        seeds = [b"listing".as_ref(), product_listing.id.as_ref()],
        bump,
        has_one = owner
    )]
    pub product_listing: Account<'info, ProductListingState>,
    pub owner: Signer<'info>,
}

// #[derive(Accounts)]
// pub struct InitializeVault<'info> {
//     #[account(mut)]
//     pub product_listing: Account<'info, ProductListingState>,
//     #[account(
//         init,
//         seeds = [b"vault", product_listing.key().as_ref()],
//         bump,
//         payer = owner,
//         space = 8 + VaultAccount::get_max_size(),
//     )]
//     pub vault: Account<'info, VaultAccount>,
//     #[account(
//         mut,
//         constraint = owner.key() == product_listing.owner
//     )]
//     pub owner: Signer<'info>,
//     pub system_program: Program<'info, System>,
// }

#[derive(Accounts)]
#[instruction(product_listing_id: Pubkey)]
pub struct InitializeOracle<'info> {
    #[account(
      mut,
      seeds = [b"listing".as_ref(), product_listing_id.key().as_ref()],
      bump,
    )]
    pub product_listing: Account<'info, ProductListingState>,
    /// CHECK: This is a Metaplex core asset account
    pub product: UncheckedAccount<'info>,
    #[account(
        init,
        seeds = [b"oracle", product.key().as_ref()],
        bump,
        payer = payer,
        space = 8 + OrderOracle::get_max_size(),
    )]
    pub oracle: Account<'info, OrderOracle>,
    #[account(
      mut,
      constraint = payer.key() == product_listing.owner
    )]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseOracle<'info> {
    #[account(mut)]
    pub product_listing: Account<'info, ProductListingState>,
    #[account(
        mut,
        close = owner,
        seeds = [b"oracle", product.key().as_ref()],
        bump,
    )]
    pub oracle: Account<'info, OrderOracle>,
    /// CHECK: This is a Metaplex Core NFT
    pub product: UncheckedAccount<'info>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(product_listing_id: Pubkey, clickcrate_id: Pubkey, price: u64)]
pub struct PlaceProducts<'info> {
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
        seeds = [b"listing".as_ref(), product_listing_id.key().as_ref()],
        bump,
    )]
    pub product_listing: Account<'info, ProductListingState>,
    // #[account(
    //   mut,
    //   seeds = [b"vault", product_listing.key().as_ref()],
    //   bump
    // )]
    // pub vault: Account<'info, VaultAccount>,
    #[account(
      init,
      seeds = [b"vault", product_listing.key().as_ref()],
      bump,
      payer = owner,
      space = 8 + VaultAccount::get_max_size(),
  )]
    pub vault: Account<'info, VaultAccount>,
    /// CHECK: This is the Metaplex core collection account
    pub listing_collection: UncheckedAccount<'info>,
    pub core_program: Program<'info, Core>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(product_listing_id: Pubkey, clickcrate_id: Pubkey)]
pub struct RemoveProducts<'info> {
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
        seeds = [b"listing".as_ref(), product_listing_id.key().as_ref()],
        bump,
    )]
    pub product_listing: Account<'info, ProductListingState>,
    #[account(
        mut,
        seeds = [b"vault", product_listing.key().as_ref()],
        bump,
        constraint = vault.key() == product_listing.vault,
        close = owner
    )]
    pub vault: Account<'info, VaultAccount>,
    /// CHECK: This is the Metaplex core collection account
    pub listing_collection: UncheckedAccount<'info>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub core_program: Program<'info, Core>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(product_listing_id: Pubkey, clickcrate_id: Pubkey)]
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
      has_one = owner,
      seeds = [b"listing".as_ref(), product_listing_id.key().as_ref()],
      bump,
    )]
    pub product_listing: Account<'info, ProductListingState>,
    #[account(
      mut,
      seeds = [b"oracle", product.key().as_ref()],
      bump = oracle.bump,
     )]
    pub oracle: Account<'info, OrderOracle>,
    #[account(
      mut,
      seeds = [b"vault", product_listing.key().as_ref()],
      bump = vault.bump,
    )]
    pub vault: Account<'info, VaultAccount>,
    /// CHECK: This is a Metaplex Core NFT
    #[account(mut)]
    pub product: UncheckedAccount<'info>,
    #[account(mut, constraint = owner.key() == product_listing.owner)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub core_program: Program<'info, Core>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(product_id: Pubkey, product_listing_id: Pubkey, new_order_status: OrderStatus)]
pub struct UpdateOrderStatus<'info> {
    #[account(
      mut,
      has_one = owner,
      seeds = [b"listing".as_ref(), product_listing_id.key().as_ref()],
      bump,
    )]
    pub product_listing: Account<'info, ProductListingState>,
    // #[account(
    //   mut,
    //   seeds = [b"oracle", product.key().as_ref()],
    //   bump,
    //   realloc = 8 + OrderOracle::get_max_size(),
    //   realloc::payer = seller,
    //   realloc::zero = true,
    // )]
    // pub oracle: Account<'info, OrderOracle>,
    #[account(
      mut,
      seeds = [b"oracle", product_id.key().as_ref()],
      bump = oracle.bump,
     )]
    pub oracle: Account<'info, OrderOracle>,
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub seller: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CompleteOrder<'info> {
    #[account(mut)]
    pub product_listing: Account<'info, ProductListingState>,
    #[account(mut)]
    /// CHECK: This is a Metaplex Core NFT, which we'll deserialize manually
    pub product_account: UncheckedAccount<'info>,
    #[account(
      mut,
      seeds = [b"vault", product_listing.key().as_ref()],
      bump,
    )]
    pub vault: Account<'info, VaultAccount>,
    #[account(
        mut,
        seeds = [b"oracle", product.key().as_ref()],
        bump = oracle.bump,
    )]
    pub oracle: Account<'info, OrderOracle>,
    /// CHECK: This is the seller's wallet
    #[account(mut, constraint = seller.key() == product_listing.owner)]
    pub seller: Signer<'info>,
    /// CHECK: This is a Metaplex Core NFT
    #[account(mut)]
    pub product: UncheckedAccount<'info>,
    #[account(constraint = authority.key() == product_listing.owner)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}
