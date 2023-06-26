import React, { useEffect, useState } from "react";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../components/Loading";
import { getConfig } from "../config";
import { DataGrid } from '@mui/x-data-grid';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import jwt_decode from "jwt-decode";

const OrgUsers = () => {
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


    const approveInvitation = async (userID) => {
        try {
            const token = await getAccessTokenSilently();
            const updateUser = await fetch(`${apiOrigin}/update/user`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userID,
                    data:{
                        app_metadata: { adminApproved: true }
                    }
                })
            });
            const updateResData = await updateUser.json();

            // getOrgsData();
        } catch (error) {
            setState({
                ...state,
                error: error.error,
            });
        }
    }

    const triggerResetPassword = async (id) => {
        console.log ('start: reset password', id)
      
        const token = await getAccessTokenSilently();
        const access_token = jwt_decode(token);
        // const current_organisation = sessionStorage.getItem("organisationId") ? sessionStorage.getItem("organisationId") : access_token["https://advertise0.com/current_organisation"].id;
        const changePassword = await fetch(`${apiOrigin}/password/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            method: "POST"
        });
        const responseData = await changePassword.json();
    }


    const renderActionButton = (params) => {
        return (
            <strong>
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    style={{ marginLeft: 16 }}
                    onClick={(e) => {
                        e.preventDefault();
                        triggerResetPassword(params.row.id);
                        console.log ('params ', params.row.id)
                        
                    }}
                >
                    Reset password
                </Button>
            </strong>
        )
    }
    const columns = [
        { field: 'id', headerName: 'ID', width: 250 },
        {
            field: 'picture', headerName: 'Picture', width: 60,
            renderCell: (params) => {
                return (
                    <div class="d-flex justify-content-center">
                        <img style={{ 'border-radius': '50%' }} src={params.row.picture} alt='' height={30} />
                    </div>
                )
            }
        },
        { field: 'name', headerName: 'Name', width: "200" },
        { field: 'email', headerName: 'Email', width: "400" },
        { field: 'action', headerName: 'Action', width: "200", renderCell: renderActionButton, disableClickEventBubbling: true}
    ];


    useEffect(() => {
        const getOrgsData = async () => {
            try {
                const token = await getAccessTokenSilently();
                const access_token = jwt_decode(token);
                const current_organisation = sessionStorage.getItem("organisationId") ? sessionStorage.getItem("organisationId") : access_token["https://advertise0.com/current_organisation"].id;
                const organisations = await fetch(`${apiOrigin}/organisation/${current_organisation}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                const responseData = await organisations.json();

                let rows = [];

                for await (const org of responseData.data) {
                    //TODO: Need to call user endpoints to get metadata
                    const user = await fetch(`${apiOrigin}/user/${org.user_id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                    const userResData = await user.json();
                    if (userResData.data.app_metadata?.adminApproved) {
                        rows.push({
                            id: org.user_id,
                            picture: org.picture,
                            name: org.name,
                            email: org.email,
                            
                        });
                    }
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
                <>
                    <h3 className="m-4">List of members of your organisation</h3>
                    <h3 className="m-4"> <img src={JSON.parse(sessionStorage.getItem('organisation')).logo} style={{width: 'auto', maxHeight: '50px'}}/> {JSON.parse(sessionStorage.getItem('organisation')).name}</h3>
                    <p className="m-4">Users who have not yet been approved will not show in this list</p>
                </>
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

export default withAuthenticationRequired(OrgUsers, {
    onRedirecting: () => <Loading />,
});