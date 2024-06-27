// import * as anchor from '@coral-xyz/anchor';
// import { Program } from '@coral-xyz/anchor';
// import { Keypair } from '@solana/web3.js';
// import { ClickcrateTest } from '../target/types/clickcrate_test';

describe('clickcrate-test', () => {
  // Configure the client to use the local cluster.
  // const provider = anchor.AnchorProvider.env();
  // anchor.setProvider(provider);
  // const payer = provider.wallet as anchor.Wallet;
  // const program = anchor.workspace.ClickcrateTest as Program<ClickcrateTest>;
  // const clickcrateTestKeypair = Keypair.generate();
  // it('Initialize ClickcrateTest', async () => {
  //   await program.methods
  //     .initialize()
  //     .accounts({
  //       clickcrateTest: clickcrateTestKeypair.publicKey,
  //       payer: payer.publicKey,
  //     })
  //     .signers([clickcrateTestKeypair])
  //     .rpc();
  //   const currentCount = await program.account.clickcrateTest.fetch(
  //     clickcrateTestKeypair.publicKey
  //   );
  //   expect(currentCount.count).toEqual(0);
  // });
  // it('Increment ClickcrateTest', async () => {
  //   await program.methods
  //     .increment()
  //     .accounts({ clickcrateTest: clickcrateTestKeypair.publicKey })
  //     .rpc();
  //   const currentCount = await program.account.clickcrateTest.fetch(
  //     clickcrateTestKeypair.publicKey
  //   );
  //   expect(currentCount.count).toEqual(1);
  // });
  // it('Increment ClickcrateTest Again', async () => {
  //   await program.methods
  //     .increment()
  //     .accounts({ clickcrateTest: clickcrateTestKeypair.publicKey })
  //     .rpc();
  //   const currentCount = await program.account.clickcrateTest.fetch(
  //     clickcrateTestKeypair.publicKey
  //   );
  //   expect(currentCount.count).toEqual(2);
  // });
  // it('Decrement ClickcrateTest', async () => {
  //   await program.methods
  //     .decrement()
  //     .accounts({ clickcrateTest: clickcrateTestKeypair.publicKey })
  //     .rpc();
  //   const currentCount = await program.account.clickcrateTest.fetch(
  //     clickcrateTestKeypair.publicKey
  //   );
  //   expect(currentCount.count).toEqual(1);
  // });
  // it('Set clickcrateTest value', async () => {
  //   await program.methods
  //     .set(42)
  //     .accounts({ clickcrateTest: clickcrateTestKeypair.publicKey })
  //     .rpc();
  //   const currentCount = await program.account.clickcrateTest.fetch(
  //     clickcrateTestKeypair.publicKey
  //   );
  //   expect(currentCount.count).toEqual(42);
  // });
  // it('Set close the clickcrateTest account', async () => {
  //   await program.methods
  //     .close()
  //     .accounts({
  //       payer: payer.publicKey,
  //       clickcrateTest: clickcrateTestKeypair.publicKey,
  //     })
  //     .rpc();
  //   // The account should no longer exist, returning null.
  //   const userAccount = await program.account.clickcrateTest.fetchNullable(
  //     clickcrateTestKeypair.publicKey
  //   );
  //   expect(userAccount).toBeNull();
  // });
});
