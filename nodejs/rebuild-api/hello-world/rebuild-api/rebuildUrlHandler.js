const fetch = require("node-fetch");
const form_data = require("form-data");

const Engine = require('./engine');
const Metric = require('./metric');
const Enum = require("./enumHelper");
const FileType = require("./fileType");
const EngineOutcome = require("./engineOutcome");
const ContentManagementFlags = require("./contentManagementFlags");

const handleUrlRequest = async (event, context) => {
    let response = {
        statusCode: 400,
        headers: {
            [Metric.DetectFileTypeTime]: Metric.DefaultValue,
            [Metric.Base64DecodeTime]: Metric.DefaultValue,
            [Metric.FileSize]: Metric.DefaultValue,
            [Metric.DownloadTime]: Metric.DefaultValue,
            [Metric.Version]: Metric.DefaultValue,
            [Metric.RebuildTime]: Metric.DefaultValue,
            [Metric.FormFileReadTime]: Metric.DefaultValue,
            [Metric.UploadSize]: Metric.DefaultValue,
            [Metric.UploadTime]: Metric.DefaultValue,
            [Metric.UploadEtag]: Metric.DefaultValue,
            [Metric.FileType]: Metric.DefaultValue
        },
        body: '{ "errorMessage": "this should not be here" }'
    };

    const engine = new Engine();

    try {
        const version = engine.GetLibraryVersion();
        response.headers[Metric.Version] = version;

        const { errorMessage, errors, payload } = validateEvent(event);

        if (!payload)
        {
            response.statusCode = 400;
            response.body = JSON.stringify({errorMessage, errors});
            return response;
        }

        let cmp = payload.ContentManagementFlags;
        let defaultPolicy = new ContentManagementFlags();
        Object.assign(defaultPolicy, cmp);

        let fileBuffer;
        
        try {
            fileBuffer = await downloadFile(payload.InputGetUrl);
            response.headers[Metric.FileSize] = fileBuffer.length;
            console.log("Input file length: '" + fileBuffer.length + "'");
        }
        catch (err) {
            console.log(err);
            response.statusCode = 400;
            response.body = JSON.stringify({
                errorMessage: "Could not download input file."
            });
            return response;
        }

        if (fileBuffer.length === 0) {
            response.statusCode = 400;
            response.body = JSON.stringify({
                message: "File did not contain any data."
            });
            return response;
        }

        const fileType = engine.DetermineFileType(fileBuffer);

        response.headers[Metric.FileType] = fileType.fileTypeName;

        if (fileType.fileTypeName === Enum.GetString(FileType, FileType.Unknown)) {
            response.statusCode = 422;
            response.body = JSON.stringify({
                errorMessage: "File could not be determined to be a supported file"
            });
            return response;
        }

        engine.SetConfiguration();

        const protectedFileResponse = engine.GWMemoryToMemoryProtect(fileBuffer, fileType.fileTypeName);

        if (!protectedFileResponse || protectedFileResponse.engineOutcome !== EngineOutcome.Success) {
            if (response.errorMessage.toLowerCase().includes("disallow")) {
                response.statusCode = 200;
            }
            else {
                response.statusCode = 422;
            }

            response.body = JSON.stringify({
                errorMessage: "File could not be determined to be a supported file",
                engineOutcome: protectedFileResponse.engineOutcome,
                engineOutcomeName: protectedFileResponse.engineOutcomeName,
                engineError: protectedFileResponse.errorMessage
            });

            return response;
        }

        response.headers[Metric.UploadSize] = protectedFileResponse.protectedFile.length;
        console.log("Output file length: '" + protectedFileResponse.protectedFile.length + "'");
        await uploadFile(payload.OutputPutUrl, protectedFileResponse.protectedFile);
        response.statusCode = 200;
        response.body = "";
    }
    catch (err) {
        console.log(err);

        response.statusCode = 500;
        response.body = JSON.stringify({
            errorMessage: err.message
        });

        return response;
    }
    finally {
        engine.GWFileDone();
        engine.Close();
    }

    return response;
}


const downloadFile = (fileUrl) => {
    const options = {
        method: "GET"
    };

    return fetch(fileUrl, options)
        .then((response) => {
            if (!response.ok)
                throw rersponse.statusText;

            return response.buffer();
        });
}

const uploadFile = (fileUrl, buf) => {
    const options = {
        method: "PUT",
        body: buf
    };

    return fetch(fileUrl, options)
        .then(response => {
            if (!response.ok)
                throw response.statusText;
        });
}


const validateEvent = (event) => {
    let payload;

    try {
        payload = JSON.parse(event.body);
    }
    catch (err) {
        return { errorMessage: "The request was not a valid JSON." };
    }

    let errors = [];

    if (!payload) {
        errors.push({ Body: "Not Supplied" });
        return {
            errorMessage: "Request was not supplied",
            errors
        };
    }

    if (!payload.InputGetUrl)
        errors.push({ InputGetUrl: "Not Supplied" });

    if (!payload.OutputPutUrl)
        errors.push({ OutputPutUrl: "Not Supplied" });

    if (errors.length)
    {
        return {
            errorMessage: "There were missing options supplied in the body.",
            errors
        };
    }

    return {
        payload
    }
}

module.exports = {
    handleUrlRequest
}