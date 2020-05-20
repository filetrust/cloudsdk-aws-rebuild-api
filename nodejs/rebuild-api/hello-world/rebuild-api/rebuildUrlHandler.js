const fetch = require("node-fetch");
const form_data = require("form-data");

const EngineService = require('./engineService');
const Metric = require('./metric');
const Enum = require("./enumHelper");
const FileType = require("./fileType");
const EngineOutcome = require("./engineOutcome");
const ContentManagementFlags = require("./contentManagementFlags");
const Timer = require("./timer");

const handleUrlRequest = async (event, context) => {
    const engineLoadTimer = Timer.StartNew();
    let engineService = new EngineService();
    const engineLoadTime = engineLoadTimer.Elapsed();

    const timer = Timer.StartNew();

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
            [Metric.FileType]: Metric.DefaultValue,
            [Metric.EngineLoadTime]: Metric.DefaultValue
        },
        body: '{ "errorMessage": "this should not be here" }'
    };

    response.headers[Metric.EngineLoadTime] = engineLoadTime;

    try {
        const version = engineService.GetLibraryVersion();
        response.headers[Metric.Version] = version;

        const { errorMessage, errors, payload } = validateEvent(event);

        if (!payload) {
            response.statusCode = 400;
            response.body = JSON.stringify({ errorMessage, errors });
            return response;
        }

        let fileBuffer;

        try {
            timer.Restart();
            fileBuffer = await downloadFile(payload.InputGetUrl);
            response.headers[Metric.DownloadTime] = timer.Elapsed();
            response.headers[Metric.FileSize] = fileBuffer.length;
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

        timer.Restart();
        const fileType = engineService.GetFileType(fileBuffer);
        response.headers[Metric.DetectFileTypeTime] = timer.Elapsed();
        response.headers[Metric.FileType] = fileType.fileTypeName;

        if (fileType.fileTypeName === Enum.GetString(FileType, FileType.Unknown)) {
            response.statusCode = 422;
            response.body = JSON.stringify({
                errorMessage: "File could not be determined to be a supported file"
            });
            return response;
        }

        let contentManagementFlags = new ContentManagementFlags();

        if (payload.ContentManagementFlags)
            Object.assign(contentManagementFlags, payload.ContentManagementFlags);

        engineService.SetConfiguration(contentManagementFlags);

        timer.Restart();
        const protectedFileResponse = engineService.Rebuild(fileBuffer, fileType.fileTypeName);
        response.headers[Metric.RebuildTime] = timer.Elapsed();

        if (!protectedFileResponse || protectedFileResponse.engineOutcome !== EngineOutcome.Success) {
            if (response.errorMessage && response.errorMessage.toLowerCase().includes("disallow")) {
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

        timer.Restart();
        const etag = await uploadFile(payload.OutputPutUrl, protectedFileResponse.protectedFile);
        response.headers[Metric.UploadTime] = timer.Elapsed();
        response.headers[Metric.UploadEtag] = etag;

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
        engineService.Finalise();
        engineService = null;
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

            return response.headers.get("etag");
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

    if (errors.length) {
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