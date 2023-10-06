import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Login from './components/Login';
import ProfilePage from './features/profile/ProfilePage';
import ProjectPage from './features/project/ProjectPage';
import CreateProject from './components/CreateProject';
import TezosPage from './components/TezosPage';
import './App.css';
import {AuthProvider} from "./components/AuthContext";
import LoginByWallet from "./components/LoginByWallet";
import Layout from "./components/Layout";
import About from "./features/about/About";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route element={<Layout/>}>
                        {/*<Route path="/" element={<Home/>}/>*/}
                        <Route path="/about" element={<About/>}/>
                        <Route path="/login-by-password" element={<Login/>}/>
                        <Route path="/login" element={<LoginByWallet/>}/>
                        <Route path="/" element={<ProfilePage/>}/>
                        <Route path="/:projectId" element={<ProjectPage/>}/>
                        <Route path="/create" element={<CreateProject/>}/>
                        <Route path="/tezos" element={<TezosPage/>}/>
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
