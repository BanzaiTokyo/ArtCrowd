import React from 'react';
import {useNavigate} from "react-router-dom";
import { useForm, SubmitHandler } from "react-hook-form"
import {useAuth} from "./AuthContext";
import {apiBaseUrl} from "../Constants";
import {configureFetch} from "../utils";
import {buyShares} from "../Tezos";

interface IBuyShares {
  num_shares: number
}

function BuySharesForm(params: any) {
  const {project} = params;
  const { register, handleSubmit, setError, formState: { errors } } = useForm<IBuyShares>()
  const navigate = useNavigate();
  const { token } = useAuth();
  const fetchWithAuth = configureFetch(token);

  const onSubmit: SubmitHandler<IBuyShares> = async (data) => {
    console.log(data)
    const ophash = await buyShares(project.id, project.share_price, data.num_shares);
    if (!ophash) {
      return
    }
    try {
      const response = await fetchWithAuth(apiBaseUrl+`${project.id}/buy`, {
        method: 'POST',
        body: JSON.stringify({ophash}),
      });
      const responseData = await response.json();
      if (response.ok) {
        //navigate(`${responseData.id}`)
      } else {
        for (const field in responseData) {
          if (field in errors) {
            setError(field as keyof IBuyShares, {
              type: 'manual',
              message: responseData[field][0],
            });
          }
        }
      }
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  return (
    <div>
    <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register("num_shares", {required: true, valueAsNumber: true})} /> shares
        <button type="submit">Buy</button>
        <br />
        { errors.num_shares && <span>{errors.num_shares.message || 'field required'}</span> }
    </form>
    </div>
  );
};

export default BuySharesForm;
