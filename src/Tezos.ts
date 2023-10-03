import {TezosToolkit} from "@taquito/taquito";
import {artcrowdContract, tezosUrl, tezosNetwork, feePct} from "./Constants";
import {BeaconWallet} from "@taquito/beacon-wallet";
import { NetworkType } from '@airgap/beacon-types';

export const buyShares = async (projectId: number, sharePrice: number, numShares: number) => {
    try {
        const walletPermissions = {
            network: {
                type: tezosNetwork as NetworkType,
                rpcUrl: tezosUrl
            }
        }
        const Tezos = new TezosToolkit(walletPermissions.network.rpcUrl);
        const wallet = new BeaconWallet({name: 'Artcrowd', network: walletPermissions.network});
        if (!localStorage.getItem('beacon:active-account') || localStorage.getItem('beacon:active-account') === 'undefined') {
            await wallet.requestPermissions(walletPermissions);
        }
        Tezos.setWalletProvider(wallet);

        return await Tezos.wallet.at(artcrowdContract)
            .then((contract) => contract.methods
                .buy_shares(numShares, projectId)
                .send({amount: Math.floor(numShares * sharePrice * (1 + feePct/100) * 1_000_000), mutez: true}))
            .then((op) => {
                return op.confirmation().then(() => op.opHash)
            })
    } catch (error) {
        console.error(error)
    }
}
