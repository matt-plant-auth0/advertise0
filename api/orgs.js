const fetch = require("node-fetch");
const _m2m = require('./m2m_token');
const authConfig = require("./../src/auth_config.json");

const request = async (url, method, body) => {
    const token = await _m2m.getToken();
    console.log ('m2 token' , token)
    let options = {
        method,
        headers: {
            ...(method !== 'GET' || method !== 'DELETE') && { 'Content-Type': 'application/json' },
            'Authorization': `Bearer ${token}`
        },
        ...body && { body: JSON.stringify(body) }
    };
    return new Promise((resolve) => {
        fetch(url, options).then(async res => {
            let e;
            if (res.headers.get('content-type').includes('json') && method !== 'DELETE') {
                e = await res.json();
            } else {
                e = {};
            }

            if (e.error || e.statusCode && e.statusCode !== 200) {
                resolve({
                    _error: true,
                    ...e
                });
            } else {
                resolve({
                    _success: true,
                    data: e
                });
            }
        });
    });
};

// Get Orgs Data
const getMembersOfOrganisation = async (req, res) => {
    const data = await request(`https://${authConfig.domain}/api/v2/organizations/${req.params.id}/members`, 'GET', {
        header: {
            ...req.headers 
        }
    });
    res.send(data);
}

const getOrganisations = async (req, res) => {
    const data = await request(`https://${authConfig.domain}/api/v2/organizations`, 'GET', null);
    res.send(data);
}

// Add Orgs Data
const createOrganisation = async (req, res) => {
    const data = await request(`https://${authConfig.domain}/api/v2/organizations`, 'POST', null);
    res.send(data);
};

const assignConnectionsToOrganisation = async (req, res) => {
    const db = await request(`https://${authConfig.domain}/api/v2/organizations/${req.body.org_id}/enabled_connections`, 'POST', {
        connection_id: "con_4pCtFSlyUiifPu1M",
        assign_membership_on_login: true
    });

    if (Staff && Residents && Family) {
        res.send({
            _success: true,
            data: db
        });
    } else {
        res.send({
            _error: true,
            message: db
        });
    }
};

const inviteUserToOrg = async (req, res) => {
    console.log(req.body);
    const data = await request(`https://${authConfig.domain}/api/v2/organizations/${req.body.organisationId}/invitations`, 
    'POST', {
        "inviter": {
          "name": req.body.inviter
        },
        "invitee": {
          "email": req.body.invitee.email
        },
        "user_metadata": {
            fname: req.body.fname,
            lname: req.body.lname
        },
        "app_metadata": {
            adminApproved: req.body.inviter === 'Steris Admins' ? true: false
        },
        "ttl_sec": 30,
        "client_id": authConfig.clientId,
        "send_invitation_email": true
    });
    res.send(data);
};

const invitesToOrg = async (req, res) => {
    console.log(req.body);
    const data = await request(`https://${authConfig.domain}/api/v2/organizations/${req.params.id}/invitations`, 
    'GET', null);
    res.send(data);
};

const assignUserToOrganization = async (req, res) => {
    let members = [];
    if (req?.body?.user_id) {
        members.push(req.body.user_id);
    } else {
        members = req.body.ids;
    }
    
    const data = await request(`https://${authConfig.domain}/api/v2/organizations/${req.body.app_metadata.orgID}/members`, 
    'POST',
    { 
        members
    });
    res.send(data);
};

const revokeInviteToOrg = async (req, res) => {
    console.log(req.body);
    const data = await request(`https://${authConfig.domain}/api/v2/organizations/${req.body.organisationId}/invitations/${req.body.inviteId}`, 
    'DELETE', null);
    res.send(data);
}

module.exports = {
    createOrganisation,
    assignConnectionsToOrganisation,
    inviteUserToOrg,
    invitesToOrg,
    getMembersOfOrganisation,
    getOrganisations,
    assignUserToOrganization,
    revokeInviteToOrg
};