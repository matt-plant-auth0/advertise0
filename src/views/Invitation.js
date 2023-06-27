import React, { useEffect, useState } from "react";
import { useAuth0, User, withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../components/Loading";
import { getConfig } from "../config";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { DataGrid } from '@mui/x-data-grid';
import CircularProgress from '@mui/material/CircularProgress';
import Select from '@mui/material/Select';

import InputLabel from '@mui/material/InputLabel';

import MenuItem from '@mui/material/MenuItem';

const OrganisationsInvitation = () => {
    const { apiOrigin, audience } = getConfig();

    const {
        user,
        getAccessTokenSilently,
    } = useAuth0();

    const defaultValues = {
        fname: "",
        lname: "",
        email: "",
        organisationId: sessionStorage.getItem("organisationId") ? sessionStorage.getItem("organisationId") : "Null",
        role: ""
    };

    const [state, setState] = useState({
        showResult: false,
        apiData: [],
        error: null,
        roles: []
    });

    const organisation = sessionStorage.getItem("organisation") ? JSON.parse(sessionStorage.getItem("organisation")).display_name : "Null";

    const [formValues, setFormValues] = useState(defaultValues)

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };

    const [InviteRole, setInviteRole] = React.useState([]);

    const handleSelectChange = (e) => {
        const {
            target: { value },
        } = e;
        setInviteRole(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );

        setFormValues({
            ...formValues,
            role: InviteRole,
        });

    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log(formValues);
        try {
            const token = await getAccessTokenSilently();
            const invitation = await fetch(`${apiOrigin}/organisations/invite`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    organisationId: formValues.organisationId,
                    inviter: user.name,
                    invitee: {
                        email: formValues.email
                    },
                    fname: formValues.fname,
                    lname: formValues.lname
                })
            });
            const responseData = await invitation.json();

            getOrgsData();
        } catch (error) {
            console.log(error);
        }
    };

    const getRoles = async () => {
        try {
            const token = await getAccessTokenSilently();
            const roles = await fetch(`${apiOrigin}/roles`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const responseData = await roles.json();

            setState({
                ...state,
                roles: responseData.data
            });
            sessionStorage.setItem('roles', JSON.stringify(responseData.data))
        } catch (error) {
            console.log(error);
        }
    }

    const getOrgsData = async () => {
        ;

        try {
            const token = await getAccessTokenSilently();
            const invitation = await fetch(`${apiOrigin}/organisation/invites/${sessionStorage.getItem("organisationId")}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const responseData = await invitation.json();

            let rows = [];

            const orgUsers = await fetch(`${apiOrigin}/organisation/${sessionStorage.getItem("organisationId")}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const orgUsersResData = await orgUsers.json();

            for await (const invite of responseData.data) {
                let status = isInvitationExpired(invite.expires_at) ? 'Invitation expired' : (invite.ticket_id ? 'Pending user acceptance' : 'Pending admin approval');
                rows.push({
                    id: invite.id,
                    status: status,
                    created_by: invite.inviter.name,
                    email: invite.invitee.email,
                    created_at: invite.created_at,
                    action: (status === 'Invitation expired' || status === 'Pending user acceptance') ? 'Revoke Invitation' : 'Approve Invitation'
                });
            }

            for await (const user of orgUsersResData.data) {
                //TODO: Need to call user endpoints to get metadata
                const userData = await fetch(`${apiOrigin}/user/${user.user_id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                const userDataResData = await userData.json();
                if (!userDataResData.data.app_metadata?.adminApproved) {
                    rows.push({
                        id: user.user_id,
                        status: 'Pending admin approval',
                        created_by: 'N/A',
                        email: user.email,
                        created_at: userDataResData.data.created_at,
                        action: 'Approve Invitation'
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


    const isInvitationExpired = (expiryTime) => {
        let currentTimeUnix = new Date().getTime();
        let expiryTimeUnix = new Date(expiryTime).getTime();

        return (currentTimeUnix > expiryTimeUnix);
    }

    const revokeInvitation = async (userID) => {
        try {
            const token = await getAccessTokenSilently();
            const invitation = await fetch(`${apiOrigin}/organisations/invite`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    organisationId: sessionStorage.getItem("organisationId"),
                    inviteId: userID
                })
            });
            const responseData = await invitation.json();

            getOrgsData();
        } catch (error) {
            setState({
                ...state,
                error: error.error,
            });
        }
    }

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
                    data: {
                        app_metadata: { adminApproved: true }
                    }
                })
            });
            const updateResData = await updateUser.json();

            getOrgsData();
        } catch (error) {
            setState({
                ...state,
                error: error.error,
            });
        }
    }

    useEffect(() => {
        getOrgsData();
        getRoles()
    }, [getAccessTokenSilently]);

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
                        if (params.row.action === 'Approve Invitation') {
                            approveInvitation(params.row.id);
                        } else {
                            revokeInvitation(params.row.id);
                        }
                    }}
                >
                    {params.row.action}
                </Button>
            </strong>
        )
    }

    const columns = [
        { field: 'id', headerName: 'ID', width: 200 },
        { field: 'email', headerName: 'Email', width: 250 },
        { field: 'status', headerName: 'Status', width: 200 },
        { field: 'created_at', headerName: 'Created At', width: 200 },
        { field: 'created_by', headerName: 'Created By', width: 200 },
        { field: 'action', headerName: 'Action', width: 200, renderCell: renderActionButton, disableClickEventBubbling: true }
    ];

    return (
        <div className="ml-5 mr-5 mb-5" style={{ height: '100%' }}>
            <div className="mb-5">
                <Box
                    onSubmit={handleSubmit}
                    component="form"
                    sx={{
                        '& .MuiTextField-root': { m: 1, width: '25ch' },
                    }}
                    noValidate
                    autoComplete="off"
                >
                    <h3 className="m-4">Invite a user to join the {organisation} organisation</h3>
                    <div>
                        <TextField
                            name="fname"
                            label="First Name"
                            size="small"
                            type="text"
                            value={formValues.fname}
                            onChange={handleInputChange}
                        />
                        <TextField
                            name="lname"
                            label="Last Name"
                            size="small"
                            type="text"
                            value={formValues.lname}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <TextField
                            name="email"
                            label="Email"
                            size="small"
                            type="email"
                            value={formValues.email}
                            onChange={handleInputChange}
                        />
                        <TextField
                            name="org"
                            label="Organisation ID"
                            size="small"
                            type="text"
                            value={formValues.organisationId}
                            disabled
                        />
                    </div>

                    <InputLabel id="demo-multiple-role-label">Roles</InputLabel>
                    <Select
                        multiple
                        label="Select roles ..."

                        labelId="demo-multiple-role-label"
                        onChange={handleSelectChange}
                        value={InviteRole}
                        name="role"
                        MenuProps={MenuProps}>
                        {JSON.parse(sessionStorage.getItem('roles')).map((role, i) => <MenuItem key={i} value={role.id}> {role.name}</MenuItem>)}
                    </Select>
                    <div>
                    </div>
                    <Button disabled={!formValues.fname && !formValues.lname && !formValues.email && !formValues.email} className="mt-4" variant="contained" color="primary" type="submit">
                        Submit
                    </Button>
                </Box>
            </div>
            {!state.showResult &&
                <Box sx={{ display: 'flex' }}>
                    <CircularProgress />
                </Box>
            }
            {state.showResult &&
                <h3 className="m-4">Invitations</h3>
            }
            {state.showResult && (
                <DataGrid
                    rows={state.apiData}
                    columns={columns}
                    pageSize={5}
                    getCellClassName={(params) => {
                        if (params.field !== 'status' || params.value == null) {
                            return '';
                        }

                        if (params.value === 'Invitation expired') {
                            return 'status-red';
                        } else if (params.value === 'Pending admin approval') {
                            return 'status-green';
                        } else {
                            return 'status-amber';
                        }

                    }} />

            )}
        </div>
    );
}

export default withAuthenticationRequired(OrganisationsInvitation, {
    onRedirecting: () => <Loading />,
});