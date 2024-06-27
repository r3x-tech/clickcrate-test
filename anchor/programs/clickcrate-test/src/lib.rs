use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    account_info::AccountInfo, program::invoke, pubkey::Pubkey, system_instruction,
};
use mpl_core::{
    instructions::{
        AddExternalPluginAdapterV1CpiBuilder, AddPluginV1CpiBuilder,
        RemoveExternalPluginAdapterV1CpiBuilder, RemovePluginV1CpiBuilder,
        UpdatePluginV1CpiBuilder,
    },
    types::{
        Attribute, Attributes, ExternalCheckResult, ExternalPluginAdapterInitInfo,
        ExternalPluginAdapterKey, FreezeDelegate, HookableLifecycleEvent, OracleInitInfo, Plugin,
        PluginAuthority, PluginType, TransferDelegate, ValidationResultsOffset,
    },
    Asset, Collection,
};
declare_id!("DwALQVbHk58rCtvjgaodThL5exDzJT1ecYVuXfvsgqGF");

pub mod account;
pub mod context;
pub mod error;

use crate::account::*;
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
        let clickcrate: &mut Account<ClickCrateState> = &mut ctx.accounts.clickcrate;
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
        manager: Pubkey,
        price: u64,
    ) -> Result<()> {
        let product_listing = &mut ctx.accounts.product_listing;
        product_listing.id = id;
        product_listing.origin = origin.clone();
        product_listing.owner = ctx.accounts.owner.key();
        product_listing.manager = manager;
        product_listing.placement_type = placement_type;
        product_listing.product_category = product_category;
        product_listing.in_stock = 0;
        product_listing.sold = 0;
        product_listing.is_active = false;
        product_listing.price = price;
        product_listing.vault = Pubkey::default();
        product_listing.order_manager = origin.clone();
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

    // pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
    //     let vault = &mut ctx.accounts.vault;
    //     vault.bump = ctx.bumps.vault;

    //     let product_listing = &mut ctx.accounts.product_listing;
    //     product_listing.vault = vault.key();
    //     Ok(())
    // }

    pub fn initialize_oracle(ctx: Context<InitializeOracle>) -> Result<()> {
        let oracle = &mut ctx.accounts.oracle;
        let product_listing = &ctx.accounts.product_listing;

        oracle.set_inner(OrderOracle {
            order_status: OrderStatus::Placed,
            order_manager: product_listing.order_manager.clone(),
            validation: OracleValidation::V1 {
                create: ExternalValidationResult::Pass,
                transfer: ExternalValidationResult::Rejected,
                burn: ExternalValidationResult::Pass,
                update: ExternalValidationResult::Pass,
            },
            bump: ctx.bumps.oracle,
        });

        Ok(())
    }

    pub fn close_oracle(_ctx: Context<CloseOracle>) -> Result<()> {
        Ok(())
    }

    pub fn place_products<'a, 'b, 'c: 'info, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, PlaceProducts<'info>>,
        price: u64,
    ) -> Result<()> {
        let product_listing: &mut Account<ProductListingState> = &mut ctx.accounts.product_listing;
        let clickcrate: &mut Account<ClickCrateState> = &mut ctx.accounts.clickcrate;
        let listing_collection = &ctx.accounts.listing_collection;
        let product_accounts = ctx.remaining_accounts;
        let vault = &ctx.accounts.vault;

        let collection_data = listing_collection.try_borrow_data()?;
        let collection_account = Collection::deserialize(&mut &collection_data[..])?;
        let total_minted = collection_account.base.num_minted;

        let core_program_info = ctx.accounts.core_program.to_account_info();
        let collection_info = ctx.accounts.listing_collection.to_account_info();
        let owner_info = ctx.accounts.owner.to_account_info();
        let system_program_info = ctx.accounts.system_program.to_account_info();

        require!(
            product_listing.is_active,
            ClickCrateErrors::ProductListingDeactivated
        );
        require!(
            clickcrate.is_active,
            ClickCrateErrors::ClickCrateDeactivated
        );
        require!(
            product_listing.in_stock == 0
                && product_listing.sold == 0
                && product_accounts.len() as u32 == total_minted
                && product_accounts.len() >= 1
                && product_accounts.len() <= 20,
            ClickCrateErrors::InvalidStockingRequest
        );

        // Lock the NFTs
        for product_account in product_accounts.iter() {
            let product_data = product_account.try_borrow_data()?;
            require!(
                Asset::deserialize(&mut &product_data[..]).is_ok(),
                ClickCrateErrors::InvalidProductAccount
            );
            // let deserialized_product = Asset::deserialize(&mut &product_data[..]).unwrap();

            // Freeze the Asset
            AddPluginV1CpiBuilder::new(&core_program_info)
                .asset(&product_account)
                .collection(Some(&collection_info))
                .payer(&owner_info)
                .authority(Some(&owner_info))
                .system_program(&system_program_info)
                .plugin(Plugin::FreezeDelegate(FreezeDelegate { frozen: true }))
                .init_authority(PluginAuthority::Address {
                    address: product_listing.key(),
                })
                .invoke()?;

            // Add TransferDelegate Plugin
            AddPluginV1CpiBuilder::new(&core_program_info)
                .asset(&product_account)
                .collection(Some(&collection_info))
                .payer(&owner_info)
                .authority(Some(&owner_info))
                .system_program(&system_program_info)
                .plugin(Plugin::TransferDelegate(TransferDelegate {}))
                .init_authority(PluginAuthority::Address {
                    address: product_listing.key(),
                })
                .invoke()?;

            // Add Oracle Plugin
            let (oracle_pda, _) = Pubkey::find_program_address(
                &[b"oracle", product_account.key().as_ref()],
                ctx.program_id,
            );
            AddExternalPluginAdapterV1CpiBuilder::new(&core_program_info)
                .asset(&product_account)
                .collection(Some(&collection_info))
                .payer(&owner_info)
                .authority(Some(&owner_info))
                .system_program(&system_program_info)
                .init_info(ExternalPluginAdapterInitInfo::Oracle(OracleInitInfo {
                    base_address: oracle_pda,
                    results_offset: Some(ValidationResultsOffset::Anchor),
                    lifecycle_checks: vec![(
                        HookableLifecycleEvent::Transfer,
                        ExternalCheckResult { flags: 4 },
                    )],
                    base_address_config: None,
                    init_plugin_authority: None,
                }))
                .invoke()?;
            product_listing.in_stock += 1;
        }

        product_listing.clickcrate_pos = Some(clickcrate.id);
        product_listing.vault = vault.key();
        product_listing.price = price;
        clickcrate.product = Some(product_listing.id);

        Ok(())
    }

    pub fn remove_products<'a, 'b, 'c: 'info, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, RemoveProducts<'info>>,
    ) -> Result<()> {
        let product_listing: &mut Account<ProductListingState> = &mut ctx.accounts.product_listing;
        let clickcrate: &mut Account<ClickCrateState> = &mut ctx.accounts.clickcrate;
        let listing_collection = &ctx.accounts.listing_collection;
        let product_accounts = ctx.remaining_accounts;
        let vault = &ctx.accounts.vault;

        let (vault_pda, _vault_bump) = Pubkey::find_program_address(
            &[b"vault", product_listing.key().as_ref()],
            ctx.program_id,
        );
        let collection_data = listing_collection.try_borrow_data()?;
        let collection_account = Collection::deserialize(&mut &collection_data[..])?;
        let total_minted = collection_account.base.num_minted;

        let core_program_info = ctx.accounts.core_program.to_account_info();
        let collection_info = ctx.accounts.listing_collection.to_account_info();
        let owner_info = ctx.accounts.owner.to_account_info();
        let system_program_info = ctx.accounts.system_program.to_account_info();

        require!(
            product_listing.is_active,
            ClickCrateErrors::ProductListingDeactivated
        );
        require!(
            clickcrate.is_active,
            ClickCrateErrors::ClickCrateDeactivated
        );
        require!(
            vault.key() == vault_pda,
            ClickCrateErrors::InvalidVaultAccount
        );
        require!(
            product_accounts.len() as u32 == total_minted
                && product_accounts.len() >= 1
                && product_accounts.len() <= 20,
            ClickCrateErrors::InvalidRemovalRequest
        );

        // Check if the vault is empty (of product sale funds)
        require!(
            vault.to_account_info().lamports()
                == Rent::get()?.minimum_balance(VaultAccount::MAX_SIZE),
            ClickCrateErrors::VaultNotEmpty
        );

        // Unlock the NFTs
        for product_account in product_accounts.iter() {
            let product_data = product_account.try_borrow_data()?;
            require!(
                Asset::deserialize(&mut &product_data[..]).is_ok(),
                ClickCrateErrors::InvalidProductAccount
            );
            let deserialized_product = Asset::deserialize(&mut &product_data[..]).unwrap();

            // Unfreeze the Asset
            UpdatePluginV1CpiBuilder::new(&core_program_info)
                .asset(&product_account)
                .collection(Some(&collection_info))
                .payer(&owner_info)
                .authority(Some(&product_listing.to_account_info()))
                .system_program(&system_program_info)
                .plugin(Plugin::FreezeDelegate(FreezeDelegate { frozen: false }))
                .invoke_signed(&[&[
                    b"listing",
                    product_listing.id.as_ref(),
                    &[ctx.bumps.product_listing],
                ]])?;

            // Remove the FreezeDelegate Plugin
            RemovePluginV1CpiBuilder::new(&core_program_info)
                .asset(&product_account)
                .collection(Some(&collection_info))
                .payer(&owner_info)
                .authority(Some(&owner_info))
                .system_program(&system_program_info)
                .plugin_type(PluginType::FreezeDelegate)
                .invoke()?;

            // Remove the TransferDelegate Plugin
            RemovePluginV1CpiBuilder::new(&core_program_info)
                .asset(&product_account)
                .collection(Some(&collection_info))
                .payer(&owner_info)
                .authority(Some(&owner_info))
                .system_program(&system_program_info)
                .plugin_type(PluginType::TransferDelegate)
                .invoke()?;

            // Remove the Oracle Plugin
            let oracle = deserialized_product
                .external_plugin_adapter_list
                .oracles
                .first()
                .ok_or(ClickCrateErrors::OracleNotFound)?;

            RemoveExternalPluginAdapterV1CpiBuilder::new(&core_program_info)
                .asset(&product_account)
                .collection(Some(&collection_info))
                .payer(&owner_info)
                .authority(Some(&owner_info))
                .system_program(&system_program_info)
                .key(ExternalPluginAdapterKey::Oracle(oracle.base_address))
                .invoke()?;

            //   // Remove the Oracle Plugin
            //   let (oracle_pda, _) = Pubkey::find_program_address(
            //     &[b"oracle", product_account.key().as_ref()],
            //     ctx.program_id,
            // );
            // RemoveExternalPluginAdapterV1CpiBuilder::new(
            //     &ctx.accounts.core_program.to_account_info(),
            // )
            // .asset(&product_account)
            // .collection(Some(&ctx.accounts.listing_collection.to_account_info()))
            // .payer(&ctx.accounts.owner.to_account_info())
            // .authority(Some(&ctx.accounts.owner.to_account_info()))
            // .system_program(&ctx.accounts.system_program.to_account_info())
            // .key(ExternalPluginAdapterKey::Oracle(oracle_pda))
            // .invoke()?;

            // // Close the Oracle account
            // let oracle_seeds = &[b"oracle", product_account.key().as_ref()];
            // let (oracle_pda, _bump) = Pubkey::find_program_address(oracle_seeds, ctx.program_id);

            // let oAccount: std::result::Result<Asset, std::io::Error> = deserialized_product

            // let oracle_account_info = Account::<OrderOracle>::try_from(&oracle_pda)?;
            // let oracle_lamports = product_account.to_account_info().lamports();
            // **oracle_account_info
            //     .to_account_info()
            //     .try_borrow_mut_lamports()? = 0;
            // **ctx.accounts.owner.try_borrow_mut_lamports()? += oracle_lamports;

            // oracle_account_info.close(ctx.accounts.owner.to_account_info())?;

            product_listing.in_stock -= 1;
        }

        if product_listing.in_stock == 0 {
            clickcrate.product = None;
            product_listing.clickcrate_pos = None;

            // Close the vault account
            let vault_lamports = vault.to_account_info().lamports();
            **vault.to_account_info().try_borrow_mut_lamports()? = 0;
            **ctx.accounts.owner.try_borrow_mut_lamports()? += vault_lamports;

            product_listing.vault = Pubkey::default();
        }

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
            ClickCrateErrors::ProductNotFound
        );

        // Check the order status in the oracle
        require!(
            oracle.order_status == OrderStatus::Placed,
            ClickCrateErrors::ProductNotPlaced
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
        new_order_status: OrderStatus,
    ) -> Result<()> {
        let oracle = &mut ctx.accounts.oracle;

        require!(
            ctx.accounts.seller.key() == ctx.accounts.product_listing.owner
                || ctx.accounts.seller.key() == ctx.accounts.product_listing.manager,
            ClickCrateErrors::UnauthorizedUpdate
        );

        oracle.order_status = new_order_status.clone();
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
            product.base.owner.key() == ctx.accounts.seller.key(),
            ClickCrateErrors::UnauthorizedUpdate
        );

        // Check the order status
        require!(
            ctx.accounts.oracle.order_status == OrderStatus::Completed,
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
