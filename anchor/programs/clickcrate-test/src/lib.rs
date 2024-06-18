use anchor_lang::prelude::*;
use mpl_core::{
    instructions::{
        AddPluginV1Builder, ApprovePluginAuthorityV1Builder, TransferV1Builder,
        UpdatePluginV1Builder,
    },
    types::{
        Attribute, Attributes, FreezeDelegate, Plugin, PluginAuthority, PluginType,
        TransferDelegate,
    },
};
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, program::invoke, program::invoke_signed,
    pubkey::Pubkey, system_instruction,
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
    use std::collections::BTreeMap;

    use super::*;

    pub fn register_clickcrate(
        ctx: Context<RegisterClickCrate>,
        id: Pubkey,
        eligible_placement_type: PlacementType,
        eligible_product_category: ProductCategory,
        manager: Pubkey,
    ) -> Result<()> {
        msg!("ClickCrate Registration in progress");
        let clickcrate = &mut ctx.accounts.clickcrate;
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

    pub fn place_product_listing(
        ctx: Context<PlaceProductListing>,
        product_id: Pubkey,
        clickcrate_id: Pubkey,
    ) -> ProgramResult {
        let clickcrate = &mut ctx.accounts.clickcrate;
        let product_listing = &mut ctx.accounts.product_listing;
        clickcrate.product = Some(product_id);
        product_listing.clickcrate_pos = Some(clickcrate_id);

        let freeze_ix = UpdatePluginV1Builder::new()
            .asset(product_id)
            .payer(ctx.accounts.owner.key())
            .plugin(Plugin::FreezeDelegate(FreezeDelegate { frozen: true }))
            .instruction();

        let signers = vec![ctx.accounts.owner.to_account_info()];
        let instructions = vec![freeze_ix];

        invoke_signed(
            &instructions.concat(),
            &[
                ctx.accounts.clickcrate.to_account_info(),
                ctx.accounts.product_listing.to_account_info(),
                ctx.accounts.owner.to_account_info(),
            ],
            &[signers.as_slice()],
        )?;

        Ok(())
    }

    pub fn remove_product_listing(
        ctx: Context<RemoveProductListing>,
        _product_id: Pubkey,
        _clickcrate_id: Pubkey,
    ) -> Result<()> {
        let clickcrate = &mut ctx.accounts.clickcrate;
        let product_listing = &mut ctx.accounts.product_listing;
        clickcrate.product = None;
        product_listing.clickcrate_pos = None;
        Ok(())
    }

    pub fn make_purchase(
        ctx: Context<MakePurchase>,
        product_id: Pubkey,
        quantity: u64,
    ) -> ProgramResult {
        let clickcrate = &mut ctx.accounts.clickcrate;
        let product_listing = &mut ctx.accounts.product_listing;
        let order_oracle = &ctx.accounts.order_oracle;

        require!(
            clickcrate.product == Some(product_id),
            ClickCrateErrors::ProductNotFound
        );

        let order_status = order_oracle
            .order_statuses
            .get(&product_id)
            .ok_or(ClickCrateErrors::OrderNotFound)?;

        require!(
            *order_status == OrderStatus::Confirmed,
            ClickCrateErrors::OrderNotConfirmed
        );

        if product_listing.in_stock >= quantity {
            product_listing.in_stock -= quantity;
            product_listing.sold += quantity;

            let vault_pda = Pubkey::find_program_address(&[b"vault"], ctx.program_id).0;
            let authority_pda = Pubkey::find_program_address(&[b"authority"], ctx.program_id).0;

            // Transfer funds from the buyer to the vault PDA
            invoke(
                &system_instruction::transfer(
                    ctx.accounts.owner.key,
                    &vault_pda,
                    product_listing.price * quantity,
                ),
                &[
                    ctx.accounts.owner.to_account_info(),
                    ctx.accounts.vault.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
            )?;

            // Unfreeze the product NFT
            let unfreeze_ix = UpdatePluginV1Builder::new()
                .asset(product_id)
                .payer(authority_pda)
                .plugin(Plugin::FreezeDelegate(FreezeDelegate { frozen: false }))
                .instruction();

            // Transfer the product NFT to the buyer's wallet
            let transfer_ix = TransferV1Builder::new()
                .authority(authority_pda)
                .from(product_id)
                .to(ctx.accounts.owner.key())
                .instruction();

            // Set the order status attribute to "confirmed"
            let set_order_status_ix = UpdatePluginV1Builder::new()
                .asset(product_id)
                .payer(authority_pda)
                .plugin(Plugin::Attributes(Attributes {
                    attribute_list: vec![Attribute {
                        key: "order_status".to_string(),
                        value: "confirmed".to_string(),
                    }],
                }))
                .instruction();

            let signers = vec![ctx.accounts.authority.to_account_info()];
            let instructions = vec![unfreeze_ix, transfer_ix, set_order_status_ix];

            invoke_signed(
                &instructions.concat(),
                &[
                    ctx.accounts.clickcrate.to_account_info(),
                    ctx.accounts.product_listing.to_account_info(),
                    ctx.accounts.owner.to_account_info(),
                    ctx.accounts.authority.to_account_info(),
                ],
                &[signers.as_slice()],
            )?;
        } else {
            return Err(ClickCrateErrors::ProductOutOfStock);
        }

        Ok(())
    }

    pub fn create_oracle_account(ctx: Context<CreateOracleAccount>, _seller: Pubkey) -> Result<()> {
        let oracle_account = &mut ctx.accounts.oracle;

        oracle_account.validation = OracleValidation::Uninitialized;
        oracle_account.order_statuses = BTreeMap::new();
        oracle_account.bump = ctx.bumps.oracle;

        Ok(())
    }

    pub fn update_order_status(
        ctx: Context<UpdateOrderStatus>,
        product_id: Pubkey,
        new_order_status: OrderStatus,
    ) -> ProgramResult {
        let oracle_account: &mut Account<OrderOracle> = &mut ctx.accounts.oracle;

        oracle_account
            .order_statuses
            .insert(product_id, new_order_status.clone());

        match &new_order_status {
            OrderStatus::Pending => {
                oracle_account.validation = OracleValidation::V1 {
                    create: ExternalValidationResult::Pass,
                    transfer: ExternalValidationResult::Rejected,
                    burn: ExternalValidationResult::Pass,
                    update: ExternalValidationResult::Pass,
                };
            }

            OrderStatus::Placed
            | OrderStatus::Confirmed
            | OrderStatus::Fulfilled
            | OrderStatus::Delivered => {
                oracle_account.validation = OracleValidation::V1 {
                    create: ExternalValidationResult::Rejected,
                    transfer: ExternalValidationResult::Rejected,
                    burn: ExternalValidationResult::Rejected,
                    update: ExternalValidationResult::Pass,
                };
            }

            OrderStatus::Cancelled | OrderStatus::Completed => {
                oracle_account.validation = OracleValidation::V1 {
                    create: ExternalValidationResult::Approved,
                    transfer: ExternalValidationResult::Approved,
                    burn: ExternalValidationResult::Rejected,
                    update: ExternalValidationResult::Pass,
                };
            }
        }

        Ok(())
    }

    pub fn complete_order(ctx: Context<CompleteOrder>, product_id: Pubkey) -> ProgramResult {
        let oracle_account = &mut ctx.accounts.oracle;
        let seller = &ctx.accounts.seller;
        let product_nft = &ctx.accounts.product_nft;
        let vault = &ctx.accounts.vault;

        let order_status = oracle_account
            .order_statuses
            .get(&product_id)
            .ok_or(ClickCrateErrors::OrderNotFound.into())?;

        require!(
            *order_status == OrderStatus::Completed,
            ClickCrateErrors::OrderNotCompleted.into()
        );

        let amount = product_nft.price;

        invoke(
            &system_instruction::transfer(&vault.key(), &seller.key(), amount),
            &[
                vault.to_account_info(),
                seller.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        Ok(())
    }
}
