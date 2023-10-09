import React, {useState} from 'react';
import {useNavigate} from "react-router-dom";
import {Controller, SubmitHandler, useForm} from "react-hook-form";
import {Button, FormControl, FormControlLabel, Grid, Radio, RadioGroup, TextField, Typography} from "@mui/material";
import {useAuth} from "../../components/AuthContext";
import {configureFetch} from "../../utils";
import dayjs from "dayjs";
import {grey} from '@mui/material/colors';
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";

interface INewProject {
    title: string
    description: string
    image: File
    customDeadline: dayjs.Dayjs
    durationDays: number
    share_price: number
    min_shares: number
    max_shares: number | null
    royalty_pct: number | null
}

const CreateProject = () => {
    const {
        register,
        control,
        setValue,
        setError,
        clearErrors,
        handleSubmit,
        formState: {errors}
    } = useForm<INewProject>({
        defaultValues: {
            customDeadline: dayjs().add(1, 'month'),
        }
    })
    const [imageUrl, setImageUrl] = useState('');

    const [customDeadline, setCustomDeadline] = useState(dayjs().add(1, 'month'));
    const navigate = useNavigate();
    const {token, logout} = useAuth();
    const fetchWithAuth = configureFetch(token);

    const [selectedNumberOfMonths, setSelectedNumberOfMonths] = useState("2");
    const [isCustomDeadline, setIsCustomDeadline] = useState(false);

    const onSubmit: SubmitHandler<INewProject> = async (data) => {
        const formData = new FormData();
        for (const key in data) {
            // @ts-ignore
            if (key === 'customDeadline') {
                if (data[key].isValid()) {
                    formData.append(key, data[key].toISOString())
                }
                // @ts-ignore
            } else if (!!data[key]) formData.append(key, data[key]);
        }

        console.log('----------------------- ', data)

        // try {
        //     const response = await fetchWithAuth(API_BASE_URL + 'project/create', {
        //         method: 'POST',
        //         body: formData,
        //         headers: {
        //             'Content-Type': 'multipart/form-data',
        //         },
        //     });
        //     const responseData = await response.json();
        //     if (response.ok) {
        //         navigate(`/${responseData.id}`)
        //     } else if (response.status === 401) {
        //         logout()
        //     } else {
        //         for (const field in responseData) {
        //             setError(field as keyof INewProject, {
        //                 type: 'custom',
        //                 message: responseData[field][0],
        //             });
        //         }
        //     }
        // } catch (error) {
        //     console.error('API Error:', error);
        // }
    };

    const onCustomDatePickerChange = () => {

    }

    const drawPickedImage = (event: any) => {
        clearErrors('image')
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setValue('image', file);
                setImageUrl(reader.result as string);
            };
        }
    };

    if (!token)
        return <div>Please sign in with a wallet</div>;

    function onDurationChange(_event: React.ChangeEvent, value: string) {
        setSelectedNumberOfMonths(value);

        if (value === 'custom') {
            setIsCustomDeadline(true);
        } else {
            setCustomDeadline(dayjs().add(Number(value), 'month'))
            setIsCustomDeadline(false);
        }
    }

    return (
        <div>
            <form encType={'multipart/form-data'} onSubmit={handleSubmit(onSubmit)}>
                <Grid container rowSpacing={3} columnSpacing={2} columns={12}>
                    <Grid item xs={12}>
                        <Typography variant={'h3'}>Start New Project</Typography>
                        <Typography component={'p'}>You can describe your project here. After it is approved by the
                            administration it will go live. Feel free to contact us if you need help or you would like
                            us to guide you though the project creation process.</Typography>

                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant={'h5'}>Describe your project</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Title" fullWidth
                            inputProps={register("title", {required: 'This field is required'})}
                            error={!!errors.title}
                            helperText={errors.title?.message}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            placeholder={'Feel free to go into details as much as you like. Tell your fans what you\'d like to create and how you will get there.'}
                            label="Description" multiline minRows={3} fullWidth
                            inputProps={register("description", {required: 'This field is required'})}
                            error={!!errors.description}
                            helperText={errors.description?.message}
                        />
                    </Grid>

                    <Grid item xs={12} sx={{marginBottom: "1rem"}}>
                        <label htmlFor="image-input" style={{display: "block"}}>
                            <Controller name="image" control={control} rules={{required: 'Image is required'}}
                                        render={({field}) =>
                                            <input
                                                name="image"
                                                type="file" accept="image/*" style={{display: 'none'}} id="image-input"
                                                onChange={drawPickedImage}
                                            />
                                        }/>
                            <Button variant="outlined" component="span">
                                Select an Image
                            </Button>
                        </label>
                        {imageUrl && <img src={imageUrl as string} alt="Uploaded Project Preview"
                                          style={{paddingLeft: "1em", maxHeight: 200}}/>}
                        {errors.image && (
                            <Typography variant="caption" color="error">
                                {errors.image.message}
                            </Typography>
                        )}
                    </Grid>


                    {/* project duration */}
                    <Grid item xs={12}>
                        <Typography variant="h5"> Project duration</Typography>
                        <FormControl>
                            <RadioGroup
                                aria-labelledby="demo-radio-buttons-group-label"
                                value={selectedNumberOfMonths}
                                name="radio-buttons-group"
                                row
                                onChange={onDurationChange}
                            >
                                <FormControlLabel value="1" control={<Radio/>} label="1 month"/>
                                <FormControlLabel value="2" control={<Radio/>} label="2 months"/>
                                <FormControlLabel value="3" control={<Radio/>} label="3 months"/>
                                <FormControlLabel
                                    value="custom"
                                    control={<Radio sx={{
                                        color: grey.A400,
                                        '&.Mui-checked': {
                                            color: grey.A400,
                                        },
                                    }}/>}
                                    label="Custom deadline"
                                    sx={{
                                        color: grey.A400,
                                        '&.Mui-checked': {
                                            color: grey.A400,
                                        }
                                    }}
                                />
                                {isCustomDeadline && <Controller name="customDeadline" control={control}
                                                                 rules={{required: 'This field is required'}}
                                                                 render={({field}) =>
                                                                     <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                         <DatePicker
                                                                             label="Deadline"
                                                                             format="DD, MMMM YYYY"
                                                                             minDate={dayjs().add(7, 'day')}
                                                                             maxDate={dayjs().add(1, 'year')}

                                                                             value={customDeadline}
                                                                             onChange={(value: any, err: any) => {
                                                                                 field.onChange(value);
                                                                                 if (err.validationError) {
                                                                                     setError(field.name, {
                                                                                         type: 'custom',
                                                                                         message: err.validationError
                                                                                     })
                                                                                     // @ts-ignore
                                                                                     setValue(field.name, null)
                                                                                 } else setValue(field.name, value as dayjs.Dayjs)
                                                                             }}
                                                                             slotProps={{
                                                                                 textField: {
                                                                                     error: !!errors.customDeadline,
                                                                                     helperText: errors.customDeadline?.message
                                                                                 }
                                                                             }}
                                                                             views={['day']}/>
                                                                     </LocalizationProvider>
                                                                 }/>}
                            </RadioGroup>

                        </FormControl>

                        {isCustomDeadline ? <div>No matter when the project is approved, it will end
                                on <strong>{customDeadline.format('MMMM DD, YYYY')}</strong></div> :
                            <div>The project will be open
                                until <strong>{customDeadline.format('MMMM DD, YYYY')}</strong> if it is approved by
                                the administration and goes live today. In other words, once it is approved it will run
                                for <strong>{Number(selectedNumberOfMonths) * 30} </strong> days.
                            </div>}

                    </Grid>

                    <Grid item xs={2}>
                        <TextField
                            type="number" label="Share price, TEZ"
                            inputProps={{
                                min: 0.01,
                                step: "any", ...register("share_price", {required: 'This field is required'})
                            }}
                            error={!!errors.share_price}
                            helperText={errors.share_price?.message}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField
                            type="number" label="Royalties, %"
                            inputProps={{min: 0, max: 100, step: "any", ...register("royalty_pct")}}
                            error={!!errors.royalty_pct}
                            helperText={errors.royalty_pct?.message}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField
                            type="number" label="Min. # of shares"
                            inputProps={{
                                min: 1,
                                step: "any", ...register("min_shares", {required: 'This field is required'})
                            }}
                            error={!!errors.min_shares}
                            helperText={errors.min_shares?.message}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <TextField
                            type="number" label="Max. # of shares"
                            inputProps={{min: 0, step: "any", ...register("max_shares")}}
                            error={!!errors.max_shares}
                            helperText={errors.max_shares?.message}
                        />
                    </Grid>
                    <Grid item xs={4} sx={{textAlign: "right"}}>
                        <Button type="submit" variant="contained">Submit</Button>
                    </Grid>
                </Grid>
            </form>
        </div>
    );
};

export default CreateProject;
