import React from "react";
import yam from "./api.yaml";
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"
import TopBar from "../shared/TopBar.js";
import Base64Injector from "./Base64Injector.js";

var SwaggerPage = () => {
    return (
        <>
            <TopBar />
            <SwaggerUI url={window.location.origin + yam}
                docExpansion="list"
                defaultModelExpandDepth={1}
                requestInterceptor={Base64Injector.TryInjectSelectedFileAsBase64} />
        </>);
}

export default SwaggerPage;
