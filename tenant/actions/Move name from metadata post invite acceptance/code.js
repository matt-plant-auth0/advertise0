/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
const auth0Sdk = require("auth0");
exports.onExecutePostLogin = async (event, api) => {
  const ManagementClient = auth0Sdk.ManagementClient;
  
	// This will make an Authentication API call
	const managementClientInstance = new ManagementClient({
		// These come from a machine-to-machine application
		domain: 'advertise0.eu.auth0.com',
		clientId: 'SAL1j9qXb26JkThuobZwPPGdhxHKtglp',
		clientSecret: 'I9qzV7reLe8U_n26Lxr-RnjGcj272eLd0YriIXwv8U7q33kfJUc6ITg1uPbXBjEn',
		scope: "update:users"
	});

  console.log(`Action fired on login number ${event.stats.logins_count}`);

  if(event.user.user_metadata?.fname && event.user.user_metadata?.lname){
    console.log("Updating name from metadata");
    managementClientInstance.updateUser({ 
        id: event.user.user_id 
      }, 
      {
        name: `${event.user.user_metadata?.fname} ${event.user.user_metadata?.lname}`,
        family_name: event.user.user_metadata?.lname,
        given_name: event.user.user_metadata?.fname,
        user_metadata: {}
      },
      (err, user) => {
        if (err) {
          console.log(err);
        }
      }
    );
  }
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
