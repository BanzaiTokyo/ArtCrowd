import React, {useEffect, useState} from 'react';
import {useParams,} from 'react-router-dom';
import {Avatar, LinearProgress, Box, Typography} from "@mui/material";
import dayjs from "dayjs";
import {useAuth} from "../../components/AuthContext";
import {configureFetch} from "../../utils";
import {API_BASE_URL, PROJECT_ENDPOINT} from "../../Constants";
import BuySharesForm from "./buy/BuySharesForm";
import ProjectUpdateForm from "./ProjectUpdateForm";
import {Project} from "../../models/Project";
import {FEE_PCT} from "../../Constants";

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
        <img src={project.image}
             alt={`project ${projectId} preview`}
             style={{maxWidth: '100%', maxHeight: '900px', objectFit: 'contain'}}/>
        <div>
            <h1>{project.title}</h1>
            <Box sx={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                <Avatar alt={project.artist.username} src={project.artist.avatar} />
                <Typography variant="h4" px={2}>{project.artist.username}</Typography>
            </Box>
            {project.presenter && <>
                presented by
                <Box sx={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                    <Avatar alt={project.presenter.username} src={project.presenter.avatar} />
                    <Typography variant="h4" px={2}>{project.presenter.username}</Typography>
                </Box>
            </>}
            <div dangerouslySetInnerHTML={{__html: project.description}}/>
            <div>Deadline: {project.deadline}</div>

            <h2>Shares</h2>
            <div>price per share: {project.share_price} Tez</div>
            <div>purchased: {project.shares_num}</div>
            <div>reserve: {project.min_shares}</div>

            <h2>NFT</h2>
            <div>At the end of the project NFT will be issued with the number of editions corresponding to the number of
                shares purchased
            </div>
            <div>Royalties: {project.royalty_pct} % to the artist, {FEE_PCT} % to the gallery</div>

            {project.updates && project.updates.map((update) => {
                return (
                    <><h2>Update from {update.created_on}</h2>
                        {update.image &&
                        <img src={update.image} alt="project update"/>}
                        {update.description}
                    </>
                )
            })}
            {project.can_post_update && <ProjectUpdateForm projectId={projectId}/>}

            <h2>Patrons</h2>
            {project.can_buy_shares && <BuySharesForm project={project}/>}
            {project.shares.map((share: Record<string, any>, i: number) => {
                return <div key={i.toString()}>
                    <Box sx={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                        <Typography px={2}>{dayjs(share.purchased_on).format('MMMM DD, YYYY')}</Typography>
                        <Typography px={2}>{share.quantity} share(s)</Typography>
                        <Avatar alt={share.patron.username} src={share.patron.avatar} />
                        <Typography px={1}>{share.patron.username}</Typography>
                    </Box>

                </div>
            })}
        </div>
    </>;
};

export default ProjectPage;
