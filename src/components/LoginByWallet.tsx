import React, { useState } from 'react';
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from '@taquito/beacon-wallet';
import { char2Bytes } from '@taquito/utils';
import {RequestSignPayloadInput, SigningType, SignPayloadResponseOutput} from '@airgap/beacon-types';
import {apiBaseUrl, siteName, tezosUrl} from "../Constants";
import {useAuth} from "./AuthContext";
import {useNavigate} from "react-router-dom";


const FormPage: React.FC = () => {
  const { login, profile } = useAuth();
  const navigate = useNavigate();

  const connectWallet = async () => {
    let myAddress: string;
    const Tezos = new TezosToolkit(tezosUrl);
    const wallet = new BeaconWallet({name: siteName});
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
      siteName,
      'at',
      new Date().toISOString(),
    ].join(' ');
    const bytes = char2Bytes(formattedInput);
    const bytesLength = (bytes.length / 2).toString(16);
    const addPadding = `00000000${bytesLength}`;
    const paddedBytesLength = addPadding.slice(addPadding.length - 8);
    const payloadBytes = '05' + '01' + paddedBytesLength + bytes;
    const payload: RequestSignPayloadInput = {
      signingType: SigningType.MICHELINE,
      payload: payloadBytes,
      sourceAddress: myAddress,
    };
    return payload
  }
  const handleSubmit = async () => {
    const myAddress = await connectWallet()
    const payload = makePayload(myAddress)
    try {
      const wallet = new BeaconWallet({name: siteName});
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
  const sendTokenToServer = (formData:Record<string, string>) => fetch(apiBaseUrl+'login-by-wallet', {
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

  return profile ? (<>
      <img alt={profile.username} src={profile.avatar} />
      {profile.username}
  </>) : (
    <div>
      <button onClick={handleSubmit}>Login with a wallet</button>
    </div>
  );
};

export default FormPage;
