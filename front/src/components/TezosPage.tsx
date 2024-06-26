import React, { useState } from 'react';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { TezosToolkit } from '@taquito/taquito';
import {TEZOS_URL, ARTCROWD_CONTRACT, API_BASE_URL} from "../Constants";

const TezosPage: React.FC = (params: any) => {
  const {projectId, numShares, sharePrice} = params;
  const [operationHash, setOperationHash] = useState('');

  const callTezosContract = async () => {
    try {
      const Tezos = new TezosToolkit(TEZOS_URL);
      const wallet = new BeaconWallet({ name: 'Artcrowd' });
      await wallet.client.requestPermissions();
      Tezos.setWalletProvider(wallet);
      const operationHash = await Tezos.wallet.at(ARTCROWD_CONTRACT)
        .then((contract) => contract.methods
          .buy_shares(projectId, numShares)
          .send({amount: numShares*sharePrice}))
        .then((op) => {
          return op.confirmation().then(() => op.opHash)
        })
      return operationHash;
      const data = await fetch(API_BASE_URL+`${projectId}/buy`, {
        method: 'POST',
        body: JSON.stringify({ operationHash }),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((response) => response.json());
      setOperationHash(data.operationHash);
    } catch (error) {
      // Handle Tezos contract interaction error.
    }
  };

  return (
    <div>
      <button onClick={callTezosContract}>Call Tezos Contract</button>
      <p>Operation Hash: {operationHash}</p>
    </div>
  );
};

export default TezosPage;
