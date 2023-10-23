import React, {useState} from 'react';
import {Controller, SubmitHandler, useForm} from "react-hook-form"
import {useAuth} from "../../../components/AuthContext";
import {API_BASE_URL} from "../../../Constants";
import {configureFetch} from "../../../utils";
import {Alert, Box, Button, Grid, Typography} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {MUIRichTextEditor} from "@agbishop/mui-rte";
import {stateToHTML} from "draft-js-export-html";
import HSpacer from "../../../components/common/HSpacer";

interface IProjectUpdate {
    image: File
    description: string
}

function ProjectUpdateForm(params: any) {
    const {
        reset,
        control,
        setValue,
        setError,
        clearErrors,
        handleSubmit,
        formState: {errors}
    } = useForm<IProjectUpdate>()

    const {projectId} = params;
    const [imageUrl, setImageUrl] = useState('');

    const {token} = useAuth();
    const fetchWithAuth = configureFetch(token);

    const onSubmit: SubmitHandler<IProjectUpdate> = async (data) => {
        const formData = new FormData();
        for (const key in data) {
            // @ts-ignore
            if (data[key]) { // @ts-ignore
                formData.append(key, data[key]);
            }
        }
        try {
            const response = await fetchWithAuth(API_BASE_URL + `projects/${projectId}/update`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const responseData = await response.json();
            if (response.ok) {
                //navigate(`${responseData.id}`)
            } else {
                for (const field in responseData) {
                    if (field in errors) {
                        setError(field as keyof IProjectUpdate, {
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

    const theme = createTheme()

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

    return (
        <Box>


            <form encType={'multipart/form-data'} onSubmit={handleSubmit(onSubmit)}>
                <Grid container rowSpacing={3} columnSpacing={2}>
                    <Grid item xs={12}>
                        <Alert severity="info">
                            <Typography component={'p'}>You can post an update to your project once a day. We encourage you to do so. This stimulates the engagement of your fans and brings more people to follow your project. </Typography>
                        </Alert>
                    </Grid>
                    <Grid item xs={12}>
                        <Button component="label" variant="outlined" startIcon={<CloudUploadIcon/>}>
                            Upload an image update
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

                    {imageUrl && <Grid item xs={12} sx={{marginBottom: "1rem"}}>
                        <img src={imageUrl as string}
                             alt="Uploaded Project Preview"
                             style={{maxWidth: '100%', maxHeight: '900px'}}/>
                        {errors.image && (
                            <Typography variant="caption" color="error">
                                {errors.image.message}
                            </Typography>
                        )}
                    </Grid>}

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
                                            label="Let your fans know how the work on your project is going."
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


                    <Grid container item xs={12} justifyContent="flex-end" alignItems="center">
                        <Button variant="contained" color={'inherit'} onClick={() => reset()}>Cancel</Button>
                        <HSpacer maxWidth={'1rem'}/>
                        <Button type="submit" variant="contained">Send update</Button>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
}

export default ProjectUpdateForm;
