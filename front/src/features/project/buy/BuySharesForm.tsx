import React, {useState} from 'react';
import {SubmitHandler, useForm} from "react-hook-form"
import {useAuth} from "../../../components/AuthContext";
import {API_BASE_URL} from "../../../Constants";
import {calculateCommission, configureFetch} from "../../../utils";
import {buyShares} from "../../../Tezos";
import {Project} from "../../../models/Project";
import {Box, Button, TextField, Typography} from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';

interface IBuyShares {
    num_shares: number
}

interface BuySharesFormParams {
    project: Project;
    onSubmitCallback?: any
}

function BuySharesForm(params: BuySharesFormParams) {
    const {project, onSubmitCallback} = params;
    const {register, handleSubmit, setError, formState: {errors}} = useForm<IBuyShares>()
    const {token} = useAuth();
    const fetchWithAuth = configureFetch(token);
    const [selectedNumShares, setSelectedNumShares] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const maxSharesCanBuy = project.max_shares ? project.max_shares - project.shares_num : undefined

    const onSubmit: SubmitHandler<IBuyShares> = async (data) => {
        setIsLoading(true)
        const opResult = await buyShares(project.id, project.share_price, data.num_shares);
        if (!opResult) {
            setIsLoading(false)
            return
        }
        try {
            const response = await fetchWithAuth(API_BASE_URL + `projects/${project.id}/buy`, {
                method: 'POST',
                body: JSON.stringify(opResult),
            });
            const responseData = await response.json();
            setIsLoading(false)
            if (response.ok) {
                !!onSubmitCallback && onSubmitCallback(responseData)
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
            setIsLoading(false)
        }
    };

    const onNumSharesUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (project.max_shares != null && Number(event.target.value) > (project.max_shares - project.shares_num)) {
            event.preventDefault(); // is this line needed?
            return;
        }
        setSelectedNumShares(Number(event.target.value));
    }

    const validateNumSharesInput = (e: any) => {
        if (
            !/[0-9]/.test(e.key) &&
            !["Backspace", "Delete", "Enter", "ArrowUp", "ArrowDown"].includes(e.key)
        ) {
            e.preventDefault();
        }
    };

    return (
        <Box sx={{paddingTop:'1rem'}}>
            <form onSubmit={handleSubmit(onSubmit)}>

                <TextField
                    // defaultValue={1}
                    sx={{width: '260px'}}
                    type="number"
                    value={selectedNumShares}
                    label="Number of shares"
                    inputProps={{
                        ...register("num_shares", {required: true, valueAsNumber: true}),
                        inputMode: "numeric",
                        min: 1,
                        max: maxSharesCanBuy,
                        pattern: "[0-9]*"
                    }}

                    error={!!errors.num_shares}
                    onKeyDown={validateNumSharesInput}
                    onChange={onNumSharesUpdate}
                    helperText={errors.num_shares?.message}
                />

                {/*<Stack direction={'row'}>*/}
                {/*    <IconButton size={'large'}*/}
                {/*                color={'primary'}*/}
                {/*                sx={{*/}
                {/*                    width: '50px',*/}
                {/*                    height: '30px',*/}
                {/*                    borderRadius: 5,*/}
                {/*                    border: "1px solid",*/}
                {/*                    borderColor: "primary.main",*/}
                {/*                }}>*/}
                {/*        <RemoveIcon/>*/}
                {/*    </IconButton>*/}
                {/*    <Box sx={{width:'1rem'}}/>*/}
                {/*    <div>{selectedNumShares}</div>*/}
                {/*    <Box sx={{width:'1rem'}}/>*/}
                {/*    <IconButton size={'large'}*/}
                {/*                color={'primary'}*/}
                {/*                sx={{*/}
                {/*                    width: '50px',*/}
                {/*                    height: '30px',*/}
                {/*                    borderRadius: 5,*/}
                {/*                    border: "1px solid",*/}
                {/*                    borderColor: "primary.main",*/}
                {/*                }}>*/}
                {/*        <AddIcon/>*/}
                {/*    </IconButton>*/}
                {/*</Stack>*/}

                <Typography>You will pay: <strong>{selectedNumShares * project.share_price}</strong> Tez
                    + <strong>{calculateCommission(selectedNumShares * project.share_price)}</strong> Tez
                    (commission)</Typography>
                <br/>

                {/*<input {...register("num_shares", {required: true, valueAsNumber: true})} /> shares*/}
                <Button type="submit" variant="contained" size={'large'} startIcon={<FavoriteIcon/>} disabled={isLoading}>
                    <span>{isLoading ? 'Performing blockchain operations...' : 'Buy'}</span>
                </Button>

                <br/>
                {errors.num_shares && <span>{errors.num_shares.message || 'field required'}</span>}
            </form>
        </Box>
    );
}

export default BuySharesForm;
