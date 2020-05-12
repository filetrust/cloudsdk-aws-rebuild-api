import React from "react";
import ReactDOM from "react-dom";
import {
    HashRouter as Router,
    Route,
    Switch
} from "react-router-dom";

import Enzyme, {shallow} from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import App from "../components/App.js";
import SwaggerPage from "../components/swagger/SwaggerPage.js";

Enzyme.configure({adapter: new Adapter()});

describe("App", () => {
  it("renders without crashing", () => {
    const wrapper = shallow(<App />);
    expect(wrapper.exists()).toBe(true);
  });

  it("matches snapshot", () => {
    const wrapper = shallow(<App />);
    expect(wrapper).toMatchSnapshot();
  });
  
  it("renders router", () => {
    const wrapper = shallow(<App />);
    expect(wrapper.find(<Router/>)).toBeDefined();
  });

  it("renders route", () => {
    const wrapper = shallow(<App />);
    expect(wrapper.find(<Route/>)).toBeDefined();
  });
  
  it("renders switch", () => {
    const wrapper = shallow(<App />);
    expect(wrapper.find(<Switch />)).toBeDefined();
  });

  it("renders swaggerpage", () => {
    const wrapper = shallow(<App />);
    expect(wrapper.find(<SwaggerPage />)).toBeDefined();
  });
});