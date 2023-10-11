import React, {useEffect, useState} from 'react';
import {useParams,} from 'react-router-dom';
import {useAuth} from "../../components/AuthContext";
import {configureFetch, formatTez} from "../../utils";
import {API_BASE_URL, PROJECT_ENDPOINT} from "../../Constants";
import BuySharesForm from "../../components/BuySharesForm";
import ProjectUpdateForm from "./ProjectUpdateForm";

const ProjectPage: React.FC = () => {
    const {token} = useAuth();
    const fetchWithAuth = configureFetch(token);
    const {projectId} = useParams();
    const [project, setProject] = useState<Record<string, any>>();

    useEffect(() => {
        if (projectId && (token != null)) {
            fetchWithAuth(`${API_BASE_URL}${PROJECT_ENDPOINT}/${projectId}`)
                .then(response => response.json())
                .then((project) => setProject(project))
        }
    }, [projectId, token])

    return project ? <>
        <div style={{float: "left"}}>
            <img src={project.image} alt={`project ${projectId} preview`} style={{ maxWidth: '100%'}}/>
        </div>
        <div>
            <h1>{project.title}</h1>
            <img src={project.artist.avatar} alt="avatar"/>
            <h2>{project.artist.username}</h2>
            {project.presenter && <>presented by <h2>{project.presenter.username}</h2></>}
            <div>{project.description}</div>
            <div>Deadline: {project.deadline}</div>

            <h2>Shares</h2>
            <div>price per share: {formatTez(project.share_price)} Tez</div>
            <div>purchased: {project.shares_sum}</div>
            <div>reserve: {project.min_shares}</div>

            <h2>NFT</h2>
            <div>At the end of the project NFT will be issued with the number of editions corresponding to the number of
                shares purchased
            </div>
            <div>Royalties: {project.royalty_pct} % to the artist, {project.commission_pct} % to the gallery</div>

            {project.last_update && <>
                <h2>Update from {project.last_update.created_on}</h2>
                {project.last_update.image && <img src={project.last_update.image} alt="project update"/>}
                {project.last_update.description}
            </>}
            {project.can_post_update && <ProjectUpdateForm projectId={projectId}/>}

            <h2>Patrons</h2>
            {project.can_buy_shares && <BuySharesForm project={project}/>}
            {project.sorted_shares.map((share: Record<string, any>, i: number) => {
                return <div key={i.toString()}>
                    {share.purchased_on}&nbsp;
                    {share.quantity} share(s)&nbsp;
                    <img src={share.patron.avatar} alt="avatar"/>
                    {share.patron.username}
                </div>
            })}
        </div>
    </> : <>Project not found</>;
};

export default ProjectPage;
