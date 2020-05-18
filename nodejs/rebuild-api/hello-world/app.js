let response;

const Engine = require('./engine.js');
const Metric = require('./metric.js');
const { fileTypes, parse } = require("./fileTypes.js");
const fs = require("fs");


const getFileContents = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, buffer) => {
            if (err) {
                reject(err);
            }

            console.log("File received, size: " + buffer.length)
            resolve(buffer);
        });
    });
}

exports.lambdaHandler = async (event, context) => {
    try {
        let responseHeaders = {
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
        };

        const engine = new Engine();
        const version = engine.GetLibraryVersion();

        responseHeaders[Metric.Version] = version;

        const fileBuffer = await getFileContents("C:\\Users\\seb\\Documents\\Scripts\\testfiles\\deepfried_1585147410647.png");

        responseHeaders[Metric.FileSize] = fileBuffer.length;

        const fileType = engine.DetermineFileType(fileBuffer);

        responseHeaders[Metric.FileType] = fileType.fileTypeName;

        if (fileType.fileTypeName === parse(fileTypes.Unknown)) {
            return {
                'statusCode': 422,
                'body': JSON.stringify({
                    message: "File could not be determined to be a supported file"
                })
            };
        }

        const protectedFileResponse = engine.GWMemoryToMemoryProtect(fileBuffer, fileType.fileTypeName);

        if (!protectedFileResponse || !protectedFileResponse.protectedFile || protectedFile.errorMessage) {
            return {
                'statusCode': 422,
                'body': JSON.stringify({
                    message: protectedFileResponse.errorMessage
                })
            };

        }

        responseHeaders["Content-Type"] = "application/octet-stream";

        this.engine.Close();

        return {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'hello world',
                // location: ret.data.trim()
            }),
            "headers": responseHeaders
        };
    }
    catch (err) {
        console.log(err);
        return {
            'statusCode': 500
        }
    }
};
