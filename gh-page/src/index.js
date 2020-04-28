import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import "./App.css";
import SwaggerPage from "./components/swagger/SwaggerPage";

import {
    HashRouter as Router,
    Route,
    Switch
} from "react-router-dom";

var Root = () => {
  return (
  <Router basename='/'>
    <Switch>
      <Route><SwaggerPage /></Route>
    </Switch>
  </Router>);
}

ReactDOM.render(<Root />, document.getElementById("root"));
