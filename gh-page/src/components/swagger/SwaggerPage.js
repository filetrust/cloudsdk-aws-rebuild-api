import React, { useEffect } from "react";
import yam from "./api.yaml";
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"
import TopBar from "../shared/TopBar.js";

var SwaggerPage = () => {
    useEffect(() => {
        setTimeout(() => {
            document.getElementsByClassName("opblock-summary")[0].addEventListener("click", function (event) {
                setTimeout(() => {
                    var button = document.querySelector(".try-out button");

                    if (button !== null) {
                        if (!button.classList.contains("cancel")) {
                            button.click();
                        }

                        setTimeout(() => {
                            const el = document.getElementsByClassName("opblock-description-wrapper")[1];
                            let input = document.createElement("input");
                            let label = document.createElement("label");
                            label.textContent = "Select a file to automatically convert to base64 and use or form the request body below.";
                            input.id = "base64Input"
                            input.type = "file";
                            el.prepend(input, label);
                        }, 100);
                    }
                }, 300);
            });
        }, 500);
    }, []);

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
    const input = document.getElementById("base64Input");

    if (!input || !input.value || input.value === "") {
        return request;
    }

    const fileBuffer = await _readInputFileBuffer(input.files[0])
    const fileBase64 = _arrayBufferToBase64(fileBuffer);
    const fileName = input.files[0].name;

    request.body = `{\r\n\t"Base64": "${fileBase64}","FileName":"${fileName}"\r\n}`
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
