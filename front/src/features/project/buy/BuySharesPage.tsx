import React, {useEffect, useState} from 'react';
import {useLocation, useParams} from "react-router-dom";
import {
    Alert,
    Avatar,
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardHeader,
    CardMedia,
    Divider,
    LinearProgress,
    Link,
    Paper,
    Stack,
    Typography
} from "@mui/material";
import {Project} from "../../../models/Project";
import BuySharesForm from "./BuySharesForm";
import {cutTheTail, formatDate} from "../../../utils";
import {API_BASE_URL, DESCRIPTION_LONG_PREVIEW_LENGTH} from "../../../Constants";
import SellIcon from '@mui/icons-material/Sell';

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
            {/*project preview*/}
            <Card sx={{display: 'flex'}}>
                <CardActionArea href={`/${project.id}`}
                                sx={{
                                    maxHeight: 200,
                                    maxWidth: 200,
                                    objectFit: 'contain',
                                    margin: 0,
                                    padding: 0,
                                    flexGrow: 0,
                                    alignSelf: 'start'
                                }}>
                    <CardMedia
                        component="img"
                        image={project.image}
                        alt={project.title}
                    />
                </CardActionArea>

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


                        <Box sx={{paddingTop: '2rem'}}>
                            <Typography variant={"h5"}>Shares</Typography>
                        </Box>
                        {/*<Divider orientation="horizontal" variant={'fullWidth'} flexItem/>*/}

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
                            {project.max_shares && <>
                                <Box sx={{padding: '1rem'}}>
                                    Total: <strong>{project.max_shares}</strong>
                                </Box>
                                <Divider orientation="vertical" variant="middle" flexItem/>
                                <Box sx={{padding: '1rem'}}>
                                    Sold: <strong>{project.shares_num}</strong>
                                </Box>
                                <Divider orientation="vertical" variant="middle" flexItem/>
                            </>}
                            <Box sx={{paddingRight: '1rem', display: 'flex', alignItems: 'center'}}>
                                <SellIcon sx={{fontSize: 30, padding: 0}} color={'secondary'}/>
                                <strong>{project.share_price}</strong>&nbsp;Tez</Box>
                        </Box>

                    </CardContent>
                </Stack>


            </Card>


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
