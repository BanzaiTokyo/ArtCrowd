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
import {getProgressPercentage, isSaleOpen} from "../../utils";
import {Project} from "../../models/Project";
import Spacer from "../../components/common/Spacer";
import dayjs from "dayjs";


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

export default function ProjectCard(props: { browsedArtist?: string, project: Project }) {
    const {browsedArtist, project} = props;

    return (
        <Grid item xs={12} md={4}>
            <Card>
                <CardHeader
                    avatar={
                        <>
                            <Avatar alt={project.artist.username} src={project.artist.avatar}/>
                        </>
                    }
                    //TODO: link to a real profile
                    title={<div>
                        <Link href={'profile'} underline="none"> {project.artist.username}</Link>
                        <Box sx={{minHeight: 10}}>
                            {isSaleOpen(project.status) && <LinearProgress variant="determinate"
                                                                           value={getProgressPercentage(project.created_on, project.deadline)}
                            />}
                        </Box>
                    </div>}
                    subheader={`${dayjs(project.created_on).format('MMMM DD, YYYY')} - ${dayjs(project.deadline).format('MMMM DD, YYYY')}`}
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
                            objectPosition: 'left top'
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
                            <Spacer/>
                            <Button variant="outlined">Purchase</Button>
                        </Stack>

                    </Box>
                </CardContent>
            </Card>
        </Grid>
    );
}