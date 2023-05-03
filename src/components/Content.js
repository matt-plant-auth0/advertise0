import React, { Component } from "react";

import body from "./../assets/body.png"

import { Row, Col } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import contentData from "../utils/contentData";

class Content extends Component {
  render() {
    return (
      <img src={body} width="100%"></img>
    );
  }
}

export default Content;
