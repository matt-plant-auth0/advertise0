import React from "react";

import Loading from "../components/Loading";
import { useAuth0 } from "@auth0/auth0-react";

export const LoginComponent = () => {
  const { loginWithRedirect } = useAuth0();
  const url = window.location.href;
  const inviteMatches = url.match(/invitation=([^&]+)/);
  const orgMatches = url.match(/organization=([^&]+)/);
  if (inviteMatches && orgMatches) {
    loginWithRedirect({
      organization: orgMatches[1],
      invitation: inviteMatches[1],
      redirectUri: 'https://local.a0.gg:3000/profile'
    });
  }else if(orgMatches) {
    loginWithRedirect({
      organization: orgMatches[1],
      redirectUri: 'https://local.a0.gg:3000/profile'
    });
  }
  return <Loading />;
};

export default LoginComponent;
