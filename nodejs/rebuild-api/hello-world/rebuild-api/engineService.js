const Enum = require("./enumHelper");
const FileType = require("./fileType.js");
const EngineOutcome = require("./engineOutcome");
const EngineWrapper = require("./engineWrapper/engineWrapper");

/**
 * This class contains business logic around the engine as an API. Internally it uses a thin wrapper around the engine engineWrapper.js.
 */
class EngineService {
    EngineWrapper;

    constructor() {
        this.EngineWrapper = new EngineWrapper(__dirname + (process.platform == 'win32' ?
            "\\lib\\windows\\SDK\\glasswall.classic.dll"
            : "/lib/linux/SDK/libglasswall.classic.so"));
    }

    Finalise() {
        this.EngineWrapper.Finalise();
        this.EngineWrapper = null;
    }

    GetLibraryVersion() {
        try {
            return this.EngineWrapper.GWFileVersion();
        }
        catch (err) {
            console.log(err)
            return "Error Retrieving";
        }
    }

    GetFileType(buffer) {
        if (!buffer) throw "Buffer was not defined";

        try {
            const fileType = this.EngineWrapper.GWDetermineFileTypeFromFileInMem(buffer, buffer.length);
            const fileTypeName = Enum.GetString(FileType, fileType)

            console.log("File Type: '" + fileType + "' - '" + fileTypeName + "'");

            return {
                fileType,
                fileTypeName
            };
        }
        catch (err) {
            console.log("Error, defaulting to Unknown. Error: " + err.toString());
        }
        finally {
            buffer = null;
        }

        return {
            fileType: FileType.Unknown,
            fileTypeName: Enum.GetString(FileType, FileType.Unknown)
        };
    }

    SetConfiguration(contentManagementFlags) {
        try {
            const xmlConfig = contentManagementFlags.Adapt();
            const engineOutcome = this.EngineWrapper.GWFileConfigXML(xmlConfig);
            const engineOutcomeName = Enum.GetString(EngineOutcome, engineOutcome);

            if (engineOutcome != EngineOutcome.Success) {
                var error = this.GWFileErrorMsg();
                throw `Could not set Engine Configuration, status: ${engineOutcomeName} error: ${error}`;
            }

            console.log("Successfully set configuration");

            return {
                engineOutcome,
                engineOutcomeName
            };
        }
        catch (err) {
            console.log("Could not set engine config, inner error " + err);
            throw err;
        }
    }

    Rebuild(buffer, fileType) {
        if (!buffer) throw "Buffer was not defined";

        try {
            const { engineOutcome, protectedFile } =
                this.EngineWrapper.GWMemoryToMemoryProtect(
                    buffer,
                    fileType);

            const engineOutcomeName = Enum.GetString(EngineOutcome, engineOutcome);

            if (engineOutcome != EngineOutcome.Success) {
                const errorMessage = this.GWFileErrorMsg();

                console.log("Unable to protect file: " + errorMessage);

                return {
                    errorMessage,
                    engineOutcome,
                    engineOutcomeName,
                    protectedFile,
                    protectedFileLength: 0
                };
            }
            else {
                console.log("Successfully rebuilt file.");

                return {
                    errorMessage: "",
                    engineOutcome,
                    engineOutcomeName,
                    protectedFile,
                    protectedFileLength: protectedFile.length,
                };
            }
        }
        catch (err) {
            console.log("Error rebuilding file: " + err.toString());
            throw err;
        }
        finally {
            buffer = null;
            fileType = null;
        }
    }

    GetErrorMessage() {
        try {
            return this.EngineWrapper.GWFileErrorMsg();
        }
        catch (err) {
            console.log("Error getting Error from engine: " + err);
            throw err;
        }
    }
}

module.exports = EngineService;