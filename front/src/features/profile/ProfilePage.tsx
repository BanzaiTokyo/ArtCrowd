import React, {useEffect, useState} from 'react';
import {CircularProgress, Grid, LinearProgress, Typography} from "@mui/material";
import {useAuth} from "../../components/AuthContext";
import {configureFetch} from "../../utils";
import {API_BASE_URL} from "../../Constants";
import {User} from "../../models/User";
import {useParams} from "react-router-dom";
import ProjectCardsList from "../home/ProjectCardsList";


const ProfilePage = () => {
    const {username} = useParams();
    const {token} = useAuth();
    const fetchWithAuth = configureFetch(token);
    const [profile, setProfile] = useState<User | null>();

    useEffect(() => {
        if (!token) {
            return
        }
        fetchWithAuth(`${API_BASE_URL}profile/${encodeURIComponent(username as string)}`)
            .then(response => {
                return response.ok ? response.json() : null
            })
            .then((profileData: User | null) => setProfile(profileData as User))
    }, [token])

    if (profile === undefined) {
        return <LinearProgress/>
    }
    return !profile ? <>Profile not found</>: <>
        <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
                <img src={profile.avatar} alt={profile.username} style={{width: "100%"}} />
            </Grid>
            <Grid item md={10}>
                <Typography variant="h2">{profile.first_name || profile.username}</Typography>
                {profile.description && <div dangerouslySetInnerHTML={{__html: profile.description}}/>}
            </Grid>
        </Grid>
        <Typography variant="h2">Projects I created</Typography>
        <ProjectCardsList artist={username} />

        <Typography variant="h2">Projects I support</Typography>
        <ProjectCardsList patron={username} />

        <Typography variant="h2">Projects I present</Typography>
        <ProjectCardsList presenter={username} />
    </>
};

export default ProfilePage;
