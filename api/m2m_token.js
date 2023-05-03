const NodeCache = require( "node-cache" );
const fetch = require("node-fetch");
const authConfig = require("./../src/auth_config.json");

const node_cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

const token = async () => {
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    return new Promise((resolve, reject) => {
        const auth0 = {
            grant_type: 'client_credentials',
            client_id: authConfig.m2m_clientId,
            client_secret: authConfig.m2m_secret,
            audience: `https://${authConfig.domain}/api/v2/`
        }

        options.body = JSON.stringify(auth0);

        fetch(`https://${authConfig.domain}/oauth/token`, options).then(res => res.json()).then(e => {
            if (e.error || e.statusCode && e.statusCode !== 200) {
                resolve({
                    error: true,
                    step: 1,
                    data: e,
                    message: e.message ? e.message : e.description
                });
            } else {
                resolve(e.access_token);
            }
        });
    });
}

const getToken = async () => {
    return new Promise(async (resolve, reject) => {
        const access_token = node_cache.get( "access_token");
        if (access_token == undefined) {
            const m2m_token = await token();
            node_cache.set( "access_token", m2m_token, 86400);
            resolve(m2m_token);
        } else {
            resolve(access_token);
        }
    });
};

const accessToken = async (req, res) => {
    const token = await getToken();
    res.send({
        access_token: token
    });
};

module.exports = {
    accessToken,
    getToken
};