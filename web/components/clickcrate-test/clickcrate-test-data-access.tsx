'use client';

import {
  ClickcrateTestIDL,
  getClickcrateTestProgramId,
} from '@clickcrate-test/anchor';
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, Keypair, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';

export function useClickcrateTestProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getClickcrateTestProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = new Program(ClickcrateTestIDL, programId, provider);

  const accounts = useQuery({
    queryKey: ['clickcrate-test', 'all', { cluster }],
    queryFn: () => program.account.clickcrateTest.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initialize = useMutation({
    mutationKey: ['clickcrate-test', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods
        .initialize()
        .accounts({ clickcrateTest: keypair.publicKey })
        .signers([keypair])
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to initialize account'),
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  };
}

export function useClickcrateTestProgramAccount({
  account,
}: {
  account: PublicKey;
}) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useClickcrateTestProgram();

  const accountQuery = useQuery({
    queryKey: ['clickcrate-test', 'fetch', { cluster, account }],
    queryFn: () => program.account.clickcrateTest.fetch(account),
  });

  const closeMutation = useMutation({
    mutationKey: ['clickcrate-test', 'close', { cluster, account }],
    mutationFn: () =>
      program.methods.close().accounts({ clickcrateTest: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  const decrementMutation = useMutation({
    mutationKey: ['clickcrate-test', 'decrement', { cluster, account }],
    mutationFn: () =>
      program.methods.decrement().accounts({ clickcrateTest: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const incrementMutation = useMutation({
    mutationKey: ['clickcrate-test', 'increment', { cluster, account }],
    mutationFn: () =>
      program.methods.increment().accounts({ clickcrateTest: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const setMutation = useMutation({
    mutationKey: ['clickcrate-test', 'set', { cluster, account }],
    mutationFn: (value: number) =>
      program.methods.set(value).accounts({ clickcrateTest: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  };
}
