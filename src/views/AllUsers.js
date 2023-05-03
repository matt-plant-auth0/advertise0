import React, { useEffect, useState } from "react";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../components/Loading";
import { getConfig } from "../config";
import { DataGrid } from '@mui/x-data-grid';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const Users = () => {
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

    const columns = [
        { field: 'id', headerName: 'ID', width: 250 },
        { field: 'picture', headerName: 'Picture', width: 60,
            renderCell: (params)=>{
                return (
                    <div class="d-flex justify-content-center">
                        <img style={{'border-radius': '50%'}} src={params.row.picture} alt='' height={30} />
                    </div>
                )
            }
        },
        { field: 'name', headerName: 'Name', width: "200" },
        { field: 'email', headerName: 'Email', width: "600" }
    ];

    useEffect(() => {
        const getOrgsData = async () => {
            try {
                const token = await getAccessTokenSilently();
                const organisations = await fetch(`${apiOrigin}/users`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                const responseData = await organisations.json();

                let rows = [];

                for await (const org of responseData.data) {
                    rows.push({
                        id: org.user_id,
                        picture: org.picture,
                        name: org.name,
                        email: org.email
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

    return (
        <div className="ml-5 mr-5" style={{ height: '100%' }}>
            {!state.showResult &&
                <Box sx={{ display: 'flex' }}>
                    <CircularProgress />
                </Box>
            }
            {state.showResult && 
                <h3 className="m-4">List of Users</h3>
            }
            {state.showResult && (
                <DataGrid
                    rows={state.apiData}
                    columns={columns}
                />
            )}
        </div>
    );
}

export default withAuthenticationRequired(Users, {
    onRedirecting: () => <Loading />,
});