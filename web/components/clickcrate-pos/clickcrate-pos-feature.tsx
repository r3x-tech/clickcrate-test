'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useClickcratePosProgram } from './clickcrate-pos-data-access';
import { ClickCratePosRegister, ClickCratePosList } from './clickcrate-pos-ui';

export default function ClickcratePosFeature() {
  const { publicKey } = useWallet();
  const { programId } = useClickcratePosProgram();

  return publicKey ? (
    <div>
      <AppHero
        // title="ClickcrateTest"
        // subtitle={
        //   'Create a new ClickCrate POS or product listing by clicking the "Register" button. The state of a account is stored on-chain and can be manipulated by calling the program\'s methods (update, place, etc.).'
        // }
        title=""
        subtitle=""
      >
        <div className="flex flex-row">
          <p className="mb-6 text-start font-bold">Current Registry: </p>
          <p className="pl-2 text-start font-normal">
            <ExplorerLink
              path={`account/${programId}`}
              label={ellipsify(programId.toString())}
            />
          </p>
        </div>

        <ClickCratePosRegister />
        <ClickCratePosList />
      </AppHero>
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
