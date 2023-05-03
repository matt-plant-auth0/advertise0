import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import { Container } from "reactstrap";

import Loading from "./components/Loading";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./views/Home";
import Callback from "./views/ListOfOrganisations";
import Profile from "./views/Profile";
import ExternalApi from "./views/ExternalApi";
import Organisations from "./views/Organisations";
import AllUsers from "./views/AllUsers";
import Users from "./views/Users";
import Organisation from "./views/Organisation";
import OrganisationsInvitation from "./views/Invitation";
import User from "./views/User";
import { useAuth0 } from "@auth0/auth0-react";
import history from "./utils/history";
import Login from "./views/Login";

// styles
import "./App.css";

// fontawesome
import initFontAwesome from "./utils/initFontAwesome";
initFontAwesome();

const App = () => {
  const { isLoading, error } = useAuth0();

  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router history={history}>
      <div id="app" className="d-flex flex-column h-100">
        <NavBar />
        <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/orgs-list" component={Callback} />
            <Route path="/profile" component={Profile} />
            <Route path="/external-api" component={ExternalApi} />
            <Route path="/organisations" component={Organisations} />
            <Route path="/users" component={AllUsers} />
            <Route path="/user/:id" component={User} />
            <Route path="/org-users" component={Users} />
            <Route path="/organisation/:id" component={Organisation} />
            <Route path="/invite" component={OrganisationsInvitation} />
            <Route path="/login" component={Login} />
        </Switch>
      </div>
    </Router>
  );
};

export default App;
