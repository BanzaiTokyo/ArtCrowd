import React from 'react';
import {Box, Divider} from "@mui/material";
import {Project} from "../../models/Project";
import SellIcon from '@mui/icons-material/Sell';

function SharesInfo(props: { project: Project }) {

    const project = props.project;

    return (

        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                width: 'fit-content',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                bgcolor: 'background.paper',
                color: 'text.secondary',
                '& svg': {
                    m: 1.5,
                },
                '& hr': {
                    mx: 0.5,
                },
            }}
        >
            {project.max_shares && <>
                <Box sx={{padding: '1rem'}}>
                    Total:&nbsp;<strong>{project.max_shares}</strong>
                </Box>
                <Divider orientation="vertical" variant="middle" flexItem/>
                <Box sx={{padding: '1rem'}}>
                    Sold:&nbsp;<strong>{project.shares_num}</strong>
                </Box>
                <Divider orientation="vertical" variant="middle" flexItem/>
            </>}
            <Box sx={{paddingRight: '1rem', display: 'flex', alignItems: 'center'}}>
                <SellIcon sx={{fontSize: 30, padding: 0}} color={'secondary'}/>
                <strong>{project.share_price}</strong>&nbsp;Tez</Box>
        </Box>
    );
}

export default SharesInfo;
