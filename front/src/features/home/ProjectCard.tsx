import * as React from 'react';
import {styled} from '@mui/material/styles';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    CardHeader,
    CardMedia,
    Chip,
    Grid,
    LinearProgress,
    Link,
    Stack,
    Typography
} from '@mui/material';
import {Link as RouterLink} from "react-router-dom";

import {formatDate, getProgressPercentage, isSaleOpen} from "../../utils";
import {Project} from "../../models/Project";
import HSpacer from "../../components/common/HSpacer";


const TruncatedText = styled((props: any) => {
    const {lines, ...other} = props;
    return <Typography {...other} />;
})(({lines}) => ({
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
}));

export default function ProjectCard(props: { project: Project }) {
    const {project} = props;

    return (
        <Grid item xs={12} md={4}>
            <Card>
                <CardHeader
                    avatar={
                        <a  href={`/profile/${encodeURIComponent(project.artist.username)}`}>
                            <Avatar alt={project.artist.username} src={project.artist.avatar}/>
                        </a>
                    }
                    title={<div>
                        <Link href={`/profile/${encodeURIComponent(project.artist.username)}`} underline="none"> {project.artist.username}</Link>
                        <Box sx={{minHeight: 10}}>
                            <LinearProgress variant="determinate"
                                            color={isSaleOpen(project.status) ? 'primary' : 'inherit'}
                                            value={getProgressPercentage(project.created_on, project.deadline, project.status)}
                            />
                        </Box>
                    </div>}
                    subheader={`${formatDate(project.created_on)} - ${formatDate(project.deadline)}`}
                />
                <CardActionArea href={`/${project.id}`}>
                    <CardMedia
                        component="img"
                        image={project.image}
                        alt={project.title}
                        sx={{
                            flexGrow: '1',
                            maxHeight: '200px',
                            objectFit: 'contain',
                            objectPosition: 'center top'
                        }}
                    />
                </CardActionArea>
                <CardContent sx={{display: 'flex', flexWrap: "wrap"}}>

                    <Box sx={{
                        width: '100%',
                        paddingBottom: 0,
                        display: 'flex',
                        flex: '2 1 auto',
                        flexDirection: 'column'
                    }}>
                        <Box>
                            <Link href={`/${project.id}`} underline="none">
                                <TruncatedText variant="h6" height="3.2em" lines={2}>
                                    {project.title}
                                </TruncatedText>
                            </Link>
                        </Box>

                    </Box>

                    <Box
                        sx={{
                            paddingBottom: 0,
                            display: 'flex',
                            flex: 1,
                            flexDirection: 'column',
                            minWidth: 200
                        }}>
                        <Stack direction="row">
                            <Box>
                                Share: <Chip label={<span><strong>{project.share_price}</strong> Tez</span>}
                                             color="success"
                                             variant="outlined"/>
                                <Typography>
                                    <strong>{project.shares_num}</strong> shares sold
                                </Typography>
                            </Box>
                            <HSpacer/>

                            <Button variant="outlined" component={RouterLink} to={`/${project.id}/buy`} state={{project:project}}>Support</Button>

                        </Stack>

                    </Box>
                </CardContent>
            </Card>
        </Grid>
    );
}