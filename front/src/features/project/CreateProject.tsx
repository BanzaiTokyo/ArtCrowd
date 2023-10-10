import React, {useState} from 'react';
import {useNavigate} from "react-router-dom";
import {Controller, SubmitHandler, useForm} from "react-hook-form";
import {
    Alert,
    Box,
    Button,
    Fade,
    FormControlLabel,
    Grid,
    IconButton,
    Radio,
    RadioGroup,
    Slider,
    TextField,
    Typography
} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import {useAuth} from "../../components/AuthContext";
import {configureFetch} from "../../utils";
import dayjs from "dayjs";
import {grey} from '@mui/material/colors';
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {TransitionGroup} from 'react-transition-group';

interface INewProject {
    title: string
    description: string
    image: File
    deadline: dayjs.Dayjs
    share_price: number
    min_shares: number
    max_shares: number | null
    royalty_pct: number | null
}

const VerticalSpacer = <Box sx={{minHeight: '2rem'}}>&nbsp;</Box>;

const royaltiesMarks = [
    {
        value: 0,
        label: '0',
    },
    {
        value: 1,
        label: '1%',
    },
    {
        value: 2,
        label: '2%',
    },
    {
        value: 3,
        label: '3%',
    },
    {
        value: 4,
        label: '4%',
    },
    {
        value: 5,
        label: '5%',
    },
    {
        value: 6,
        label: '6%',
    },
    {
        value: 7,
        label: '7%',
    },
    {
        value: 8,
        label: '8%',
    },
    {
        value: 9,
        label: '9%',
    },
    {
        value: 10,
        label: '10%',
    },
];

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
            deadline: dayjs().add(2, 'month'),
            royalty_pct: 5,
        }
    })
    const [imageUrl, setImageUrl] = useState('');

    const [deadlineDate, setDeadlineDate] = useState(dayjs().add(2, 'month'));

    const navigate = useNavigate();
    const {token, logout} = useAuth();
    const fetchWithAuth = configureFetch(token);

    // the variable name is so cryptic because it can be 1, 2, 3 and... custom!
    const [deadlineRadiobuttonValue, setDeadlineRadiobuttonValue] = useState("2");

    const [isCustomDeadline, setIsCustomDeadline] = useState(false);
    const [isHelpNewProjectVisible, setIsHelpNewProjectVisible] = useState(false);
    const [isHelpDeadlineVisible, setIsHelpDeadlineVisible] = useState(false);

    const onSubmit: SubmitHandler<INewProject> = async (data) => {
        const formData = new FormData();
        for (const key in data) {
            // @ts-ignore
            if (key === 'deadline') {
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

    function onDeadlineRadioChange(_event: React.ChangeEvent, value: string) {
        if (value === 'custom') {
            setIsCustomDeadline(true);
        } else {
            const newDate = dayjs().add(Number(value), 'month');
            setDeadlineDate(newDate)
            setValue('deadline', newDate);
            setIsCustomDeadline(false);
        }
        setDeadlineRadiobuttonValue(value);
    }

    const onRoyaltiesChange = (event: Event, newValue: number | number[]) => {
        if (typeof newValue === 'number') {
            setValue('royalty_pct', newValue);
        }
    };

    function toggleHelpNewProject() {
        setIsHelpNewProjectVisible((prev) => !prev);
    }

    function toggleHelpDeadline() {
        setIsHelpDeadlineVisible((prev) => !prev);
    }

    return (
        <div>
            <form encType={'multipart/form-data'} onSubmit={handleSubmit(onSubmit)}>
                <Grid container rowSpacing={3} columnSpacing={2}>
                    <Grid item xs={12}>
                        <Typography variant={'h4'}>Start New Project
                            <IconButton color="primary" aria-label="help on creating a new project"
                                        onClick={toggleHelpNewProject}>
                                <InfoIcon/>
                            </IconButton>
                        </Typography>

                        <TransitionGroup>
                            {isHelpNewProjectVisible && <Fade in={isHelpNewProjectVisible}>
                                <Alert
                                    severity="info"
                                    onClose={toggleHelpNewProject}>
                                    <Typography component={'p'}>You can describe your project here. After it is
                                        approved by the administration it will go live. Feel free to contact us if you
                                        need help or you would like us to guide you though the project creation
                                        process.</Typography></Alert>
                            </Fade>}
                        </TransitionGroup>

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

                    {/* project deadline */}
                    <Grid item xs={12}>
                        <Typography variant="h5"> Project deadline
                            <IconButton color="primary" aria-label="help on creating a new project"
                                        onClick={toggleHelpDeadline}>
                                <InfoIcon/>
                            </IconButton>
                        </Typography>
                        <TransitionGroup>
                            {isHelpDeadlineVisible && <Fade in={isHelpDeadlineVisible}>
                                <Alert
                                    severity="info"
                                    onClose={toggleHelpDeadline}>
                                    <Typography component={'p'}>Choose when you want the project to end.</Typography></Alert>
                            </Fade>}
                        </TransitionGroup>

                        <Controller name="deadline" control={control}
                                    rules={{required: 'This field is required'}} render={({field}) =>
                            <RadioGroup
                                aria-labelledby="project-deadline-radio-buttons-group"
                                value={deadlineRadiobuttonValue}
                                name="radio-buttons-group"
                                row
                                onChange={onDeadlineRadioChange}
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
                                {isCustomDeadline && <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Deadline"
                                        format="DD, MMMM YYYY"
                                        minDate={dayjs().add(7, 'day')}
                                        maxDate={dayjs().add(1, 'year')}

                                        value={deadlineDate}
                                        onChange={(value: any, err: any) => {
                                            field.onChange(value);
                                            if (err.validationError) {
                                                setError(field.name, {
                                                    type: 'custom',
                                                    message: err.validationError
                                                })
                                                // @ts-ignore
                                                setValue(field.name, null)
                                            } else {
                                                const newDate = value as dayjs.Dayjs;
                                                setDeadlineDate(newDate)
                                                setValue(field.name, newDate);
                                            }
                                        }}
                                        slotProps={{
                                            textField: {
                                                error: !!errors.deadline,
                                                helperText: errors.deadline?.message
                                            }
                                        }}
                                        views={['day']}/>
                                </LocalizationProvider>
                                }
                            </RadioGroup>}/>

                        <div>The project will be open until <strong>{deadlineDate.format('MMMM DD, YYYY')}</strong>.
                            It needs to be approved by the administrator first.
                        </div>
                    </Grid>

                    {VerticalSpacer}

                    <Grid item xs={12}>
                        <Typography variant="h5"> Shares</Typography>
                        <Typography component={'p'} sx={{paddingBottom: '1rem'}}>Your fans will be able to purchase
                            shares of your future work. This
                            does not mean they will own the work, but this share will get them a copy of the NFT that
                            will be minted when your project is finished.</Typography>

                        <TextField
                            type="number" label="Share price, TEZ"
                            defaultValue={5}
                            inputProps={{
                                min: 1,
                                max: 1000,
                                step: "any", ...register("share_price", {required: 'This field is required'})
                            }}
                            error={!!errors.share_price}
                            helperText={errors.share_price?.message}
                        />
                    </Grid>

                    {VerticalSpacer}

                    <Grid item xs={12}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Typography variant="overline">Once you finish your project:</Typography></Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h5">Royalties</Typography>
                        <Typography component={'p'}>When the project is finished and we mint NFTs for your fans this is
                            the royalties percentage you want those NFTs to have.</Typography>
                    </Grid>

                    <Grid item xs={12}>

                        <Controller name="royalty_pct" control={control}
                            // rules={{required: 'This field is required'}}
                                    render={({field}) =>
                                        <Slider
                                            aria-label="Temperature"
                                            defaultValue={5}
                                            valueLabelDisplay="off"
                                            onChange={onRoyaltiesChange}
                                            // step={11}
                                            marks={royaltiesMarks}
                                            min={0}
                                            max={10}
                                        />}/>
                    </Grid>

                    {VerticalSpacer}

                    <Grid item xs={12}>
                        <TextField
                            type="number" label="Min. # of shares"
                            defaultValue={1}
                            inputProps={{
                                min: 1,
                                step: "any", ...register("min_shares", {required: 'This field is required'})
                            }}
                            error={!!errors.min_shares}
                            helperText={errors.min_shares?.message}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            type="number" label="Max. # of shares"
                            inputProps={{min: 0, step: "any", ...register("max_shares")}}
                            error={!!errors.max_shares}
                            helperText={errors.max_shares?.message}
                        />
                    </Grid>

                    <Grid item xs={12} sx={{textAlign: "right"}}>
                        <Button type="submit" variant="contained">Submit</Button>
                    </Grid>
                </Grid>
            </form>
        </div>
    );
};

export default CreateProject;
