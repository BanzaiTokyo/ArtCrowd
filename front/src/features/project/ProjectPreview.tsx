import React from 'react';
import {
    Avatar,
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardHeader,
    CardMedia,
    LinearProgress,
    Link,
    Stack,
    Typography
} from "@mui/material";
import {Project} from "../../models/Project";
import SharesInfo from "./SharesInfo";
import {DESCRIPTION_LONG_PREVIEW_LENGTH} from "../../Constants";
import {cutTheTail, formatDate} from "../../utils";

function ProjectPreview(props: { project: Project, isLoading: boolean }) {
    const {project, isLoading} = props;

    if (project == null || isLoading) return (<LinearProgress/>);

    return (
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
                                dangerouslySetInnerHTML={{__html: cutTheTail(DESCRIPTION_LONG_PREVIEW_LENGTH, project.description)}}/>
                    </Box>


                    <Box sx={{paddingTop: '2rem', paddingBottom: '1rem'}}>
                        <Typography variant={"h5"}>Shares</Typography>
                    </Box>

                    <SharesInfo project={project}/>

                </CardContent>
            </Stack>
        </Card>
    );
}

export default ProjectPreview;
