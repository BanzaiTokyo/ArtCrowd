import React from 'react';
import {useLocation} from "react-router-dom";
import {Avatar, Box, Card, CardContent, CardHeader, CardMedia, Link, Stack, Typography} from "@mui/material";
import {Project} from "../../../models/Project";
import BuySharesForm from "./BuySharesForm";
import {cutTheTail, formatDate} from "../../../utils";
import {DESCRIPTION_LONG_PREVIEW_LENGTH} from "../../../Constants";


function ProjectBuy() {

    const location = useLocation();
    const project = location.state?.project as Project;

    if (project == null) return (<div>couldn't load the project</div>);
    return (
        <Stack direction={'column'} spacing={2}>
            {/*project preview*/}
            <Card sx={{display: 'flex'}}>
                <CardMedia
                    component="img"
                    sx={{maxHeight: 200, maxWidth: 200, objectFit: 'contain', margin: 0, padding: 0, flexGrow: 0}}
                    image={project.image}
                    alt={project.title}
                />

                <Box sx={{display: 'flex', flexDirection: 'column', maxWidth: '100%'}}>
                    <CardHeader
                        avatar={
                            <a href={`/profile/${encodeURIComponent(project.artist.username)}`}>
                                <Avatar alt={project.artist.username} src={project.artist.avatar}/>
                            </a>
                        }
                        title={<div><Link href={`/profile/${encodeURIComponent(project.artist.username)}`}
                                          underline="none"> {project.artist.username}</Link></div>}
                    />

                    <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                            {`${formatDate(project.created_on)} - ${formatDate(project.deadline)}`}
                        </Typography>
                        <Typography component="div" variant="h5">
                            {project.title}
                        </Typography>
                    </CardContent>
                    <Box px={2}>
                        <span dangerouslySetInnerHTML={{__html: cutTheTail(project.description, DESCRIPTION_LONG_PREVIEW_LENGTH)}}/>
                    </Box>
                </Box>

            </Card>

            <BuySharesForm project={project}/>
        </Stack>
    );
}

export default ProjectBuy;
