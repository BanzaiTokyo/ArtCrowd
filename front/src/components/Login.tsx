import React, { useState } from 'react';
import {API_BASE_URL} from "../Constants";
import {useAuth} from "./AuthContext";
import {useNavigate} from "react-router-dom";


const FormPage: React.FC = () => {
  const { login } = useAuth();
    const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => fetch(API_BASE_URL+'login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Convert form data to JSON
      })
      .then(response => response.json())
      .then(data => {
        login(data.token);
        navigate('/')
      })
      .catch((error) => {
      // Handle fetch error, e.g., network issue
      console.error('An error occurred while submitting the form:', error);
    });

  return (
    <div>
      <div>
        <label>Name:</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
        />
      </div>
      <button onClick={handleSubmit}>Login</button>
    </div>
  );
};

export default FormPage;
