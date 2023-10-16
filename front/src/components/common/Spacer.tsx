import {Box} from "@mui/material";
import React from "react";

export  default function Spacer(props: {maxWidthPx?: number}) {
    return <Box sx={{
        display: 'flex',
        flexGrow: 1,
        maxWidth: props.maxWidthPx ? props.maxWidthPx : '100%'
    }}/>;
}