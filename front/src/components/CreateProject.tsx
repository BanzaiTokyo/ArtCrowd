import React, { useState } from 'react';
import {useNavigate} from "react-router-dom";
import { useForm, Controller, SubmitHandler } from "react-hook-form"
import {useAuth} from "./AuthContext";
import {apiBaseUrl} from "../Constants";
import {configureFetch} from "../utils";

interface INewProject {
  title: string
  description: string
  image: File
  deadline: string
  share_price: number
  min_shares: number | null
  max_shares: number | null
  royalty_pct: number | null
}

const CreateProject: React.FC = () => {
  const { register, handleSubmit, control, setError, formState: { errors } } = useForm<INewProject>()
  const navigate = useNavigate();
  const { token } = useAuth();
  const fetchWithAuth = configureFetch(token);

  const onSubmit: SubmitHandler<INewProject> = async (data) => {
    console.log(data)
    const formData = new FormData();
    for (const key in data) {
      // @ts-ignore
      formData.append(key, data[key as keyof INewProject]);
    }
    try {
      const response = await fetchWithAuth(apiBaseUrl+'create', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const responseData = await response.json();
      if (response.ok) {
        navigate(`${responseData.id}`)
      } else {
        for (const field in responseData) {
          if (field in errors) {
            setError(field as keyof INewProject, {
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
      <h1>Start New Project</h1>
    <form encType={'multipart/form-data'} onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Title:</label>
        <input {...register("title", {required: true})} />
        { errors.title && <span>{errors.title.message || 'field required'}</span> }
      </div>
      <div>
        <label>Description:</label>
        <input {...register("description", {required: true})} />
        { errors.description && <span>{errors.description.message || 'field required'}</span> }
      </div>
      <div>
        <label>Image:</label>
        <Controller
        name="image"
        control={control}
        render={({ field }) => (
          <input
            type="file"
            required
            onChange={(e) => {
              field.onChange(e.target.files![0]);
            }}
          />
        )}
      />
      </div>
      <div>
        <label>Deadline:</label>
        <input {...register("deadline", {required: true})} />
        { errors.deadline && <span>{errors.deadline.message || 'field required'}</span> }
      </div>
      <div>
        <label>Share price:</label>
        <input {...register("share_price", {required: true})} />
        { errors.share_price && <span>{errors.share_price.message || 'field required'}</span> }
      </div>
      <div>
        <label>Min shares:</label>
        <input {...register("min_shares")} />
      </div>
      <div>
        <label>Max shares:</label>
        <input {...register("max_shares")} />
      </div>
      <div>
        <label>Royalties, %:</label>
        <input {...register("royalty_pct", {valueAsNumber: true, validate: (value) => value == null || (value > 0.1 && value < 97)})} />
      </div>
        <button type="submit">Submit</button>
    </form>
    </div>
  );
};

export default CreateProject;
