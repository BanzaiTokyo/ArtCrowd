import React from 'react';
import {Typography} from "@mui/material";
import {ProjectUpdate} from "../../../models/ProjectUpdate";


function ProjectUpdateComponent(props: { update: ProjectUpdate }) {

    const {update} = props;

    return (
        <><Typography> {update.created_on}</Typography>
            {update.image &&
            <img src={update.image} alt="project update"/>}
            {update.description}
        </>
    );
}

export default ProjectUpdateComponent;
