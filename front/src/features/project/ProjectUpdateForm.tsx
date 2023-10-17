import React from 'react';
import {Controller, SubmitHandler, useForm} from "react-hook-form"
import {useAuth} from "../../components/AuthContext";
import {API_BASE_URL} from "../../Constants";
import {configureFetch} from "../../utils";

interface IProjectUpdate {
  image: File
  description: string
}

function ProjectUpdateForm(params: any) {
  const {projectId} = params;
  const { register, handleSubmit, control, setError, formState: { errors } } = useForm<IProjectUpdate>()
  const { token } = useAuth();
  const fetchWithAuth = configureFetch(token);

  const onSubmit: SubmitHandler<IProjectUpdate> = async (data) => {
    console.log(data)
    const formData = new FormData();
    for (const key in data) {
      // @ts-ignore
      if (data[key]) { // @ts-ignore
        formData.append(key, data[key]);
      }
    }
    try {
      const response = await fetchWithAuth(API_BASE_URL+`projects/${projectId}/update`, {
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

  return (
    <div>
      <h3>Post an update to the project</h3>
    <form encType={'multipart/form-data'} onSubmit={handleSubmit(onSubmit)}>
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
            onChange={(e) => {
              field.onChange(e.target.files![0]);
            }}
          />
        )}
      />
      </div>
        <button type="submit">Submit</button>
    </form>
    </div>
  );
}

export default ProjectUpdateForm;
