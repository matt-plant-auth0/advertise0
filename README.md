# advertise0
B2B Okta CIC Demo - built using the Auth0 React Quickstart demo

# installation
Standard `npm install` to grab packages

This does rely on a `./src/auth_config.json` file that holds all tenant info - this should be in the format as follows:

```json
{
  "domain": "AUTH0 TENANT DOMAIN",
  "clientId": "REACT_APP_CLIENT_ID",
  "audience": "advertise0-permissions",
  "m2m_clientId": "MANAGEMENT_API_APP_CLIENT_ID",
  "m2m_secret": "MANAGEMENT_API_APP_CLIENT_SECRET",
  "appOrigin": "https://local.a0.gg"
}
```

Note: `appOrigin` property is used to create relative URLs in the React APP

As you can see the tenant does require some setup (not least due to some Actions also being required to facilitate the React app) - as such I have exported my tenant using the Deploy CLI into the `tenant` folder (using the `-f directory` CLI flag to export the tenant config as `.json` files) which can be imported as is. More details on the Deploy CLI tool can be found here:  https://github.com/auth0/auth0-deploy-cli#documentation