import React, { useEffect, useState } from "react";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../components/Loading";
import { getConfig } from "../config";
import jwt_decode from "jwt-decode";

import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';

const ListOfOrganisations = () => {

    const {
        getAccessTokenSilently,
        loginWithPopup,
        loginWithRedirect,
        getAccessTokenWithPopup,
    } = useAuth0();

    const [state, setState] = useState({
        organisations: [],
        error: null,
    });

    useEffect(() => {
        const getPermissionsData = async () => {
            try {
                const token = await getAccessTokenSilently();
                const access_token = jwt_decode(token);
                console.log(access_token)
                const organisations = access_token["https://advertise0.com/organisations"];
                if (organisations.length === 1) { window.location.href = "/" }
                console.log(organisations);
                setState({
                    ...state,
                    organisations: organisations
                });
            } catch (error) {
                setState({
                    ...state,
                    error: error.error,
                });
            }
        };
        getPermissionsData();
    }, [getAccessTokenSilently]);

    return (<>
        {state?.organisations && state?.organisations.length == 0 && <> As an Ocado admin you are not an admin for any Suppliers </>}
        {state.organisations.map(organisation => (
            <List sx={{ width: '500', margin: '2em 42% 0', height: "100px", textAlign: 'center' }} >
                <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                        {organisation.branding.logo_url && (<Avatar sx={{ width: 50, height: 50 }} src={organisation.branding.logo_url} variant="square"></Avatar>)}
                        {!organisation.branding.logo_url && (<Avatar sx={{ bgcolor: organisation.branding.colors.primary }}>{organisation.display_name.slice(0, 2).toUpperCase()}</Avatar>)}
                    </ListItemAvatar>
                    <ListItemText
                        primary={organisation.display_name}
                        secondary={
                            <React.Fragment>
                                <Typography
                                    sx={{ display: 'inline' }}
                                    component="span"
                                    variant="body2"
                                    color="text.primary"
                                >
                                    <a href="javascript:;" onClick={() => loginWithRedirect({ 
                                        organization: organisation.id, 
                                        // redirectUri: 'https://local.a0.gg:3000/'
                                     })}>Sign In</a>
                                </Typography>
                            </React.Fragment>
                        }
                    />
                </ListItem>
            </List >
        ))
        } </>
    );
};

export default ListOfOrganisations;