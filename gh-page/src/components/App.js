import React from "react";

import "../App.css";
import SwaggerPage from "./swagger/SwaggerPage.js";

import {
    HashRouter as Router,
    Route,
    Switch
} from "react-router-dom";

var App = () => {
  return <Router basename='/'>
    <Switch>
      <Route><SwaggerPage /></Route>
    </Switch>
  </Router>;
}

export default App;