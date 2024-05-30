import {Container, Grid, LinearProgress, Pagination, PaginationItem} from "@mui/material";
import React, {useEffect, useState} from "react";
import {API_BASE_URL} from "../../Constants";
import ProjectCard from "./ProjectCard";
import {ApiResponse} from "../../models/ApiResponse";
import {Project} from "../../models/Project";

export default function ProjectCardsList(props: {page?: number, [key: string]: any} = {}) {
    const [data, setData] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(100);
    const [sorting, setSorting] = useState([{id: "deadline", desc: true}]);
    const [page, setPage] = useState<number>(props.page || 1);
    const rowsPerPage = 16;

    useEffect(() => {
        function getOrderUrlSearchParam() {
            if (sorting.length === 0) return '';
            return '&ordering=' + (sorting[0].desc ? `-${sorting[0].id}` : sorting[0].id);
        }
        const orderBy: string = getOrderUrlSearchParam();
        // @ts-ignore
        const qs = new URLSearchParams({...props, offset: (page-1) * rowsPerPage, limit: rowsPerPage});
        qs.delete('page');

        setIsLoading(true);
        fetch(`${API_BASE_URL}projects?open=true&${qs}${orderBy}`)
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

            {!isLoading && totalRecords / rowsPerPage > 1 &&
            <Pagination showFirstButton
                        showLastButton={false}
                        count={Math.ceil(totalRecords / rowsPerPage)}
                        page={page as number}
                        onChange={(e, value) => setPage(value)}
                        />}

            <Grid container spacing={2} alignItems="stretch">

                {!isLoading && data.map(project => <ProjectCard key={project.id} project={project}/>)}
            </Grid>
        </>);
}