import * as React from 'react';
import {styled} from '@mui/material/styles';
import {
    Card, CardMedia, CardContent, CardActions, Collapse,
    Typography, IconButton, IconButtonProps, Avatar, Grid, Link, Box
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {cutTheTail} from "../../utils";
import {DESCRIPTION_PREVIEW_LENGTH} from "../../Constants";

interface ExpandMoreProps extends IconButtonProps {
    expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
    const {expand, ...other} = props;
    return <IconButton {...other} />;
})(({theme, expand}) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

export default function ProjectCard(props: { browsedArtist?: string, project: Record<string, any> }) {
    const {browsedArtist, project} = props;
    const [expanded, setExpanded] = React.useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
        <Grid item xs={12} md={6}>
            <Card>
                <CardContent sx={{display: 'flex'}}>
                    <Link href={`/${project.id}`} style={{flex: '1'}}>
                        <CardMedia
                            component="img" image={project.image} alt={project.token}
                            sx={{height: 170, width: 170, objectFit: 'contain'}}
                        />
                    </Link>
                    <Box flexGrow={1} p={2} display="flex" flexDirection="column" style={{paddingBottom: 0}}>
                        <Box flexGrow={1}>
                            <Typography variant="h6">
                                {project.title}
                            </Typography>
                            {!browsedArtist && <Link href={`/artist/${project.artist.username}`} display="flex" underline="none" style={{marginTop: 8}}>
                                <Avatar alt={project.artist.username} src={project.artist.avatar}></Avatar>
                                {!!project.artist.avatar &&
                                    <img src={project.artist.avatar} alt="{project.artist.username"
                                         style={{width: 30}}/>}
                                <Typography display="flex" m={1} alignItems="center">{project.artist.username}</Typography>
                            </Link>}
                        </Box>
                        <Box flexGrow={1} display="flex" flexDirection="column" style={{justifyContent: 'flex-end'}}>
                            <Typography variant="subtitle1" color="text.secondary" noWrap>
                                Started: {new Date(project.created_on).toLocaleDateString()}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary" noWrap>
                                Deadline: {new Date(project.deadline).toLocaleDateString()}
                            </Typography>
                        </Box>
                    </Box>
                    <Box flexGrow={1} p={2} display="flex" flexDirection="column" style={{paddingBottom: 0}}>
                        <Box flexGrow={1}>
                            <Typography>
                                Tezos
                            </Typography>
                            <Typography>
                                {project.share_price} Tez
                            </Typography>
                            <Typography>
                                {project.shares_num} shares
                            </Typography>
                        </Box>
                        <Box flexGrow={1} display="flex" flexDirection="column" style={{justifyContent: 'flex-end'}}>
                            <Typography variant="subtitle1" color="text.secondary">
                                Status: {project.status}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
                <CardActions>
                        {!expanded && <Typography variant="body2" color="text.secondary">
                            {cutTheTail(project.description, 80)}
                        </Typography>}
                        <Collapse in={expanded} timeout="auto" unmountOnExit>
                            <CardContent>
                                {project.description}
                            </CardContent>
                        </Collapse>
                        <ExpandMore
                            expand={expanded}
                            onClick={handleExpandClick}
                            aria-expanded={expanded}
                            aria-label="show more"
                            style={{visibility: expanded || (!!project.description && project.description.length > DESCRIPTION_PREVIEW_LENGTH) ? 'visible' : 'hidden'}}
                        >
                            <ExpandMoreIcon/>
                        </ExpandMore>
                </CardActions>
            </Card>
        </Grid>
    );
}