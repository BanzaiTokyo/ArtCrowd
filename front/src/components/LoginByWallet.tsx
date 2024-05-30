import React from 'react';
import {TezosToolkit} from "@taquito/taquito";
import {BeaconWallet} from '@taquito/beacon-wallet';
import {char2Bytes} from '@taquito/utils';
import {
    Network,
    NetworkType,
    RequestSignPayloadInput,
    SigningType,
    SignPayloadResponseOutput
} from '@airgap/beacon-types';
import {API_BASE_URL, SITE_NAME, TEZOS_NETWORK, TEZOS_URL} from "../Constants";
import {useAuth} from "./AuthContext";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import {useNavigate} from "react-router-dom";
import {Box, Button, Link} from "@mui/material";
import IconButton from "@mui/material/IconButton";


const FormPage: React.FC = () => {
    const {login, profile, logout} = useAuth();
    const navigate = useNavigate();

    //todo: put into a service file
    const connectWallet = async () => {
        let myAddress: string;
        const walletPermissions = {
            network: {
                type: TEZOS_NETWORK as NetworkType,
                rpcUrl: TEZOS_URL
            } as Network
        }
        const Tezos = new TezosToolkit(walletPermissions.network.rpcUrl!);
        const wallet = new BeaconWallet({name: SITE_NAME, network: walletPermissions.network});
        let account;

        Tezos.setWalletProvider(wallet);
        try {
            account = await wallet.client.getActiveAccount();
        } catch (error) {
            console.error('Error getting active account:', error);
        }
        if (account) {
            myAddress = account.address;
            console.log("Already connected:", account.address);
        } else {
            await wallet.requestPermissions();
            myAddress = await wallet.getPKH();
            console.log("New connection:", myAddress);
        }
        return myAddress
    }
    const makePayload = (myAddress: string) => {
        const formattedInput: string = [
            'I want to login on',
            SITE_NAME,
            'at',
            new Date().toISOString(),
        ].join(' ');
        const bytes = char2Bytes(formattedInput);
        const bytesLength = (bytes.length / 2).toString(16);
        const addPadding = `00000000${bytesLength}`;
        const paddedBytesLength = addPadding.slice(addPadding.length - 8);
        const payloadBytes = '0501' + paddedBytesLength + bytes;
        const payload: RequestSignPayloadInput = {
            signingType: SigningType.MICHELINE,
            payload: payloadBytes,
            sourceAddress: myAddress,
        };
        return payload
    }
    const handleLogin = async () => {
        const myAddress = await connectWallet()
        const payload = makePayload(myAddress)
        try {
            const wallet = new BeaconWallet({name: SITE_NAME});
            wallet.client.requestSignPayload(payload).then((signedPayload: SignPayloadResponseOutput) => {
                const {signature} = signedPayload;
                const postData = {
                    wallet: myAddress,
                    message: payload.payload,
                    signature
                };
                return sendTokenToServer(postData)
            })
        } catch (error) {
            console.error('Error connecting wallet:', error);
        }

    }

    const handleLogout = async () => {
        logout();
    }

    const sendTokenToServer = (formData: Record<string, string>) => fetch(API_BASE_URL + 'login-by-wallet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Convert form data to JSON
    })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                login(data);
                navigate('/')
            } else {
                alert(data.non_field_errors[0] || data);
            }
        })
        .catch((error) => {
            // Handle fetch error, e.g., network issue
            console.error('An error occurred while submitting the form:', error);
        });

    return profile ? (
        <Box>
            <IconButton aria-label="logout" onClick={handleLogout}><LogoutIcon/></IconButton>

            <Link href={`/profile/${encodeURIComponent(profile.username)}`} underline="none" sx={{ color: '#FFF' }}>{profile.username}</Link>

        </Box>) : (
        <div>
            <Button variant="text" startIcon={<AccountBalanceWalletIcon/>} onClick={handleLogin} sx={{color:'white'}}>
                connect
            </Button>
        </div>
    );
};

export default FormPage;
