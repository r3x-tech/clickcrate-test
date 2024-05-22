// Here we export some useful types and functions for interacting with the Anchor program.
import { Cluster, PublicKey } from '@solana/web3.js';
import type { ClickcrateTest } from '../target/types/clickcrate_test';
import { IDL as ClickcrateTestIDL } from '../target/types/clickcrate_test';

// Re-export the generated IDL and type
export { ClickcrateTest, ClickcrateTestIDL };

// After updating your program ID (e.g. after running `anchor keys sync`) update the value below.
export const CLICKCRATE_TEST_PROGRAM_ID = new PublicKey(
  '7jRDDp6J9q4C1ZKy8uKsoCy7ffGUWuQar5wYk2vFgK1v'
);

// This is a helper function to get the program ID for the ClickcrateTest program depending on the cluster.
export function getClickcrateTestProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return CLICKCRATE_TEST_PROGRAM_ID;
  }
}
