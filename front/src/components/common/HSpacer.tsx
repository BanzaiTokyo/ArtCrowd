import {Box} from "@mui/material";
import React from "react";

export  default function HSpacer(props: {maxWidth?: string}) {
    return <Box sx={{
        display: 'flex',
        flexGrow: 1,
        maxWidth: props.maxWidth ? props.maxWidth : '100%'
    }}/>;
}