'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useClickcratePosProgram } from './clickcrate-pos-data-access';
import { ClickCratePosList, ClickCratePosRegister } from './clickcrate-pos-ui';
import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';

export default function ClickcratePosFeature() {
  const { publicKey } = useWallet();
  // const { programId } = useClickcratePosProgram();
  const [showModal, setShowModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const toggleActionsMenu = () => {
    setShowActionsMenu(!showActionsMenu);
  };

  const [selectedClickCrates, setSelectedClickCrates] = useState<PublicKey[]>(
    []
  );

  const handleClickCrateSelect = (account: PublicKey, selected: boolean) => {
    if (selected) {
      setSelectedClickCrates([...selectedClickCrates, account]);
    } else {
      setSelectedClickCrates(
        selectedClickCrates.filter((clickCrate) => !clickCrate.equals(account))
      );
    }
  };

  const handleActivate = () => {
    // Handle activate action for selected ClickCrates
    console.log('Activate action for:', selectedClickCrates);
    setShowActionsMenu(false);
  };

  const handleDeactivate = () => {
    // Handle deactivate action for selected ClickCrates
    console.log('Deactivate action for:', selectedClickCrates);
    setShowActionsMenu(false);
  };

  return publicKey ? (
    <div className="flex flex-col justify-center items-center mx-0 px-0 w-[100vw]">
      <div
        className={`transition-all duration-300 ${showModal ? 'blur-sm' : ''}`}
      >
        <AppHero
          // title="ClickcrateTest"
          // subtitle={
          //   'Create a new ClickCrate POS or product listing by clicking the "Register" button. The state of a account is stored on-chain and can be manipulated by calling the program\'s methods (update, place, etc.).'
          // }
          title=""
          subtitle=""
        >
          <div className="flex flex-row items-end w-[100%] h-[3rem] mb-4">
            <div className="flex flex-row flex-1 justify-start items-end">
              <p
                className="text-start font-bold text-xl text-white tracking-wide"
                // style={{
                //   fontFamily: 'Montserrat, sans-serif',
                //   fontWeight: '600',
                // }}
              >
                My ClickCrates (POS)
              </p>
            </div>
            <div className="flex flex-row flex-1 justify-end items-start gap-4">
              <div className="dropdown dropdown-end">
                <label
                  tabIndex={0}
                  className="btn btn-xs lg:btn-sm btn-outline w-[10rem] py-3 font-light"
                  onClick={toggleActionsMenu}
                >
                  More Actions
                </label>
                {showActionsMenu && (
                  <ul
                    tabIndex={0}
                    className="menu dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-52 mt-4 gap-2"
                    style={{ border: '2px solid white' }}
                  >
                    <li>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={handleActivate}
                      >
                        Activate
                      </button>
                    </li>
                    <li>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={handleDeactivate}
                      >
                        Deactivate
                      </button>
                    </li>
                  </ul>
                )}
              </div>
              <div>
                <button
                  className="btn btn-xs lg:btn-sm btn-primary py-3 w-[10rem]"
                  onClick={toggleModal}
                  disabled={false}
                >
                  Register
                </button>
              </div>
            </div>
          </div>
          <ClickCratePosList onSelect={handleClickCrateSelect} />
        </AppHero>
      </div>
      {showModal && (
        <ClickCratePosRegister show={showModal} onClose={toggleModal} />
      )}{' '}
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
