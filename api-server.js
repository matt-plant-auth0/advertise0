const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const bodyParser = require('body-parser');
const authConfig = require("./src/auth_config.json");
const https = require('https');
const fs = require('fs');

// Routes
const _m2m = require('./api/m2m_token');
const _orgs = require('./api/orgs');
const _users = require('./api/users');

const app = express();

const port = process.env.API_PORT || 3001;
const appPort = process.env.SERVER_PORT || 3000;
const appOrigin = `${authConfig.appOrigin}:${appPort}` || `http://localhost:${appPort}`;

if (
  !authConfig.domain ||
  !authConfig.audience ||
  authConfig.audience === "YOUR_API_IDENTIFIER"
) {
  console.log(
    "Exiting: Please make sure that auth_config.json is in place and populated with valid domain and audience values"
  );

  process.exit();
}

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: appOrigin }));
app.use(bodyParser.json({
    limit: '50mb',
    extended: true
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));

const allowed = [
    '.js',
    '.css',
    '.png',
    '.jpg'
];

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ["RS256"],
});

app.get("/api/external", checkJwt, (req, res) => {
  res.send({
    msg: "Your access token was successfully validated!",
  });
});

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
      res.status(401).send({
          error: err.message
      });
  }
});

// Default route
app.all('/', async (req, res) => {
  res.send({
      online: true
  });
});

// Auth0 Token
app.get('/token', _m2m.accessToken);

// Users
app.post('/create/user', _users.createUser);
app.get('/users', _users.getUsers);
app.get('/user/organisations', _users.getUserOrganizations);
app.get('/user/:id', _users.getUser);
app.post('/password/:id', _users.changePassword);
app.patch('/update/user', _users.updateUser);
app.delete('/delete/user', _users.deleteUser);
app.get('/roles', _users.getRoles);

//Organisation endpoints
app.post('/organisation/user', _orgs.assignUserToOrganization);
app.post('/organisations', _orgs.createOrganisation);
app.post('/organisation/add_connections', _orgs.assignConnectionsToOrganisation);
app.get('/organisation/:id', _orgs.getMembersOfOrganisation);
app.get('/organisations', _orgs.getOrganisations);
app.post('/organisations/invite', _orgs.inviteUserToOrg);
app.get('/organisation/invites/:id',_orgs.invitesToOrg);
app.delete('/organisations/invite', _orgs.revokeInviteToOrg);

// https.createServer({
//   // key: fs.readFileSync('privkey1.pem'),
//   // cert: fs.readFileSync('cert1.pem')
// }, app).listen(port, () => console.log(`API Server listening on port ${port}`));

const server = app.listen(port, (error) => {
  if (error) return console.log(`Error: ${error}`);
console.log(`Server listening on port ${server.address().port}`);
});