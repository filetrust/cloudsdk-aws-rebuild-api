import React from 'react';
import { NavLink } from "react-router-dom";

var TopBarNavigation = () => {
    return (
    <ul className="nav-list">
        <li><NavLink className="nav-button nav-button-swag" to="/" tabIndex="1" ></NavLink></li>
        <li><NavLink className="nav-button nav-button-drop" to="drop" tabIndex="1" ></NavLink></li>
    </ul>);
}

export default TopBarNavigation;