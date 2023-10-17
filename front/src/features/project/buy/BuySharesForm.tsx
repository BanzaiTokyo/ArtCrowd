import React, {useState} from 'react';
import {SubmitHandler, useForm} from "react-hook-form"
import {useAuth} from "../../../components/AuthContext";
import {API_BASE_URL} from "../../../Constants";
import {configureFetch} from "../../../utils";
import {buyShares} from "../../../Tezos";
import {Project} from "../../../models/Project";
import {Grid, TextField} from "@mui/material";

interface IBuyShares {
    num_shares: number
}

interface BuySharesFormParams {
    project: Project;
}

function BuySharesForm(params: BuySharesFormParams) {
    const {project} = params;
    const {register, handleSubmit, setError, formState: {errors}} = useForm<IBuyShares>()
    const {token} = useAuth();
    const fetchWithAuth = configureFetch(token);
    const [sharesLeft, setSharesLeft] = useState<number | undefined>(project.max_shares && project.max_shares - project.shares_num);

    const onSubmit: SubmitHandler<IBuyShares> = async (data) => {
        console.log(data)
        const ophash = await buyShares(project.id, project.share_price, data.num_shares);
        if (!ophash) {
            return
        }
        try {
            const response = await fetchWithAuth(API_BASE_URL + `${project.id}/buy`, {
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

    const onNumSharesUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(sharesLeft != null && Number(event.target.value) > sharesLeft) {
            event.preventDefault();
            console.log('preventing...');
        }
        console.log(event.target.value);
    }

    const validateNumSharesInput = (e:any) => {
        if (
            !/[0-9]/.test(e.key) &&
            e.key !== "Backspace" &&
            e.key !== "Delete" &&
            e.key !== "Enter"
        ) {
            e.preventDefault();
        }
    };

    return (
        <div>
            {sharesLeft && <div> available shares: <strong>{sharesLeft}</strong></div>}
            <form onSubmit={handleSubmit(onSubmit)}>

                <TextField
                    defaultValue={1}
                    sx={{maxWidth: '260px'}}
                    type="number"
                    label="Purchase shares"
                    inputProps={{...register("num_shares", {required: true, valueAsNumber: true}), inputMode: "numeric", pattern: "[0-9]*"}  }

                    error={!!errors.num_shares}
                    onKeyDown={validateNumSharesInput}
                    onChange={onNumSharesUpdate}
                    helperText={errors.num_shares?.message}
                />


                {/*<input {...register("num_shares", {required: true, valueAsNumber: true})} /> shares*/}
                <button type="submit">Buy</button>
                <br/>
                {errors.num_shares && <span>{errors.num_shares.message || 'field required'}</span>}
            </form>
        </div>
    );
};

export default BuySharesForm;
