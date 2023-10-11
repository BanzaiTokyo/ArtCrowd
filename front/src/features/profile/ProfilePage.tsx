import React, {useEffect, useMemo, useState} from 'react';
import MaterialReactTable, {MRT_ColumnDef} from "material-react-table";
import {useAuth} from "../../components/AuthContext";
import {configureFetch} from "../../utils";
import {API_BASE_URL} from "../../Constants";

type ProfileType = {
    projects: Record<string, any>[],
    gallery_projects: Record<string, any>[],
    supported_projects: Record<string, any>[],
}
const ProfilePage = () => {
    const {token} = useAuth();
    const fetchWithAuth = configureFetch(token);
    const [data, setData] = useState<ProfileType | null>(null);

    useEffect(() => {
        if (!token) {
            return
        }
        fetchWithAuth(`${API_BASE_URL}profile`)
            .then(response => response.json())
            .then((profileData) => setData(profileData))
    }, [token])

    const columns = useMemo<MRT_ColumnDef<any>[]>(
        () => [{
            id: 'project',
            header: 'Project',
            Cell: ({renderedCellValue, row}) => (
                <a href={`/${row.original.id}`}>
                    <img
                        alt="{row.title}"
                        height={30}
                        src={row.original.image}
                        loading="lazy"
                    />
                    <span style={{fontSize: "2em"}}>{row.original.title}</span>
                    <div>
                        by <img alt={row.original.artist.username}
                                src={row.original.artist.avatar}/> {row.original.artist.avatar}
                    </div>
                </a>
            ),
        },
            {
                id: 'created_on',
                header: 'Started',
                accessorKey: 'created_on'
            },
            {
                id: 'share_price',
                header: 'Share Price, Tez',
                accessorKey: 'share_price'
            },
            {
                id: 'shares_num',
                header: 'Shares',
                accessorKey: 'shares_num'
            },
            {
                id: 'deadline',
                header: 'Deadline',
                accessorKey: 'deadline'
            }
        ], [])

    const myProjects = data?.projects && <MaterialReactTable columns={columns} data={data.projects}
                                                             renderDetailPanel={({row}) => (<>{row.original.description}</>)}/>;
    const galleryProjects = data?.gallery_projects && <MaterialReactTable columns={columns} data={data.gallery_projects}
                                                                          renderDetailPanel={({row}) => (<>{row.original.description}</>)}/>;
    const supportedProjects = data?.supported_projects &&
        <MaterialReactTable columns={columns} data={data.supported_projects}
                            renderDetailPanel={({row}) => (<>{row.original.description}</>)}/>;
    return (
        <>
            <div>
                <h1>My Projects</h1>
                {myProjects}
            </div>
            <div>
                <h1>My Gallery Projects</h1>
                {galleryProjects}
            </div>
            <div>
                <h1>Supported Projects</h1>
                {supportedProjects}
            </div>
        </>
    );
};

export default ProfilePage;
