import * as React from 'react';
import {styled} from '@mui/material/styles';
import {
    Avatar,
    Box,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Collapse,
    Container,
    Grid,
    IconButton,
    IconButtonProps,
    LinearProgress,
    Link,
    Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {extractPlainText, getProgressPercentage, isSaleOpen} from "../../utils";
import {Project} from "../../models/Project";

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
    const [expanded, setExpanded] = React.useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
        <Grid item xs={12} md={6}>
            <Card>
                <CardContent sx={{display: 'flex'}}>
                    <Link href={`/${project.id}`}>
                        <CardMedia
                            component="img" image={project.image} alt={project.title}
                            sx={{height: 170, width: 170, objectFit: 'contain', objectPosition: 'top'}}
                        />
                    </Link>
                    <Box px={2} sx={{
                        maxWidth: '45%',
                        paddingBottom: 0,
                        display: 'flex',
                        flex: '2 1 auto',
                        flexDirection: 'column'
                    }}>
                        <Box flexGrow={1}>
                            <Link href={`/${project.id}`} underline="none">
                                <TruncatedText variant="h6" height="3.2em" lines={2}>
                                    {project.title}
                                </TruncatedText></Link>
                            {!browsedArtist &&
                            <Link href={`/artist/${project.artist.username}`} display="flex" underline="none"
                                  style={{marginTop: 8}}>
                                <Avatar alt={project.artist.username} src={project.artist.avatar}/>
                                <Typography display="flex" m={1}
                                            alignItems="center">{project.artist.username}</Typography>
                            </Link>}
                        </Box>
                        <Typography variant="subtitle1" color="text.secondary" noWrap>
                            Started: {new Date(project.created_on).toLocaleDateString()}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" noWrap>
                            Deadline: {new Date(project.deadline).toLocaleDateString()}
                        </Typography>
                    </Box>
                    <Box px={2} sx={{paddingBottom: 0, display: 'flex', flex: 1, flexDirection: 'column'}}>
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
                        {isSaleOpen(project.status) ? <LinearProgress variant="determinate" value={getProgressPercentage(project.created_on, project.deadline)}/> :
                            <Typography variant="subtitle1" color="text.secondary">
                                Status: {project.status}
                            </Typography>}
                    </Box>
                </CardContent>
                <CardActions>
                    {!expanded && <TruncatedText variant="body2" color="text.secondary" lines={1}>
                        {extractPlainText(project.description)}
                    </TruncatedText>}

                    <ExpandMore
                        expand={expanded}
                        onClick={handleExpandClick}
                        aria-expanded={expanded}
                        aria-label="show more"
                    >
                        <ExpandMoreIcon/>
                    </ExpandMore>
                </CardActions>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Container>
                        <div dangerouslySetInnerHTML={{__html: project.description}}/>
                    </Container>
                </Collapse>
            </Card>
        </Grid>
    );
}