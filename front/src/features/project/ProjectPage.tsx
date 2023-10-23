import React, {useEffect, useState} from 'react';
import {useParams,} from 'react-router-dom';
import {Link as RouterLink} from "react-router-dom";
import {
    Alert,
    Avatar,
    Box,
    Card,
    CardActionArea,
    CardContent,
    CardHeader,
    CardMedia,
    LinearProgress,
    Link, Skeleton,
    Stack,
    Tab,
    Tabs,
    Typography
} from "@mui/material";
import {useAuth} from "../../components/AuthContext";
import {configureFetch, cutTheTail, extractPlainText, formatDate, getProgressPercentage, isSaleOpen} from "../../utils";
import {API_BASE_URL, DESCRIPTION_PREVIEW_LENGTH, PROJECT_ENDPOINT} from "../../Constants";
import {Project} from "../../models/Project";
import HSpacer from "../../components/common/HSpacer";
import SharesInfo from "./SharesInfo";
import ProjectUpdateForm from "./update/ProjectUpdateForm";
import BuySharesForm from "./buy/BuySharesForm";

// const IMAGE_STYLE_FULL_SIZE = {maxWidth: '100%', maxHeight: '900px', objectFit: 'scale-down'};

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{paddingTop: '1rem'}}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const ProjectPage = () => {
    const {token} = useAuth();
    const fetchWithAuth = configureFetch(token);
    const {projectId} = useParams();
    const [project, setProject] = useState<Project>();
    const [tabVal, setTabVal] = React.useState(0);

    useEffect(() => {
        if (projectId) {
            fetchWithAuth(`${API_BASE_URL}${PROJECT_ENDPOINT}/${projectId}`)
                .then(response => {
                    return response.ok ? response.json() : null
                })
                .then((project: Project | null) => setProject(project as Project))
        }
    }, [projectId, token])


    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabVal(newValue);
    };

    if (project == null) {
        return <LinearProgress/>
    }

    function a11yProps(index: number) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    return !project ? <>Project not found</> : <>
        <CardHeader
            avatar={
                <a href={`/profile/${encodeURIComponent(project.artist.username)}`}>
                    <Avatar alt={project.artist.username} src={project.artist.avatar}/>
                </a>
            }
            title={<div>
                <Link href={`/profile/${encodeURIComponent(project.artist.username)}`} underline="none"> <Typography
                    variant={'h6'}>{project.artist.username}</Typography></Link>
                <Box sx={{minHeight: 10}}>
                    <LinearProgress variant="determinate"
                                    color={isSaleOpen(project.status) ? 'primary' : 'inherit'}
                                    value={getProgressPercentage(project.created_on, project.deadline, project.status)}
                    />
                </Box>
            </div>}
            subheader={`${formatDate(project.created_on)} - ${formatDate(project.deadline)}`}
        />

        <img src={project.image}
             alt={`project ${projectId} preview`}
             style={{maxWidth: '100%', maxHeight: '900px', objectFit: 'contain'}}/>

        <div>
            <Stack direction={'row'} alignItems="center">
                <Box>
                    <Typography variant={'h3'}>{project.title}</Typography>
                </Box>
                <HSpacer/>
                <SharesInfo project={project}/>
            </Stack>

            {project.can_buy_shares && <BuySharesForm project={project}/>}

            {/*TODO: work on this part when we have projects presented by*/}
            {project.presenter && <Stack direction={'row'}
                                         justifyContent="flex-start"
                                         alignItems="center"
                                         spacing={2}
            >
                <Typography> presented by:</Typography>
                <CardHeader
                    avatar={
                        <a href={`/profile/${encodeURIComponent(project.presenter.username)}`}>
                            <Avatar alt={project.presenter.username} src={project.presenter.avatar}/>
                        </a>
                    }
                    title={<div>
                        <Link href={`/profile/${encodeURIComponent(project.presenter.username)}`} underline="none">
                            <Typography
                                variant={'h6'}>{project.presenter.username}</Typography></Link>
                    </div>}
                />
            </Stack>}

            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                <Tabs value={tabVal} onChange={handleTabChange} aria-label="basic tabs example">
                    <Tab label="Project description" {...a11yProps(0)} />
                    <Tab label="NFT information" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={tabVal} index={0}>
                <div dangerouslySetInnerHTML={{__html: project.description}}/>
            </CustomTabPanel>
            <CustomTabPanel value={tabVal} index={1}>
                <Box sx={{borderTop: 1, borderColor: 'divider'}}>
                    <Alert severity={'info'}>Once the project is successfully completed. We will mint an NFT with the
                        final
                        image. Here's the information you will find in the NFT's metadata.</Alert>
                    <br/>
                    <Typography variant="h6">NFT description</Typography>
                    <Typography variant="body1" gutterBottom>
                        {project.nft_description}
                    </Typography>

                    {project.royalty_pct != null && project.royalty_pct > 0 &&
                    <><Typography variant="h6" gutterBottom>Royalties: <strong>{project.royalty_pct}</strong>%
                    </Typography></>}
                </Box> </CustomTabPanel>


            {project.updates != null && project.updates.length > 0 && <Box sx={{paddingTop: '1rem'}}>
                <Typography variant={'h4'}>Project updates</Typography>
                <br/>

                <Stack direction={'row'} spacing={{xs: 1, sm: 2}} flexWrap="wrap" useFlexGap>
                    {project.updates.map((update) => (
                        <Card sx={{maxWidth: 345}}
                              key={`update from ${update.created_on}`}>
                            <CardActionArea to={`/${project.id}/${update.id}`} state={{project:project}} component={RouterLink}>
                                {update.image != null ? <CardMedia
                                    component="img"
                                    height="140"
                                    image={update.image}
                                    alt={`update from ${formatDate(update.created_on)}`}
                                />:  <Skeleton variant="rectangular" height={140} />}

                                <CardContent>
                                    <Typography gutterBottom variant="body2" component="div">
                                        {formatDate(update.created_on)}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {update.description != null && cutTheTail(DESCRIPTION_PREVIEW_LENGTH, extractPlainText(update.description))}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    ))}
                </Stack>
            </Box>}

            {project.can_post_update &&
            <Box sx={{paddingTop: '1rem', borderTop: 1, borderColor: 'divider', marginTop: '1rem'}}>
                <Typography variant={'h4'}>Post an update to the project</Typography>
                <ProjectUpdateForm projectId={projectId}/>
            </Box>}


            {project.shares != null && project.shares.length > 0 &&
            <Box sx={{paddingTop: '1rem', borderTop: 1, borderColor: 'divider', marginTop: '1rem'}}>
                <><Typography variant={'h4'}>Patrons</Typography>
                    {project.shares.map((share: Record<string, any>, i: number) => {
                        return (
                            <Stack key={i.toString()}
                                   direction={'row'}
                                   spacing={{xs: 1, sm: 2}}
                                   sx={{paddingTop: '1rem'}}
                                   justifyContent="flex-start"
                                   alignItems="center"
                            >
                                <Typography sx={{minWidth:'150px'}}>{formatDate(share.purchased_on)}</Typography>
                                <Typography px={2} sx={{minWidth:'150px'}}>{share.quantity} share(s)</Typography>

                                <Link href={`/profile/${encodeURIComponent(share.patron.username)}`} underline="none">
                                    <Avatar
                                        alt={share.patron.username} src={share.patron.avatar}/>
                                </Link>
                                <Link href={`/profile/${encodeURIComponent(share.patron.username)}`}
                                      underline="none">
                                    <Typography px={1}>{share.patron.username}</Typography>
                                </Link>
                            </Stack>
                        )
                    })}
                </>
            </Box>}
        </div>
    </>;
};

export default ProjectPage;
