import React, { useEffect } from "react";
import yam from "./api.yaml";
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"
import TopBar from "../shared/TopBar.js";

var SwaggerPage = () => {
    return (
        <>
            <TopBar />
            <SwaggerUI url={window.location.origin + yam}
                docExpansion="list"
                defaultModelExpandDepth="1"
                requestInterceptor={request => _loadBase64IntoRequestIfSpecified(request)} />
        </>);
}

async function _loadBase64IntoRequestIfSpecified(request) {
    if (!request.url.toLowerCase().includes("base64"))
    {
        return request;
    }

    const input = document.getElementById("base64Input");

    if (!input || !input.value || input.value === "") {
        return request;
    }

    const fileBuffer = await _readInputFileBuffer(input.files[0])
    const fileBase64 = _arrayBufferToBase64(fileBuffer);

    var bodyParsed = JSON.parse(request.body);
    bodyParsed.Base64 = fileBase64;

    request.body = JSON.stringify(bodyParsed);
    return request;
};

async function _readInputFileBuffer(file) {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = error => {
            reject(error);
        }
    });
}

function _arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export default SwaggerPage;
