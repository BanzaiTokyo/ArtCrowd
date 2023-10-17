import React from 'react';
import {useLocation} from "react-router-dom";
import {Box, Card, CardContent, CardMedia, Typography} from "@mui/material";
import {Project} from "../../../models/Project";
import BuySharesForm from "./BuySharesForm";


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
                    sx={{width: 151}}
                    image={project.image}
                    alt={project.title}
                />
                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                    <CardContent sx={{flex: '1 0 auto'}}>
                        <Typography component="div" variant="h5">
                            {project.title}                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" component="div">
                            {project.artist.username}
                        </Typography>
                    </CardContent>
                    <Box sx={{display: 'flex', alignItems: 'center', pl: 1, pb: 1}}>
                        hello world
                    </Box>
                </Box>

            </Card>

            <BuySharesForm project={project}/>
        </div>
    );
}

export default ProjectBuy;
