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
    InputAdornment,
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
import {API_BASE_URL, PROJECT_ENDPOINT, SITE_NAME} from "../../Constants";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {createTheme, ThemeProvider} from '@mui/material/styles'
import {MUIRichTextEditor} from '@agbishop/mui-rte';
import {stateToHTML} from 'draft-js-export-html';

interface INewProject {
    title: string
    description: string
    nft_description: string
    image: File
    deadline: dayjs.Dayjs
    share_price: number
    min_shares: number
    max_shares: number | null
    royalty_pct: number | null
}

const VerticalSpacer = <Box sx={{minHeight: '2rem'}}>&nbsp;</Box>;

const royaltiesMarks = Array.from({length: 11}, (_, index) => ({
    value: index,
    label: `${index}%`
}));


const CreateProject = () => {
    const {
        register,
        watch,
        getValues,
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

    const watchProjectTitle = watch("title");

    const [imageUrl, setImageUrl] = useState('');

    const [deadlineDate, setDeadlineDate] = useState(dayjs().add(2, 'month'));

    // the variable name is so cryptic because it can be 1, 2, 3 and... custom!
    const [deadlineRadiobuttonValue, setDeadlineRadiobuttonValue] = useState("2");

    const [isCustomDeadline, setIsCustomDeadline] = useState(false);
    const [isHelpNewProjectVisible, setIsHelpNewProjectVisible] = useState(false);
    const [isHelpDeadlineVisible, setIsHelpDeadlineVisible] = useState(false);
    const [isHelpSharesVisible, setIsHelpSharesVisible] = useState(false);
    const [isHelpReserveVisible, setIsHelpReserveVisible] = useState(false);
    const [isHelpMaxSharesVisible, setIsHelpMaxSharesVisible] = useState(false);
    const [isHelpNftDescriptionVisible, setIsHelpNftDescriptionVisible] = useState(false);

    const [isAdditionalOptionsVisible, setIsAdditionalOptionsVisible] = useState(false);

    const navigate = useNavigate();
    const {token, logout} = useAuth();
    const fetchWithAuth = configureFetch(token);


    const onSubmit: SubmitHandler<INewProject> = async (data) => {

        //FIXME: form values are here. but I have no idea how to convert this to formData
        console.log(getValues())

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
        try {
            const response = await fetchWithAuth(API_BASE_URL + PROJECT_ENDPOINT + '/create', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const responseData = await response.json();
            if (response.ok) {
                navigate(`/${responseData.id}`)
            } else if (response.status === 401) {
                logout()
            } else {
                for (const field in responseData) {
                    setError(field as keyof INewProject, {
                        type: 'custom',
                        message: responseData[field][0],
                    });
                }
            }
        } catch (error) {
            console.error('API Error:', error);
        }
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
        return <><p>Are you an artist? Please <a href={'/'}>sign in with a wallet</a> to create a
            new {SITE_NAME} project.</p>
            <p>Or check out our <a href={'/'}>current projects</a>.</p>
        </>;

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

    function toggleHelpShares() {
        setIsHelpSharesVisible((prev) => !prev);
    }

    function toggleAdditionalOptions() {
        setIsAdditionalOptionsVisible((prev) => !prev);
    }

    function toggleHelpReserve() {
        setIsHelpReserveVisible((prev) => !prev);
    }

    function toggleHelpMaxShares() {
        setIsHelpMaxSharesVisible((prev) => !prev);
    }

    function toggleHelpNFTDescription() {
        setIsHelpNftDescriptionVisible((prev) => !prev);
    }

    const theme = createTheme()
    /*
    import {EditorState, convertFromHTML, ContentState, convertToRaw} from 'draft-js';
    const sampleMarkup =
      '<b>Bold text</b>, <i>Italic text</i><br/ ><br />' +
      '<a href="http://www.facebook.com">Example link</a>';
    const blocksFromHTML = convertFromHTML(sampleMarkup);
    const MUIRichTextEditorDefaultValue = JSON.stringify(convertToRaw(EditorState.createWithContent(
        ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap)
      ).getCurrentContent()));
    */

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

                    {/*Image*/}
                    <Grid item xs={12}>
                        <Button component="label" variant="outlined" startIcon={<CloudUploadIcon/>}>
                            Upload preview of your project
                            <Controller name="image" control={control} rules={{required: 'Image is required'}}
                                        render={() =>
                                            <input
                                                name="image"
                                                type="file" accept="image/*" style={{display: 'none'}} id="image-input"
                                                onChange={drawPickedImage}
                                            />
                                        }/>
                        </Button>
                    </Grid>

                    <Grid item xs={12} sx={{marginBottom: "1rem"}}>

                        {imageUrl && <img src={imageUrl as string}
                                          alt="Uploaded Project Preview"
                                          style={{maxWidth: '100%', maxHeight: '900px'}}/>}
                        {errors.image && (
                            <Typography variant="caption" color="error">
                                {errors.image.message}
                            </Typography>
                        )}
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Title" fullWidth
                            inputProps={{
                                minLength: 5,
                                maxLength: 100,
                                ...register("title", {
                                    required: 'This field is required',
                                })
                            }}
                            error={!!errors.title}
                            helperText={errors.title?.message}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Controller
                            name="description" control={control} rules={{required: "This field is required",}}
                            render={({field}) => (
                                <ThemeProvider theme={theme}>
                                    <Box px={2} sx={{
                                        border: `1px solid ${errors.description ? theme.palette.error.main : theme.palette.grey[400]}`,
                                        borderRadius: '4px',
                                        minHeight: '10em'
                                    }}>
                                        <MUIRichTextEditor
                                            label="Feel free to go into details as much as you like. Tell your fans what you'd like to create and how you will get there."
                                            controls={['title', 'bold', 'italic', 'underline', 'numberList', 'bulletList', 'quote', 'code', 'clear', 'strikethrough']}
                                            onChange={(state: any) => {
                                                const content = state.getCurrentContent();
                                                field.onChange(content.hasText() ? stateToHTML(content) : '');
                                            }}
                                        />
                                    </Box>
                                    {errors.description && (
                                        <Typography variant="caption" color="error" mx={2}>
                                            {errors.description.message}
                                        </Typography>
                                    )}
                                </ThemeProvider>
                            )}
                        />
                    </Grid>

                    {/* project deadline */}
                    <Grid item xs={12}>
                        <Typography variant="h5"> Project deadline
                            <IconButton color="primary" aria-label="help on project deadline"
                                        onClick={toggleHelpDeadline}>
                                <InfoIcon/>
                            </IconButton>
                        </Typography>
                        <TransitionGroup>
                            {isHelpDeadlineVisible && <Fade in={isHelpDeadlineVisible}>
                                <Alert
                                    severity="info"
                                    onClose={toggleHelpDeadline}>
                                    <Typography component={'p'}>Choose when you want the project to
                                        end.</Typography></Alert>
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
                        </div>
                    </Grid>

                    {VerticalSpacer}

                    <Grid item xs={12}>
                        <Typography variant="h5"> Shares
                            <IconButton color="primary" aria-label="help on project shares"
                                        onClick={toggleHelpShares}>
                                <InfoIcon/>
                            </IconButton>
                        </Typography>
                        <TransitionGroup>
                            {isHelpSharesVisible && <Fade in={isHelpSharesVisible}>
                                <Alert
                                    severity="info"
                                    onClose={toggleHelpShares}
                                >
                                    <Typography component={'p'}>Your fans will be able to purchase shares of your future
                                        work. This does not mean they will own the work, but this share will get them a
                                        copy of the NFT that will be minted when your project is finished.</Typography>
                                </Alert>
                            </Fade>}
                        </TransitionGroup>

                        <Typography component={'p'} sx={{paddingBottom: '1rem', paddingTop: '1rem'}}>Set the price of a
                            single share (in
                            Tez) that will be available to your fans.</Typography>

                        <TextField
                            type="number"
                            label="Share price, TEZ"
                            InputProps={{
                                endAdornment: <InputAdornment position="end">TEZ</InputAdornment>,
                            }}
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

                    <Grid item xs={12}>
                        <Button
                            onClick={toggleAdditionalOptions}>{isAdditionalOptionsVisible ? 'Hide ' : 'Show '} additional
                            options</Button>

                        {isAdditionalOptionsVisible && <Box sx={{borderTop: 1, borderColor: 'divider'}}>

                            <br/>
                            <Grid container rowSpacing={3} columnSpacing={2}>

                                <Grid item xs={12}>
                                    {/*TODO: validate to allow only int > 0*/}
                                    <TextField
                                        sx={{maxWidth: '260px'}}
                                        type="number" label="Reserved # of shares"
                                        defaultValue={1}
                                        InputProps={{
                                            endAdornment:
                                                <IconButton color="primary"
                                                            aria-label="help on creating a new project"
                                                            onClick={toggleHelpReserve}>
                                                    <InfoIcon/>
                                                </IconButton>
                                            ,
                                            min: 1,
                                            max: 1000,
                                            ...register("min_shares", {required: 'This field is required'})
                                        }}

                                        error={!!errors.min_shares}
                                        helperText={errors.min_shares?.message}
                                    />


                                    <TransitionGroup>
                                        {isHelpReserveVisible && <Fade in={isHelpReserveVisible}>
                                            <div>
                                                <br/>
                                                <Alert
                                                    severity="info"
                                                    onClose={toggleHelpReserve}
                                                >
                                                    <Typography component={'p'}>The minimum shares that need to be sold
                                                        for the project to be successful. If less than reserved number
                                                        of shares is sold by the deadline, the NFT will not be minted
                                                        and distributed to the patrons. Instead the funds will be
                                                        refunded to them.</Typography>
                                                </Alert></div>
                                        </Fade>}
                                    </TransitionGroup>

                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        defaultValue={10_000}
                                        sx={{maxWidth: '260px'}}
                                        type="number" label="Max. # of shares"
                                        InputProps={{
                                            endAdornment:
                                                <IconButton color="primary"
                                                            aria-label="help on creating a new project"
                                                            onClick={toggleHelpMaxShares}>
                                                    <InfoIcon/>
                                                </IconButton>
                                        }}
                                        inputProps={{min: 0, step: "any", ...register("max_shares")}}
                                        error={!!errors.max_shares}
                                        helperText={errors.max_shares?.message}
                                    />

                                    <TransitionGroup>
                                        {isHelpMaxSharesVisible && <Fade in={isHelpMaxSharesVisible}>
                                            <div>
                                                <br/>
                                                <Alert
                                                    severity="info"
                                                    onClose={toggleHelpMaxShares}
                                                >
                                                    <Typography component={'p'}>After reaching this number, no more
                                                        shares will be sold.</Typography>
                                                </Alert></div>
                                        </Fade>}
                                    </TransitionGroup>
                                </Grid>

                            </Grid>
                        </Box>}
                    </Grid>

                    {/*{VerticalSpacer}*/}

                    <Grid item xs={12}>
                        <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                            <Typography variant="overline">Once you finish your project:</Typography></Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h5">NFT Title</Typography>
                        <Typography component={'p'}>It will be the same as the project
                            title <strong>{watchProjectTitle}</strong></Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h5">NFT Description
                            <IconButton color="primary"
                                        aria-label="help on project deadline"
                                        onClick={toggleHelpNFTDescription}>
                                <InfoIcon/>
                            </IconButton>
                        </Typography>

                        <TransitionGroup>
                            {isHelpNftDescriptionVisible && <Fade in={isHelpNftDescriptionVisible}>
                                <Alert
                                    severity="info"
                                    onClose={toggleHelpNFTDescription}>
                                    <Typography component={'p'}>When you finish your art project, we will mint a
                                        multiple edition NFT with the final image of your work. Copies will be sent to
                                        your fans: 1 edition for 1 share purchased. This description is what will go to
                                        the token's metadata.</Typography></Alert>
                            </Fade>}
                        </TransitionGroup>
                        {isHelpNftDescriptionVisible && <br/>}

                        <TextField
                            placeholder={'NFT description has no markup. This is the description of the token that we will mint at the end of the project. Everyone will see on NFT Maketplaces..'}
                            label="NFT Description" multiline minRows={5} fullWidth
                            inputProps={register("nft_description", {required: 'This field is required'})}
                            error={!!errors.description}
                            helperText={errors.description?.message}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h5">Royalties</Typography>
                        <Typography component={'p'}>When the project is finished and we mint NFTs for your fans this is
                            the royalties percentage that we will put into the token's metadata.</Typography>
                    </Grid>

                    <Grid item xs={12}>

                        <Controller name="royalty_pct" control={control}
                            // rules={{required: 'This field is required'}}
                                    render={() =>
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

                    <Grid item xs={12} sx={{textAlign: "right"}}>
                        <Button type="submit" variant="contained">Submit</Button>
                    </Grid>
                </Grid>
            </form>
        </div>
    );
};

export default CreateProject;
