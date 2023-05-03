import React, { useEffect, useState } from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import jwt_decode from "jwt-decode";

import {
  Collapse,
  Container,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

import { useAuth0 } from "@auth0/auth0-react";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState({
    isAdmin: false,
    isOrgAdmin: false,
    organizations: [],
    current_organisation: ""
  });
  const {
    user,
    isAuthenticated,
    loginWithRedirect,
    getAccessTokenSilently,
    logout,
  } = useAuth0();
  const toggle = () => setIsOpen(!isOpen);

  useEffect(() => {
    const getPermissionsData = async () => {
      try {
        const token = await getAccessTokenSilently();
        const access_token = jwt_decode(token);
        const permissions = access_token?.permissions;
        setState({
          ...state,
          isAdmin: permissions.includes("view:all"),
          isOrgAdmin: permissions.includes("add:users"),
          organizations: access_token["https://advertise0.com/organisations"],
          current_organisation: access_token["https://advertise0.com/current_organisation"]
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

  const logoutWithRedirect = () =>
    logout({
      returnTo: window.location.origin,
    });

    const redirectInvite = () => {
      sessionStorage.setItem("organisationId", state.current_organisation.id);
      console.log(state.current_organisation);
      sessionStorage.setItem("organisation", JSON.stringify(state.current_organisation));
      window.location.href = "/invite";
  }

  return (
    <div className="nav-container">
      <Navbar color="light" light expand="md">
        <Container>
          <NavbarToggler onClick={toggle} />
          <Collapse isOpen={isOpen} navbar>
            <Nav className="mr-auto" navbar>
              <NavItem>
                <NavLink
                  tag={RouterNavLink}
                  to="/"
                  exact
                  activeClassName="router-link-exact-active"
                >
                  Home
                </NavLink>
              </NavItem>
              {isAuthenticated && state.isAdmin && (
                <NavItem>
                  <NavLink
                    tag={RouterNavLink}
                    to="/organisations"
                    exact
                    activeClassName="router-link-exact-active"
                  >
                    All Organisations
                  </NavLink>
                </NavItem>
              )}
              {isAuthenticated && state.isAdmin && (
                <NavItem>
                  <NavLink
                    tag={RouterNavLink}
                    to="/users"
                    exact
                    activeClassName="router-link-exact-active"
                  >
                    All Users
                  </NavLink>
                </NavItem>
              )}
              {isAuthenticated && state.isOrgAdmin && (
                <NavItem>
                  <NavLink
                    tag={RouterNavLink}
                    to="/org-users"
                    exact
                    activeClassName="router-link-exact-active"
                  >
                    Users
                  </NavLink>
                </NavItem>
              )}
              {isAuthenticated && state.isAdmin || isAuthenticated && state.isOrgAdmin && (
                <NavItem>
                  <NavLink
                    tag={RouterNavLink}
                    to="/invite"
                    exact
                    activeClassName="router-link-exact-active"
                    onClick={() => {redirectInvite()}}
                  >
                    Invitations
                  </NavLink>
                </NavItem>
              )}
              {isAuthenticated && state.organizations.length > 1 && (
                <NavItem>
                  <NavLink
                    tag={RouterNavLink}
                    to="/orgs-list"
                    exact
                    activeClassName="router-link-exact-active"
                  >
                    Select Organisation (current: <b>{ state.current_organisation.display_name }</b>)
                  </NavLink>
                </NavItem>
              )}
            </Nav>
            <Nav className="d-none d-md-block" navbar>
              {!isAuthenticated && (
                <NavItem>
                  <Button
                    id="qsLoginBtn"
                    color="primary"
                    className="btn-margin"
                    onClick={() => loginWithRedirect({
                      organization: "org_wqp0oJUwA3N4B502"
                    })}
                  >
                    Log in
                  </Button>
                </NavItem>
              )}
              {isAuthenticated && (
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret id="profileDropDown">
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="nav-user-profile rounded-circle"
                      width="50"
                    />
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem header>{user.name}</DropdownItem>
                    <DropdownItem
                      tag={RouterNavLink}
                      to="/profile"
                      className="dropdown-profile"
                      activeClassName="router-link-exact-active"
                    >
                      <FontAwesomeIcon icon="user" className="mr-3" /> Profile
                    </DropdownItem>
                    <DropdownItem
                      id="qsLogoutBtn"
                      onClick={() => logoutWithRedirect()}
                    >
                      <FontAwesomeIcon icon="power-off" className="mr-3" /> Log
                      out
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              )}
            </Nav>
            {!isAuthenticated && (
              <Nav className="d-md-none" navbar>
                <NavItem>
                  <Button
                    id="qsLoginBtn"
                    color="primary"
                    block
                    onClick={() => loginWithRedirect({
                      organization: "org_wqp0oJUwA3N4B502"
                    })}
                  >
                    Log in
                  </Button>
                </NavItem>
              </Nav>
            )}
            {isAuthenticated && (
              <Nav
                className="d-md-none justify-content-between"
                navbar
                style={{ minHeight: 170 }}
              >
                <NavItem>
                  <span className="user-info">
                    <img
                      src={user.picture}
                      alt="Profile"
                      className="nav-user-profile d-inline-block rounded-circle mr-3"
                      width="50"
                    />
                    <h6 className="d-inline-block">{user.name}</h6>
                  </span>
                </NavItem>
                <NavItem>
                  <FontAwesomeIcon icon="user" className="mr-3" />
                  <RouterNavLink
                    to="/profile"
                    activeClassName="router-link-exact-active"
                  >
                    Profile
                  </RouterNavLink>
                </NavItem>
                <NavItem>
                  <FontAwesomeIcon icon="power-off" className="mr-3" />
                  <RouterNavLink
                    to="#"
                    id="qsLogoutBtn"
                    onClick={() => logoutWithRedirect()}
                  >
                    Log out
                  </RouterNavLink>
                </NavItem>
              </Nav>
            )}
          </Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default NavBar;
