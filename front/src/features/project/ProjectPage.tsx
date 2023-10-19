import React, {useEffect, useState} from 'react';
import {Link as RouterLink, useParams,} from 'react-router-dom';
import {Avatar, Box, Button, CardHeader, LinearProgress, Link, Stack, Typography} from "@mui/material";
import {useAuth} from "../../components/AuthContext";
import {configureFetch, formatDate, getProgressPercentage, isSaleOpen} from "../../utils";
import {API_BASE_URL, FEE_PCT, PROJECT_ENDPOINT} from "../../Constants";
import BuySharesForm from "./buy/BuySharesForm";
import ProjectUpdateForm from "./update/ProjectUpdateForm";
import {Project} from "../../models/Project";
import ProjectUpdateComponent from "./update/ProjectUpdateComponent";
import HSpacer from "../../components/common/HSpacer";

const IMAGE_STYLE_FULL_SIZE = {maxWidth: '100%', maxHeight: '900px', objectFit: 'scale-down'};

const ProjectPage = () => {
    const {token} = useAuth();
    const fetchWithAuth = configureFetch(token);
    const {projectId} = useParams();
    const [project, setProject] = useState<Project>();

    useEffect(() => {
        if (projectId && (token != null)) {
            fetchWithAuth(`${API_BASE_URL}${PROJECT_ENDPOINT}/${projectId}`)
                .then(response => {
                    return response.ok ? response.json() : null
                })
                .then((project: Project | null) => setProject(project as Project))
        }
    }, [projectId, token])

    if (project === undefined) {
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
            <Stack direction={'row'}>
                <Box>
                    <Typography variant={'h3'}>{project.title}</Typography>
                </Box>
                <HSpacer/>
                <Box>
                    <Button variant={'contained'}
                            size={'large'}
                            component={RouterLink}
                            to={`/${project.id}/buy`}
                            state={{project: project}}>Support</Button>
                </Box>
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

            <Typography variant={'h4'}>Shares</Typography>
            <div>price per share: {project.share_price} Tez</div>
            <div>purchased: {project.shares_num}</div>
            <div>reserve: {project.min_shares}</div>

            <h2>NFT</h2>
            <div>At the end of the project NFT will be issued with the number of editions corresponding to the number of
                shares purchased
            </div>
            <div>Royalties: {project.royalty_pct} % to the artist, {FEE_PCT} % to the gallery</div>

            {project.updates && <Typography variant={'h4'}>Project updates</Typography>}
            {project.updates && project.updates.map((update) => {
                return (
                    <ProjectUpdateComponent key={JSON.stringify(update)} update={update}/>
                )
            })}
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
