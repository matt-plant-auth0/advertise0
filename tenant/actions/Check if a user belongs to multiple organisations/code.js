/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
exports.onExecutePostLogin = async (event, api) => {
  const ManagementClient = require('auth0').ManagementClient;

    const management = new ManagementClient({
      // domain: 'advertise0.eu.auth0.com',
      domain: 'adhoc0.dwayne.fun',
		  clientId: 'MANAGEMENT_API_APP_CLIENT_ID',
		  clientSecret: 'MANAGEMENT_API_APP_CLIENT_SECRET'
    });

    let organisations = [];

    const getOrgs = () => {
      return new Promise(function(resolve, reject) {
        management.users.getUserOrganizations({ id: event.user.user_id }, (err, orgs) => {
          if (err) {
            console.log(err);
          }
          resolve(orgs);
        });
      });
    };

    // Return all the organisations the user belongs to
    organisations = await getOrgs();

    api.accessToken.setCustomClaim("https://advertise0.com/current_organisation", event.organization);
    api.accessToken.setCustomClaim("https://advertise0.com/organisations", organisations);
};


/**
* Handler that will be invoked when this action is resuming after an external redirect. If your
* onExecutePostLogin function does not perform a redirect, this function can be safely ignored.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
// exports.onContinuePostLogin = async (event, api) => {
// };
