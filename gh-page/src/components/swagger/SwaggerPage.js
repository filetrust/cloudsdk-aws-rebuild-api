import React, { useEffect } from "react";
import yam from "./api.yaml";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import TopBar from "../shared/TopBar.js";
import Base64Injector from "./Base64Injector.js";
import copy from "copy-to-clipboard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BYTES_PER_MB = 1e6;
const UPLOAD_SIZE_LIMIT = 6 * BYTES_PER_MB;

const SwaggerPage = () => {
    useEffect(() => {
        document.addEventListener("input", async (e) => {
            if (!e || !e.target || !e.target.id) {
                return;
            }

            if (e.target.type === "file") {
                if (!e.target.files || !e.target.files.length) {
                    return;
                }

                if (e.target.files[0].size > UPLOAD_SIZE_LIMIT) {
                    toast.error("The maximum supported request size is 6MB. Please select a smaller file.");
                    return;
                }

                if (e.target.id === "base64Input") {

                    const base64 = await Base64Injector.GetBase64(e.target);
                    if (copy(base64)) {
                        toast.success("Copied " + e.target.files[0].name + " as Base64 to clipboard.");
                    }
                }
            }
        });
    }, []);

    return (
        <>
            <TopBar />
            <SwaggerUI url={window.location.origin + yam}
                docExpansion="list"
                defaultModelExpandDepth={1} />
            <ToastContainer />
        </>);
};

export default SwaggerPage;
