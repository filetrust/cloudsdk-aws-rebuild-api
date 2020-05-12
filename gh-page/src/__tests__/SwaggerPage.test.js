import React from "react";
import Enzyme, {shallow} from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import SwaggerPage from "../components/swagger/SwaggerPage.js";
import TopBar from "../components/shared/TopBar.js";
import SwaggerUI from "swagger-ui-react";
import yam from "../components/swagger/api.yaml"
import Base64Injector from "../components/swagger/Base64Injector.js";

Enzyme.configure({adapter: new Adapter()});

describe("SwaggerPage", () => {
  it("renders without crashing", () => {
    const wrapper = shallow(<SwaggerPage />);
    expect(wrapper.exists()).toBe(true);
  });

  it("matches snapshot", () => {
    const wrapper = shallow(<SwaggerPage />);
    expect(wrapper).toMatchSnapshot();
  });
  
  it("renders topbar", () => {
    const wrapper = shallow(<SwaggerPage />);
    expect(wrapper.contains(<TopBar/>))
  });

  it("renders swagger", () => {
    const wrapper = shallow(<SwaggerPage />);
    expect(wrapper.find('SwaggerUI')).toBeDefined()
  });
  
  it("renders swagger with correct yaml", () => {
    const wrapper = shallow(<SwaggerPage />);
    expect(wrapper.find('SwaggerUI').prop("url")).toBe(window.location.origin + yam)
  });
  
  it("renders swagger with docexpansion equalto list", () => {
    const wrapper = shallow(<SwaggerPage />);
    expect(wrapper.find('SwaggerUI').prop("docExpansion")).toBe("list")
  });
  
  it("renders swagger with defaultModelExpandDepth equalto 1", () => {
    const wrapper = shallow(<SwaggerPage />);
    expect(wrapper.find('SwaggerUI').prop("defaultModelExpandDepth")).toBe(1)
  });
  
  it("renders swagger with base64 requestInterceptor", () => {
    const wrapper = shallow(<SwaggerPage />);
    expect(wrapper.find('SwaggerUI').prop("requestInterceptor")).toBe(Base64Injector.TryInjectSelectedFileAsBase64)
  });
});