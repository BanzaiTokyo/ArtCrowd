import React, { useState } from 'react';
import {useNavigate} from "react-router-dom";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import {TextField, Button, Typography, Grid} from "@mui/material";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {useAuth} from "./AuthContext";
import {API_BASE_URL} from "../Constants";
import {configureFetch} from "../utils";
import dayjs from "dayjs";

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

const CreateProject: React.FC = () => {
  const defaultDeadline = dayjs().add(1, 'month');
  const {register, control, setValue, setError, clearErrors, handleSubmit, formState: { errors } } = useForm<INewProject>({
    defaultValues: {
      deadline: defaultDeadline,
    }
  })
  const [imageUrl, setImageUrl] = useState('');
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const fetchWithAuth = configureFetch(token);

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

    try {
      const response = await fetchWithAuth(API_BASE_URL+'project/create', {
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
    return <div>Please sign in with a wallet</div>;

  return (
    <div>
      <h1>Start New Project</h1>
    <form encType={'multipart/form-data'} onSubmit={handleSubmit(onSubmit)}>
      <Grid container rowSpacing={3} columnSpacing={2} columns={4} sx={{width: "50%"}}>
        <Grid item xs={4}>
        <TextField
          label="Title" fullWidth
          inputProps={register("title", {required: 'This field is required'})}
          error={!!errors.title}
          helperText={errors.title?.message}
        />
        </Grid>
        <Grid item xs={4}>
        <TextField
          label="Description" multiline minRows={3} fullWidth
          inputProps={register("description", {required: 'This field is required'})}
          error={!!errors.description}
          helperText={errors.description?.message}
        />
      </Grid>
      <Grid item xs={4} sx={{marginBottom: "1rem"}}>
      <label htmlFor="image-input" style={{display: "block"}}>
          <Controller name="image"  control={control} rules={{required: 'Image is required'}} render={({field}) =>
              <input
                  name="image"
                  type="file" accept="image/*" style={{display: 'none'}} id="image-input"
                  onChange={drawPickedImage}
              />
          }/>
        <Button variant="outlined" component="span" sx={{m: 1}}>
          Select an Image
        </Button>
      </label>
      {imageUrl && <img src={imageUrl as string} alt="Uploaded Image" style={{paddingLeft: "1em", maxHeight: 200}} />}
            {errors.image && (
              <Typography variant="caption" color="error">
                {errors.image.message}
              </Typography>
            )}
        </Grid>
        <Grid item xs={4}>
          <Controller name="deadline"  control={control} rules={{required: 'This field is required'}} render={({field}) =>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    label="Deadline"
                    format="DD, MMMM YYYY"
                    minDate={dayjs().add(1, 'day')}
                    defaultValue={defaultDeadline}
                    onChange={(value, err) => {
                      field.onChange(value);
                      if (err.validationError) {
                        setError(field.name, {type: 'custom', message: err.validationError})
                        // @ts-ignore
                        setValue(field.name, null)
                      } else setValue(field.name, value as dayjs.Dayjs)
                    }}
                    slotProps={{
                      textField: {
                        error: !!errors.deadline,
                        helperText: errors.deadline?.message
                      }
                    }}
                />
              </LocalizationProvider>
          }/>
        </Grid>
        <Grid item xs={2}>
            <TextField
              type="number" label="Share price, TEZ"
              inputProps={{min: 0.01, step: "any", ...register("share_price", {required: 'This field is required'})}}
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
              inputProps={{min: 1, step: "any", ...register("min_shares", {required: 'This field is required'})}}
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
