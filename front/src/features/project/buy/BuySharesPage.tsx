import React from 'react';
import {useLocation} from "react-router-dom";
import {
    Avatar,
    Box,
    Card,
    CardContent,
    CardHeader,
    CardMedia,
    Divider,
    Link,
    Paper,
    Stack,
    Typography
} from "@mui/material";
import {Project} from "../../../models/Project";
import BuySharesForm from "./BuySharesForm";
import {cutTheTail, formatDate} from "../../../utils";
import {DESCRIPTION_LONG_PREVIEW_LENGTH} from "../../../Constants";


function BuySharesPage() {

    const location = useLocation();
    const project = location.state?.project as Project;

    if (project == null) return (<div>couldn't load the project</div>);
    return (
        <Stack direction={'column'} spacing={2}>
            {/*project preview*/}
            <Card sx={{display: 'flex'}}>
                <CardMedia
                    component="img"
                    sx={{
                        maxHeight: 200,
                        maxWidth: 200,
                        objectFit: 'contain',
                        margin: 0,
                        padding: 0,
                        flexGrow: 0,
                        alignSelf: 'start'
                    }}
                    image={project.image}
                    alt={project.title}
                />

                <Stack direction={'column'}>
                    <CardHeader
                        sx={{paddingTop: 0}}
                        avatar={
                            <a href={`/profile/${encodeURIComponent(project.artist.username)}`}>
                                <Avatar alt={project.artist.username} src={project.artist.avatar}/>
                            </a>
                        }
                        title={<div><Link href={`/profile/${encodeURIComponent(project.artist.username)}`}
                                          underline="none"> {project.artist.username}</Link></div>}
                    />

                    <CardContent sx={{paddingTop: 0}}>
                        <Typography variant="subtitle1" gutterBottom>
                            {`${formatDate(project.created_on)} - ${formatDate(project.deadline)}`}
                        </Typography>
                        <Typography component="div" variant="h5">
                            {project.title}
                        </Typography>
                        <Box>
                            <span
                                dangerouslySetInnerHTML={{__html: cutTheTail(project.description, DESCRIPTION_LONG_PREVIEW_LENGTH)}}/>
                        </Box>


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
                                marginTop: '1rem'
                            }}
                        >
                            {project.max_shares && <><Box sx={{padding: '1rem'}}>Total
                                shares: <strong>{project.max_shares}</strong></Box>
                                <Divider orientation="vertical" variant="middle" flexItem/>
                                <Box sx={{padding: '1rem'}}>Available
                                    shares: <strong>{project.max_shares - project.shares_num}</strong></Box>
                                <Divider orientation="vertical" variant="middle" flexItem/>
                            </>}
                            <Box sx={{padding: '1rem'}}>Price per share:
                                 <strong>{project.share_price}</strong> Tez</Box>
                        </Box>

                    </CardContent>
                </Stack>


            </Card>


            <Paper sx={{padding: '1rem'}}>
                <Typography variant="h6" gutterBottom>Purchase project shares</Typography>
                <BuySharesForm project={project}/>
            </Paper>

        </Stack>
    );
}

export default BuySharesPage;
