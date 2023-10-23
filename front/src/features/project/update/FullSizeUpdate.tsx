import React from 'react';
import {Skeleton, Stack, Typography} from "@mui/material";
import {ProjectUpdate} from "../../../models/ProjectUpdate";
import {formatDate} from "../../../utils";

function FullSizeUpdate(props: { update?: ProjectUpdate }) {

    const {update} = props;

    return (
        <Stack direction={'column'} spacing={2}>
            {update != null && update.image != null ?
                <img src={update.image}
                     alt={`update of ${update.created_on}`}
                     style={{
                         maxWidth: '100%',
                         maxHeight: '900px',
                         objectFit: 'contain'
                     }}/>
                : <Skeleton variant="rectangular" height={140} width={'100%'}/>}
            {update != null && update.created_on != null && <Typography gutterBottom variant="body2" component="div">
                {formatDate(update.created_on)}
            </Typography>}
            {update != null && update.description != null && <Typography variant="body1" color="text.secondary">
                <div dangerouslySetInnerHTML={{__html: update.description}}/>
            </Typography>}
        </Stack>
    );
}

export default FullSizeUpdate;
