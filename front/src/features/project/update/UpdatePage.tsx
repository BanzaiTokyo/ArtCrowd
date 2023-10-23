import React, {useEffect, useState} from 'react';
import {useLocation, useParams} from "react-router-dom";
import {Alert, Paper, Stack} from "@mui/material";
import {Project} from "../../../models/Project";
import {API_BASE_URL} from "../../../Constants";
import FullSizeUpdate from "./FullSizeUpdate";
import ProjectPreview from "../ProjectPreview";
import {ProjectUpdate} from "../../../models/ProjectUpdate";

function UpdatePage() {

    const location = useLocation();
    const projectFromParent = location.state?.project as Project;
    const [project, setProject] = useState(projectFromParent);
    const [isLoading, setIsLoading] = useState(false);
    const [update, setUpdate] = useState<ProjectUpdate>();
    const [isErrorLoadingProject, setIsErrorLoadingProject] = useState(false);
    const {projectId, updateId} = useParams();

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

    useEffect(() => {
        if (project != null) {
            const foundUpdate = project.updates.find(u => u.id === Number(updateId));
            setUpdate(foundUpdate);
        }
    }, [project])

    return (
        <Stack direction={'column'} spacing={2}>
            {isErrorLoadingProject ? <Alert severity="error">There was an error loading the project.</Alert>
                : <ProjectPreview project={project} isLoading={isLoading}/>}

            <Paper sx={{padding: '1rem'}}>
                <FullSizeUpdate update={update}/>
            </Paper>

        </Stack>
    );
}

export default UpdatePage;
