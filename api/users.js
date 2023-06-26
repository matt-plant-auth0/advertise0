const e = require("express");
const fetch = require("node-fetch");
const _m2m = require('./m2m_token');
const authConfig = require("./../src/auth_config.json");

const request = async (url, method, body) => {
    const token = await _m2m.getToken();
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

// Create User
const createUser = async (req, res) => {
    const data = await request(`https://${authConfig.domain}/api/v2/users`, 'POST', req.body);
    res.send(data);
}

// Get Users Data
const getUsers = async (req, res) => {
    const query = 'include_fields=true&search_engine=v3';
    const data = await request(`https://${authConfig.domain}/api/v2/users?${query}`, 'GET', null);
    res.send(data);
}

// Get User Organizations
const getUserOrganizations = async (req, res) => {
    const data = await request(`https://${authConfig.domain}/api/v2/users/${req.query.id}/organizations`, 'GET', null);
    res.send(data);
}

// Get User Data
const getUser = async (req, res) => {
    const data = await request(`https://${authConfig.domain}/api/v2/users/${req.params.id}`, 'GET', null);
    res.send(data);
}

// Update User Data
const updateUser = async (req, res) => {
    const data = await request(`https://${authConfig.domain}/api/v2/users/${req.body.user_id}`, 'PATCH', req.body.data);
    res.send(data);
}

// Delete
const deleteUser = async (req, res) => {
    const data = await request(`https://${authConfig.domain}/api/v2/users/${req.query.id}`, 'DELETE', null);
    res.send(data);
}

// Get Roles
const getRoles = async (req, res) => {
    const data = await request(`https://${authConfig.domain}/api/v2/roles`, 'GET', null);
    res.send(data);
}

// trigger reset password
const changePassword = async (req, res) => {

    const userInfo = await request(`https://${authConfig.domain}/api/v2/users/${req.params.id}`, 'GET', null);
    // res.send(userInfo);

    let currentIdentity = userInfo.data.identities.filter ((identity, i) => req.params.id.indexOf (identity.user_id) > -1)[0];

    const resetPassword = await request(`https://${authConfig.domain}/dbconnections/change_password`, 'POST', {
        // ! TO DO add client ID
        client_id: '',
        email: userInfo.data.email,
        connection: currentIdentity.connection
    });
    
    res.send({resetPassword, email: userInfo.data.email, connection: currentIdentity.connection});

}

module.exports = {
    createUser,
    getUsers,
    getUserOrganizations,
    getUser,
    updateUser,
    deleteUser,
    changePassword,
    getRoles
};