import {Container, Grid, LinearProgress, Pagination, PaginationItem} from "@mui/material";
import React, {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {API_BASE_URL} from "../../Constants";
import ProjectCard from "./ProjectCard";
import {ApiResponse} from "../../models/ApiResponse";
import {Project} from "../../models/Project";

export default function ProjectCardsList() {
    const {username: artist, page = 0} = useParams();
    const [data, setData] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(100);
    const [sorting, setSorting] = useState([{id: "deadline", desc: true}]);
    const rowsPerPage = 16;
    const searchArtist = artist ? `&artist=${artist}` : "";

    useEffect(() => {
        function getOrderUrlSearchParam() {
            if (sorting.length === 0) return '';
            return '&ordering=' + (sorting[0].desc ? `-${sorting[0].id}` : sorting[0].id);
        }

        const orderBy: string = getOrderUrlSearchParam();

        setIsLoading(true);
        fetch(`${API_BASE_URL}projects?open=any&offset=${(page as number) * rowsPerPage}&limit=${rowsPerPage}${orderBy}${searchArtist}`)
            .then(response => response.json())
            .then((response: ApiResponse<Project>) => {
                setTotalRecords(response.count);
                setData(response.results);
                setIsLoading(false);
            });
    }, [page, sorting]);

    return (
        <>
            {isLoading && <Container maxWidth="xl">
                {/*for some reason the loader has a padding (?) on the right*/}
                <LinearProgress/>
            </Container>}

            {!isLoading && totalRecords / rowsPerPage > rowsPerPage &&
            <Pagination showFirstButton
                        showLastButton={false}
                        count={Math.floor(totalRecords / rowsPerPage)}
                        page={page as number}
                        renderItem={(item) => (
                            <PaginationItem
                                component={Link}
                                to={`/?page=${item.page}` + (artist)}
                                {...item}
                            />
                        )}/>}

            <Grid container spacing={2} alignItems="stretch">

                {!isLoading && data.map(project => <ProjectCard key={project.id} project={project}/>)}
            </Grid>
        </>);
}