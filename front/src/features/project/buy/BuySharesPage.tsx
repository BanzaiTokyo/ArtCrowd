import React, {useEffect, useState} from 'react';
import {useLocation, useParams} from "react-router-dom";
import {Alert, LinearProgress, Paper, Stack, Typography} from "@mui/material";
import {Project} from "../../../models/Project";
import BuySharesForm from "./BuySharesForm";
import {API_BASE_URL} from "../../../Constants";
import ProjectPreview from "../ProjectPreview";

function BuySharesPage() {

    const location = useLocation();
    const projectFromParent = location.state?.project as Project;
    const [project, setProject] = useState(projectFromParent);
    const [isLoading, setIsLoading] = useState(false);
    const [isErrorLoadingProject, setIsErrorLoadingProject] = useState(false);
    const {projectId} = useParams();


    useEffect(() => {
        if (projectFromParent == null) {
            setIsLoading(true);
            fetch(`${API_BASE_URL}projects/${projectId}`).then(response => {
                if (!response.ok) {
                    setIsErrorLoadingProject(true);
                } else return response.json()
            })
                .then((response: Project) => {
                    setProject(response);
                    setIsLoading(false);
                }).catch(error => {
                console.log('there was an error loading the project: ', error)
            });
        }
    }, [])

    if (isErrorLoadingProject) return (<Alert severity="error">There was an error loading the project.</Alert>);

    if (project == null || isLoading) return (<LinearProgress/>);


    return (
        <Stack direction={'column'} spacing={2}>
            <ProjectPreview project={project} isLoading={isLoading}/>

            {project.can_buy_shares ?
                <Paper sx={{padding: '1rem'}}>
                    <Typography variant="h6" gutterBottom>Purchase project shares</Typography>
                    <BuySharesForm project={project}/>
                </Paper>
                : <Alert severity="info">This project's shares are currently not available for sale.</Alert>
            }

        </Stack>
    );
}

export default BuySharesPage;
