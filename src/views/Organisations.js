import React, { useEffect, useState } from "react";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../components/Loading";
import { getConfig } from "../config";
import { DataGrid } from '@mui/x-data-grid';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const Organisations = () => {
    const { apiOrigin, audience } = getConfig();

    const {
        getAccessTokenSilently,
        loginWithPopup,
        getAccessTokenWithPopup,
    } = useAuth0();

    const [state, setState] = useState({
        showResult: false,
        apiData: [],
        error: null,
    });

    const redirectModify = (id, data) => {
        sessionStorage.setItem("organisationId", id);
        console.log(data);
        sessionStorage.setItem("organisation", JSON.stringify(data.row));
        window.location.href = "/modify";
    }

    const redirectInvite = (id, data) => {
        sessionStorage.setItem("organisationId", id);
        console.log(data);
        sessionStorage.setItem("organisation", JSON.stringify(data.row));
        window.location.href = "/invite";
    }

    const redirectUsers = (id, data) => {
        sessionStorage.setItem("organisationId", id);
        console.log(data);
        sessionStorage.setItem("organisation", JSON.stringify(data.row));
        window.location.href = "/org-users";
    }

    const columns = [
        { field: 'id', headerName: 'ID', width: 250 },
        {
            field: 'logo', headerName: 'Logo', width: 230,
            renderCell: (params) => {
                return (
                    <img src={params.row.logo} alt='' height={30} />
                )
            }
        },
        { field: 'name', headerName: 'Organisation\'s name', width: 250 },
        {
            field: 'actions', headerName: 'Action', width: 500,
            renderCell: (params) => {
                return (
                    <>
                        <a href="#" onClick={() => { redirectInvite(params.row.id, params) }}>
                            Create or view Invites
                        </a>
                        &nbsp;|&nbsp;
                        <a href="#" onClick={() => { redirectUsers(params.row.id, params) }}>
                            View all users in org
                        </a>
                        &nbsp;|&nbsp;
                        <a href="#" onClick={() => { redirectModify(params.row.id, params) }}>
                            Modify org details
                        </a>
                    </>
                )
            }
        }
    ];

    useEffect(() => {
        console.log('start: get orgs');
        const getOrgsData = async () => {
            try {
                const token = await getAccessTokenSilently();
                console.log('got token ', token);
                const organisations = await fetch(`${apiOrigin}/organisations`, {
                    method: "GET",
                    body: null,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                const responseData = await organisations.json();
                console.log('got orgs ', responseData);
                let rows = [];

                for await (const org of responseData.data) {
                    rows.push({
                        id: org.id,
                        logo: org.branding.logo_url,
                        name: org.display_name
                    });
                }

                setState({
                    ...state,
                    showResult: true,
                    apiData: rows
                });
            } catch (error) {
                setState({
                    ...state,
                    error: error.error,
                });
            }
        };
        getOrgsData();
    }, [getAccessTokenSilently]);

    return (<>
        <div className="ml-5 mr-5" style={{ height: '100%' }}>
            {!state.showResult &&
                <Box sx={{ display: 'flex' }}>
                    <CircularProgress />
                </Box>
            }
            {state.showResult &&
                <h3 className="m-4">List of Organisations</h3>
            }
            {state.showResult && (
                <DataGrid
                    rows={state.apiData}
                    columns={columns}
                    pageSize={5}
                />
            )}
        </div>
    </>);
}

export default withAuthenticationRequired(Organisations, {
    onRedirecting: () => <Loading />,
});