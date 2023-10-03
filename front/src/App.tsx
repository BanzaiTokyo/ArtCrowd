import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import ProfilePage from './components/ProfilePage';
import ProjectPage from './components/ProjectPage';
import CreateProject from './components/CreateProject';
import TezosPage from './components/TezosPage';
import './App.css';
import {AuthProvider} from "./components/AuthContext";
import LoginByWallet from "./components/LoginByWallet";

function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/login-by-password" element={<Login/>} />
        <Route path="/login" element={<LoginByWallet/>} />
        <Route path="/" element={<ProfilePage/>} />
        <Route path="/:projectId" element={<ProjectPage/>}/>
        <Route path="/create" element={<CreateProject/>} />
        <Route path="/tezos" element={<TezosPage/>} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
