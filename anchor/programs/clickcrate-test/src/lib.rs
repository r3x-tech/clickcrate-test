use anchor_lang::prelude::*;
use anchor_spl::token_interface::{transfer_checked, TransferChecked};
use mpl_core::{
    instructions::{
        AddPluginV1CpiBuilder, RemovePluginV1CpiBuilder, TransferV1Builder, TransferV1CpiBuilder,
        UpdatePluginV1CpiBuilder,
    },
    types::{
        Attribute, Attributes, FreezeDelegate, Plugin, PluginAuthority, PluginType,
        TransferDelegate,
    },
};
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, program::invoke, pubkey::Pubkey,
    system_instruction,
};
declare_id!("9A14uKSX7DgPPH6Z8GumDewQ97Jn6riBxSKvnrJsM9vA");

pub mod account;
pub mod context;
pub mod error;

use crate::account::*;
use crate::context::*;
use crate::error::*;

#[program]
pub mod clickcrate_test {

    use mpl_core::accounts::BaseAssetV1;

    use super::*;

    pub fn register_clickcrate(
        ctx: Context<RegisterClickCrate>,
        id: Pubkey,
        eligible_placement_type: PlacementType,
        eligible_product_category: ProductCategory,
        manager: Pubkey,
    ) -> Result<()> {
        msg!("ClickCrate Registration in progress");
        let clickcrate: &mut Account<ClickCrateState> = &mut ctx.accounts.clickcrate;
        clickcrate.id = id;
        clickcrate.owner = ctx.accounts.owner.key();
        clickcrate.manager = manager;
        clickcrate.eligible_placement_type = eligible_placement_type;
        clickcrate.eligible_product_category = eligible_product_category;
        clickcrate.product = None;
        clickcrate.is_active = false;
        msg!("ClickCrate Registered");
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
        price: u64, // Add price parameter
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
        product_listing.price = price;
        product_listing.vault = Pubkey::default(); // Set a default or pass as parameter
        product_listing.order_manager = origin;
        Ok(())
    }

    pub fn update_product_listing(
        ctx: Context<UpdateProductListing>,
        new_placement_type: PlacementType,
        new_product_category: ProductCategory,
        new_manager: Pubkey,
        new_price: u64,
    ) -> Result<()> {
        let product_listing = &mut ctx.accounts.product_listing;
        product_listing.manager = new_manager;
        product_listing.placement_type = new_placement_type;
        product_listing.product_category = new_product_category;
        product_listing.price = new_price;
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

    pub fn initialize_oracle(ctx: Context<InitializeOracle>) -> Result<()> {
        let oracle = &mut ctx.accounts.oracle;
        let product_listing = &ctx.accounts.product_listing;

        oracle.set_inner(OrderOracle {
            order_status: OrderStatus::Placed,
            order_manager: product_listing.order_manager,
            validation: OracleValidation::V1 {
                create: ExternalValidationResult::Pass,
                transfer: ExternalValidationResult::Reject,
                burn: ExternalValidationResult::Pass,
                update: ExternalValidationResult::Pass,
            },
            bump: *ctx.bumps.get("oracle").unwrap(),
        });

        Ok(())
    }

    pub fn place_product_listing(ctx: Context<PlaceProductListing>, price: u64) -> Result<()> {
        let product_listing: &mut Account<ProductListingState> = &mut ctx.accounts.product_listing;
        let clickcrate = &mut ctx.accounts.clickcrate;
        let oracle = &mut ctx.accounts.oracle;

        // Check listing is active
        require!(
            product_listing.is_active == true,
            ClickCrateErrors::ProductListingDeactivated
        );

        // Check pos is active
        require!(
            clickcrate.is_active == true,
            ClickCrateErrors::ClickCrateDeactivated
        );

        // Initialize vault
        ctx.accounts.vault.initialize(
            ctx.accounts.product_listing.key(),
            *ctx.bumps.get("vault").unwrap(),
        );

        // Fetch child NFTs of the collection
        let child_nfts = fetch_child_nfts(&ctx.accounts.collection, &ctx.accounts.core_program)?;

        for child_nft in child_nfts {
            // Create and initialize Oracle for this specific child NFT
            let oracle_seeds = &[b"oracle", child_nft.key().as_ref()];
            let (oracle_pda, _) = Pubkey::find_program_address(oracle_seeds, ctx.program_id);

            // Create a new context for initializing the oracle
            let cpi_accounts = InitializeOracle {
                product_listing: ctx.accounts.product_listing.to_account_info(),
                product: child_nft.to_account_info(),
                oracle: oracle_pda.to_account_info(),
                payer: ctx.accounts.owner.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            };
            let cpi_ctx = CpiContext::new(ctx.program_id.to_account_info(), cpi_accounts);

            // Call the initialize_oracle instruction
            initialize_oracle(cpi_ctx)?;

            // Freeze the Asset
            AddPluginV1CpiBuilder::new(&ctx.accounts.core_program.to_account_info())
                .asset(&child_nft)
                .collection(Some(&ctx.accounts.collection.to_account_info()))
                .payer(&ctx.accounts.owner.to_account_info())
                .authority(Some(&ctx.accounts.owner.to_account_info()))
                .system_program(&ctx.accounts.system_program.to_account_info())
                .plugin(Plugin::FreezeDelegate(FreezeDelegate { frozen: true }))
                .init_authority(PluginAuthority::Address {
                    address: product_listing.key(),
                })
                .invoke()?;

            // Add TransferDelegate Plugin
            AddPluginV1CpiBuilder::new(&ctx.accounts.core_program.to_account_info())
                .asset(&child_nft)
                .collection(Some(&ctx.accounts.collection.to_account_info()))
                .payer(&ctx.accounts.owner.to_account_info())
                .authority(Some(&ctx.accounts.owner.to_account_info()))
                .system_program(&ctx.accounts.system_program.to_account_info())
                .plugin(Plugin::TransferDelegate(TransferDelegate {}))
                .init_authority(PluginAuthority::Address {
                    address: product_listing.key(),
                })
                .invoke()?;

            // Add Oracle Plugin
            let (oracle_pda, _) = Pubkey::find_program_address(
                &[b"oracle", child_nft.key().as_ref()],
                ctx.program_id,
            );

            AddPluginV1CpiBuilder::new(&ctx.accounts.core_program.to_account_info())
                .asset(&child_nft)
                .collection(Some(&ctx.accounts.collection.to_account_info()))
                .payer(&ctx.accounts.owner.to_account_info())
                .authority(Some(&ctx.accounts.owner.to_account_info()))
                .system_program(&ctx.accounts.system_program.to_account_info())
                .plugin(Plugin::Oracle(Oracle {
                    base_address: oracle_pda,
                    base_address_config: None,
                    results_offset: ValidationResultsOffset::Anchor,
                }))
                .init_authority(PluginAuthority::Address {
                    address: product_listing.key(),
                })
                .invoke()?;
        }

        // Set vault for sales funds
        let vault = &ctx.accounts.vault;
        let (vault_pda, _vault_bump) = Pubkey::find_program_address(&[b"vault"], ctx.program_id);
        require!(
            vault.key() == vault_pda,
            ClickCrateErrors::InvalidVaultAccount
        );

        product_listing.clickcrate_pos = Some(clickcrate.id);
        product_listing.price = price;
        product_listing.vault = vault.key();
        clickcrate.product = Some(product_listing.id);

        Ok(())
    }

    pub fn remove_product_listing(ctx: Context<RemoveProductListing>) -> Result<()> {
        let product_listing = &mut ctx.accounts.product_listing;
        let clickcrate = &mut ctx.accounts.clickcrate;
        let vault = &mut ctx.accounts.vault;

        // Check if the vault is empty (of product sale funds)
        require!(
            vault.to_account_info().lamports()
                == Rent::get()?.minimum_balance(VaultAccount::get_max_size()),
            ClickCrateErrors::VaultNotEmpty
        );

        // Fetch child NFTs of the collection
        let child_nfts = fetch_child_nfts(&ctx.accounts.collection, &ctx.accounts.core_program)?;

        for child_nft in child_nfts {
            // Unfreeze the Asset
            UpdatePluginV1CpiBuilder::new(&ctx.accounts.core_program.to_account_info())
                .asset(&child_nft)
                .collection(Some(&ctx.accounts.collection.to_account_info()))
                .payer(&ctx.accounts.owner.to_account_info())
                .authority(Some(&product_listing.to_account_info()))
                .system_program(&ctx.accounts.system_program.to_account_info())
                .plugin(Plugin::FreezeDelegate(FreezeDelegate { frozen: false }))
                .invoke_signed(&[&[
                    b"listing",
                    product_listing.id.as_ref(),
                    &[ctx.bumps.product_listing],
                ]])?;

            // Remove the FreezeDelegate Plugin
            RemovePluginV1CpiBuilder::new(&ctx.accounts.core_program.to_account_info())
                .asset(&child_nft)
                .collection(Some(&ctx.accounts.collection.to_account_info()))
                .payer(&ctx.accounts.owner.to_account_info())
                .authority(Some(&ctx.accounts.owner.to_account_info()))
                .system_program(&ctx.accounts.system_program.to_account_info())
                .plugin_type(PluginType::FreezeDelegate)
                .invoke()?;

            // Remove the TransferDelegate Plugin
            RemovePluginV1CpiBuilder::new(&ctx.accounts.core_program.to_account_info())
                .asset(&child_nft)
                .collection(Some(&ctx.accounts.collection.to_account_info()))
                .payer(&ctx.accounts.owner.to_account_info())
                .authority(Some(&ctx.accounts.owner.to_account_info()))
                .system_program(&ctx.accounts.system_program.to_account_info())
                .plugin_type(PluginType::TransferDelegate)
                .invoke()?;

            // Remove the Oracle Plugin
            RemovePluginV1CpiBuilder::new(&ctx.accounts.core_program.to_account_info())
                .asset(&child_nft)
                .collection(Some(&ctx.accounts.collection.to_account_info()))
                .payer(&ctx.accounts.owner.to_account_info())
                .authority(Some(&ctx.accounts.owner.to_account_info()))
                .system_program(&ctx.accounts.system_program.to_account_info())
                .plugin_type(PluginType::Oracle)
                .invoke()?;

            // Close the Oracle account
            let oracle_seeds = &[b"oracle", child_nft.key().as_ref()];
            let (oracle_pda, _bump) = Pubkey::find_program_address(oracle_seeds, ctx.program_id);

            let oracle_account_info = ctx.accounts.system_program.to_account_info();
            if let Ok(mut oracle_account) = Account::<OrderOracle>::try_from(&oracle_account_info) {
                let oracle_lamports = oracle_account.to_account_info().lamports();
                **oracle_account.to_account_info().try_borrow_mut_lamports()? = 0;
                **vault.to_account_info().try_borrow_mut_lamports()? += oracle_lamports;

                oracle_account.close(vault.to_account_info())?;
            } else {
                ClickCrateErrors::OracleFailedToClose
            }
        }
        clickcrate.product = None;
        product_listing.clickcrate_pos = None;

        Ok(())
    }

    pub fn make_purchase(
        ctx: Context<MakePurchase>,
        product_id: Pubkey,
        quantity: u64,
    ) -> Result<()> {
        let clickcrate = &mut ctx.accounts.clickcrate;
        let product_listing = &mut ctx.accounts.product_listing;
        let oracle = &mut ctx.accounts.oracle;
        let product = &ctx.accounts.product;

        // Check if the product is placed in ClickCrate
        require!(
            clickcrate.product == Some(product_listing.id),
            ClickCrateErrors::ProductNotFound
        );

        // Check if the provided product_id matches the product account
        require!(
            product.key() == product_id,
            ClickCrateErrors::InvalidProduct
        );

        // Check the order status in the oracle
        require!(
            oracle.order_status == OrderStatus::Placed,
            ClickCrateErrors::InvalidOrderStatus
        );

        // Check if the product is in stock
        require!(
            product_listing.in_stock >= quantity,
            ClickCrateErrors::ProductOutOfStock
        );

        // Transfer funds from buyer to vault
        let amount = product_listing.price * quantity;
        invoke(
            &system_instruction::transfer(
                ctx.accounts.buyer.key,
                &ctx.accounts.vault.key(),
                amount,
            ),
            &[
                ctx.accounts.buyer.to_account_info(),
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Update product listing
        product_listing.in_stock -= quantity;
        product_listing.sold += quantity;

        // Update order oracle
        oracle.order_status = OrderStatus::Pending;
        oracle.validation = OracleValidation::V1 {
            create: ExternalValidationResult::Pass,
            transfer: ExternalValidationResult::Rejected,
            burn: ExternalValidationResult::Pass,
            update: ExternalValidationResult::Pass,
        };

        // Update order status attribute on the NFT
        UpdatePluginV1CpiBuilder::new(&ctx.accounts.core_program.to_account_info())
            .asset(product)
            .payer(&ctx.accounts.buyer.to_account_info())
            .plugin(Plugin::Attributes(Attributes {
                attribute_list: vec![Attribute {
                    key: "order_status".to_string(),
                    value: "pending".to_string(),
                }],
            }))
            .invoke()?;

        Ok(())
    }
    pub fn update_order_status(
        ctx: Context<UpdateOrderStatus>,
        product_id: Pubkey,
        new_order_status: OrderStatus,
    ) -> Result<()> {
        let oracle = &mut ctx.accounts.oracle;

        require!(
            ctx.accounts.authority.key() == ctx.accounts.product_listing.owner
                || ctx.accounts.authority.key() == ctx.accounts.product_listing.manager,
            ClickCrateErrors::UnauthorizedStatusUpdate
        );

        oracle.order_status = new_order_status;
        oracle.validation = match new_order_status {
            OrderStatus::Pending => OracleValidation::V1 {
                create: ExternalValidationResult::Pass,
                transfer: ExternalValidationResult::Rejected,
                burn: ExternalValidationResult::Pass,
                update: ExternalValidationResult::Pass,
            },
            OrderStatus::Placed
            | OrderStatus::Confirmed
            | OrderStatus::Fulfilled
            | OrderStatus::Delivered => OracleValidation::V1 {
                create: ExternalValidationResult::Rejected,
                transfer: ExternalValidationResult::Rejected,
                burn: ExternalValidationResult::Rejected,
                update: ExternalValidationResult::Pass,
            },
            OrderStatus::Cancelled | OrderStatus::Completed => OracleValidation::V1 {
                create: ExternalValidationResult::Approved,
                transfer: ExternalValidationResult::Approved,
                burn: ExternalValidationResult::Rejected,
                update: ExternalValidationResult::Pass,
            },
        };
        Ok(())
    }

    pub fn complete_order(ctx: Context<CompleteOrder>) -> Result<()> {
        let product = Asset::deserialize(&mut &ctx.accounts.product.data.borrow()[..])?;

        require!(
            product.owner == ctx.accounts.seller.key(),
            ClickCrateErrors::InvalidProductNFTOwner
        );

        // Check the order status
        require!(
            ctx.accounts.order_oracle.order_status == OrderStatus::Completed,
            ClickCrateErrors::OrderNotCompleted
        );

        let amount = ctx.accounts.product_listing.price;

        // Ensure the vault has enough balance
        require!(
            **ctx.accounts.vault.to_account_info().lamports.borrow() >= amount,
            ClickCrateErrors::InsufficientBalance
        );

        // // Transfer funds from vault to seller
        // **ctx
        //     .accounts
        //     .vault
        //     .to_account_info()
        //     .try_borrow_mut_lamports()? -= amount;
        // **ctx.accounts.seller.try_borrow_mut_lamports()? += amount;

        invoke(
            &system_instruction::transfer(
                &ctx.accounts.vault.key(),
                &ctx.accounts.seller.key(),
                amount,
            ),
            &[
                ctx.accounts.vault.to_account_info(),
                ctx.accounts.seller.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        Ok(())
    }
}
