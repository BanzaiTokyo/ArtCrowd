import React from 'react';
import {useLocation} from "react-router-dom";
import {Avatar, Box, Card, CardContent, CardHeader, CardMedia, Link, Typography} from "@mui/material";
import {Project} from "../../../models/Project";
import BuySharesForm from "./BuySharesForm";
import {cutTheTail} from "../../../utils";
import dayjs from "dayjs";


function ProjectBuy() {

    const location = useLocation();
    const project = location.state?.project as Project;

    if (project == null) return (<div>couldn't load the project</div>);
    return (
        <div>
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
                            <>
                                <Avatar alt={project.artist.username} src={project.artist.avatar}/>
                            </>
                        }
                        //TODO: link to a real profile
                        title={<div><Link href={'profile'} underline="none"> {project.artist.username}</Link></div>}
                    />

                    <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                            {`${dayjs(project.created_on).format('MMMM DD, YYYY')} - ${dayjs(project.deadline).format('MMMM DD, YYYY')}`}
                        </Typography>
                        <Typography component="div" variant="h5">
                            {project.title}
                        </Typography>
                    </CardContent>
                    <Box px={2}>
                        <span dangerouslySetInnerHTML={{__html: cutTheTail(project.description, 500)}}/>
                    </Box>
                </Box>

            </Card>

            <BuySharesForm project={project}/>
        </div>
    );
}

export default ProjectBuy;
