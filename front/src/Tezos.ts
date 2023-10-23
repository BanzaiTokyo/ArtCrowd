import {TezosToolkit} from "@taquito/taquito";
import {ARTCROWD_CONTRACT, TEZOS_URL, TEZOS_NETWORK, FEE_PCT} from "./Constants";
import {BeaconWallet} from "@taquito/beacon-wallet";
import { NetworkType } from '@airgap/beacon-types';

export const buyShares = async (projectId: number, sharePrice: number, numShares: number) => {
    try {
        const walletPermissions = {
            network: {
                type: TEZOS_NETWORK as NetworkType,
                rpcUrl: TEZOS_URL
            }
        }
        const Tezos = new TezosToolkit(walletPermissions.network.rpcUrl);
        const wallet = new BeaconWallet({name: 'Artcrowd', network: walletPermissions.network});
        if (!localStorage.getItem('beacon:active-account') || localStorage.getItem('beacon:active-account') === 'undefined') {
            await wallet.requestPermissions(walletPermissions);
        }
        Tezos.setWalletProvider(wallet);

        return await Tezos.wallet.at(ARTCROWD_CONTRACT)
            .then((contract) => contract.methods
                .buy_shares(numShares, projectId)
                .send({amount: Math.floor(numShares * sharePrice * (1 + FEE_PCT/100) * 1_000_000), mutez: true}))
            .then((op) => {
                return op.confirmation(1).then((result) => {
                    return {blockhash: result!.block.hash, ophash: op.opHash}
                })
            })
    } catch (error) {
        console.error(error)
    }
}
