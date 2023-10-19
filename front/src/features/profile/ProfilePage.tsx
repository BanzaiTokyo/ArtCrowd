import React, {useEffect, useState} from 'react';
import {Grid, LinearProgress, Typography, Box, Avatar} from "@mui/material";
import {useAuth} from "../../components/AuthContext";
import {configureFetch} from "../../utils";
import {API_BASE_URL} from "../../Constants";
import {User} from "../../models/User";
import {useParams} from "react-router-dom";
import ProjectCardsList from "../home/ProjectCardsList";


const sectionHeaderStyle = {fontSize: {xs: '2rem', md: '3rem'}, marginTop: '1em'}

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
        {profile.cover_picture ? <Box component="img" src={profile.cover_picture} alt="" sx={{width: '100%', height: {xs: '8em', md: '20em'}, borderRadius: '10px', objectFit: 'cover'}}/> : <Box sx={{height: "6em"}}>&nbsp;</Box>}
        <Grid container sx={{marginTop: {xs: '-6em', md: '-8em'}}}>
            <Grid item xs={12} md={2} sx={{ marginX: {xs: 10, md: 0}, paddingLeft: {xs: 0, md: '2em'}}}>
                <Avatar alt={profile.username} src={profile.avatar} sx={{width: "100%", height: "auto", aspectRatio: 1, border: "3px solid white"}} />
            </Grid>
            <Grid item xs={12} md={10} sx={{marginTop: {xs: 0, md: '7em'}, paddingLeft: {xs: 0, md: '1em'}}}>
                <Typography variant="h3" textAlign={{xs: 'center', md: 'left'}}>{profile.username}</Typography>
                {profile.description && <div dangerouslySetInnerHTML={{__html: profile.description}}/>}
            </Grid>
        </Grid>
        <Typography variant="h2" sx={sectionHeaderStyle}>Projects I created</Typography>
        <ProjectCardsList artist={username} />

        <Typography variant="h2" sx={sectionHeaderStyle}>Projects I support</Typography>
        <ProjectCardsList patron={username} />

        <Typography variant="h2" sx={sectionHeaderStyle}>Projects I present</Typography>
        <ProjectCardsList presenter={username} />
    </>
};

export default ProfilePage;
