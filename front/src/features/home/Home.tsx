import React, {useEffect, useMemo, useState} from 'react';
import MaterialReactTable, {MRT_ColumnDef, MRT_SortingState} from "material-react-table";
import {Avatar, Typography, Grid, Link} from "@mui/material";
import {formatTez} from "../../utils";
import {API_BASE_URL} from "../../Constants";
import {ApiResponse} from "../../models/ApiResponse";
import {useParams} from "react-router-dom";

const Home = () => {
    const {username: artist} = useParams();
    const [data, setData] = useState<Record<string, any>[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(100);
    const [sorting, setSorting] = useState<MRT_SortingState>([{id: "deadline", desc: true}]);

    const rowsPerPage = 10;
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: rowsPerPage,
    });

    useEffect(() => {
        function getOrderUrlSearchParam() {
            if (sorting.length === 0) return '';
            return '&ordering=' + (sorting[0].desc ? `-${sorting[0].id}` : sorting[0].id);
        }

        const orderBy: string = getOrderUrlSearchParam();
        const searchArtist = artist ? `&artist=${artist}` : "";

        setIsLoading(true);
        fetch(`${API_BASE_URL}projects?open=1&offset=${pagination.pageIndex * rowsPerPage}${orderBy}${searchArtist}`)
            .then(response => response.json())
            .then((response: ApiResponse<Record<string, any>>) => {
                setTotalRecords(response.count);
                setData(response.results);
                setIsLoading(false);
            });
    }, [pagination.pageIndex, sorting]);

    const columns = useMemo<MRT_ColumnDef<any>[]>(
        () => [{
            id: 'project',
            header: 'Project',
            size: 300,
            Cell: ({renderedCellValue, row}) => (
                    <Grid container direction="row" alignItems="center" spacing={1} columns={2} padding={1}>
                        <Grid item>
                <Link href={`/projects/${row.original.id}`} underline="none">
                            <img
                                alt={row.original.title}
                                width={100}
                                src={row.original.image}
                                loading="lazy"
                            />
                </Link>
                        </Grid>
                        <Grid item>
                            <Typography variant="h6">{row.original.title}</Typography>
                            {!artist &&
                            <Typography variant="body2">
                                by
                                <Link href={`/artist/${row.original.artist.username}`} underline="none">
                                    {row.original.artist.avatar && (<Avatar alt={row.original.artist.username}
                                        src={row.original.artist.avatar}/>)} {row.original.artist.username}
                                </Link>
                            </Typography>}
                        </Grid>
                    </Grid>
            ),
        },
            {
                id: 'created_on',
                header: 'Started',
                accessorKey: 'created_on',
                Cell: ({renderedCellValue, row}) => new Date(row.original.created_on).toLocaleDateString()
            },
            {
                id: 'share_price',
                header: 'Share Price, Tez',
                accessorKey: 'share_price',
                Cell: ({renderedCellValue, row}) => formatTez(row.original.share_price)
            },
            {
                id: 'shares_num',
                header: 'Shares',
                accessorKey: 'shares_num'
            },
            {
                id: 'deadline',
                header: 'Deadline',
                accessorKey: 'deadline',
                Cell: ({renderedCellValue, row}) => new Date(row.original.deadline).toLocaleDateString()
            }
        ], [])

    return (
        <>
            <h1>Open Projects {artist && <>{"by "} {artist}</>}</h1>
            <MaterialReactTable
                columns={columns}
                data={data}

                positionToolbarAlertBanner="bottom"
                enableColumnActions={false}
                enableTopToolbar={false}

                manualPagination
                rowCount={totalRecords}

                muiTablePaginationProps={{
                    rowsPerPageOptions: [rowsPerPage],
                    showFirstButton: pagination.pageIndex > 0,
                    showLastButton: false,
                    page: pagination.pageIndex
                }}
                onPaginationChange={setPagination}

                muiTableProps={{
                    sx: {
                        tableLayout: 'fixed',
                    },
                }}

                enableDensityToggle={false}
                initialState={{density: 'compact'}}
                state={{pagination, isLoading, showProgressBars: isLoading, sorting}}

                manualSorting
                onSortingChange={setSorting}

                renderDetailPanel={({row}) => (<>{row.original.description}</>)}
            />
        </>
    );
};

export default Home;
