import React from "react";
import logo from "../../img/logo.svg";

var TopBar = () => {
    return (
        <div className="app-header">
            <div className="logo"><img src={logo} alt="Logo" height="90" /></div>
        </div>
    );
}

export default TopBar;