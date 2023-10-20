import React, {useEffect, useState} from 'react';
import {useParams,} from 'react-router-dom';
import {
    Alert,
    Avatar,
    Box,
    Button,
    CardHeader,
    Divider,
    ImageList,
    ImageListItem,
    ImageListItemBar,
    LinearProgress,
    Link,
    Stack,
    Typography
} from "@mui/material";
import {useAuth} from "../../components/AuthContext";
import {configureFetch, cutTheTail, formatDate, getProgressPercentage, isSaleOpen} from "../../utils";
import {API_BASE_URL, DESCRIPTION_LONG_PREVIEW_LENGTH, PROJECT_ENDPOINT} from "../../Constants";
import {Project} from "../../models/Project";
import HSpacer from "../../components/common/HSpacer";
import SharesInfo from "./SharesInfo";
import ProjectUpdateForm from "./update/ProjectUpdateForm";
import BuySharesForm from "./buy/BuySharesForm";

const IMAGE_STYLE_FULL_SIZE = {maxWidth: '100%', maxHeight: '900px', objectFit: 'scale-down'};

const ProjectPage = () => {
    const {token} = useAuth();
    const fetchWithAuth = configureFetch(token);
    const {projectId} = useParams();
    const [project, setProject] = useState<Project>();
    const [isNftInfoVisible, setIsNftInfoVisible] = useState(false);

    useEffect(() => {
        if (projectId && (token != null)) {
            fetchWithAuth(`${API_BASE_URL}${PROJECT_ENDPOINT}/${projectId}`)
                .then(response => {
                    return response.ok ? response.json() : null
                })
                .then((project: Project | null) => setProject(project as Project))
        }
    }, [projectId, token])

    function toggleNftInfoVisible() {
        setIsNftInfoVisible((prev) => !prev);
    }

    if (project == null) {
        return <LinearProgress/>
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


            {/*TODO: work on this part when we have projects presented by*/}
            {project.presenter && <>
                presented by:
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
            </>}

            <div dangerouslySetInnerHTML={{__html: project.description}}/>

            <Button
                onClick={toggleNftInfoVisible}>{isNftInfoVisible ? 'Hide ' : 'Show '} NFT information</Button>

            {isNftInfoVisible &&
            <Box sx={{borderTop: 1, borderColor: 'divider'}}>
                <Alert severity={'info'}>Once the project is successfully completed. We will mint an NFT with the final
                    image. Here's the information you will find in the NFT's metadata.</Alert>
                <Typography variant="h6">NFT description</Typography>
                <Typography variant="body1" gutterBottom>
                    {project.nft_description}
                </Typography>

                {project.royalty_pct != null && project.royalty_pct > 0 &&
                <><Typography variant="h6" gutterBottom>Royalties</Typography>
                    <Typography variant="body1" gutterBottom>
                        The artist will receive <strong>{project.royalty_pct}</strong>%
                    </Typography></>}
            </Box>
            }

            <Divider sx={{paddingTop: '1rem'}}/>

            <Box sx={{paddingTop: '1rem'}}>
                {project.updates && <Typography variant={'h4'}>Project updates</Typography>}
                <ImageList sx={{width: 500, height: 450}}>
                    {project.updates.map((update) => (
                        // TODO: find a way to link to update page
                        // <a href={`/${project.id}/${update.id}`}>
                            <ImageListItem key={update.image}>
                                <img
                                    srcSet={`${update.image}`}
                                    src={`${update.image}`}
                                    loading="lazy"
                                    alt={`update from ${update.description}`}/>
                                <ImageListItemBar
                                    title={<Typography variant="subtitle2">{formatDate(update.created_on)}</Typography>}
                                    subtitle={
                                        <Typography>
                                            {update.description != null && cutTheTail(DESCRIPTION_LONG_PREVIEW_LENGTH, update.description)}
                                        </Typography>}
                                    position="below"
                                />
                            </ImageListItem>
                        // </a>
                    ))}
                </ImageList>
            </Box>

            {project.can_post_update && <ProjectUpdateForm projectId={projectId}/>}

            <h2>Patrons</h2>
            {project.can_buy_shares && <BuySharesForm project={project}/>}
            {project.shares.map((share: Record<string, any>, i: number) => {
                return <div key={i.toString()}>
                    <Box sx={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                        <Typography px={2}>{formatDate(share.purchased_on)}</Typography>
                        <Typography px={2}>{share.quantity} share(s)</Typography>
                        <Avatar alt={share.patron.username} src={share.patron.avatar}/>
                        <Typography px={1}>{share.patron.username}</Typography>
                    </Box>

                </div>
            })}
        </div>
    </>;
};

export default ProjectPage;
