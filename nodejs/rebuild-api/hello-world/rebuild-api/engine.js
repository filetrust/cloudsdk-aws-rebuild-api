const fs = require('fs')
const ref = require('ref-napi');
const ffi = require('ffi-napi');
const ArrayType = require("ref-array-napi");
const Enum = require("./enumHelper");
const FileType = require("./fileType.js");
const EngineOutcome = require("./engineOutcome");
const ContentManagementFlags = require("./contentManagementFlags");
const { wchar_t } = require("./node-ref-napi-custom-types");

const libPath = __dirname + (process.platform == 'win32' ?
    "\\lib\\windows\\SDK\\glasswall.classic.dll"
    : "/lib/linux/SDK/libglasswall.classic.so");

// TODO: need to look at if i need to cleanup the pointers created

/** Exposes the methods found in the DLL, node-ffi-napi is used to load the engine at runtime.
 * ref-napi is used to create 'types' that read the raw data sent to/from the engine
 * pointer types need to be marshalled and js Buffer's are used to represent pointers
 */
class Engine {
    engine;

    constructor() {
        const fileExists = (filePath) => {
            try {
                if (fs.existsSync(filePath))
                    return true;

                return false;
            } catch (err) {
                console.log(err);
                return false;
            }
        }
        
        if (!fileExists(libPath)) {
            console.log(`Can't find '${libPath}'`);
            throw "Cannot find DLL at " + libPath;
        }

        console.log("Found DLL at " + libPath);

        this.engine = ffi.DynamicLibrary(libPath);
    }

    GetEntryPoint = (entryPointName, returnType, paramTypes) => {
        const entryPointPtr = this.engine.get(entryPointName);
        const entryPoint = ffi.ForeignFunction(entryPointPtr, returnType, paramTypes);

        return entryPoint;
    };

    GetLibraryVersion() {
        const entryPoint = this.GetEntryPoint("GWFileVersion", wchar_t, []);

        let version = '';

        try {
            version = entryPoint();
        }
        catch (err) {
            console.log(err)
        }

        console.log("Version: '" + version + "'");

        return version;
    }

    DetermineFileType(buffer) {
        if (!buffer) throw "Buffer was not defined";

        try {
            const entryPoint = this.GetEntryPoint(
                "GWDetermineFileTypeFromFileInMem",
                "int",
                [
                    "pointer",
                    "size_t"
                ]);

            const fileType = entryPoint(buffer, buffer.length);
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

        return {
            fileType: FileType.Unknown,
            fileTypeName: Enum.GetString(FileType, fileTypes.Unknown)
        };
    }

    SetConfiguration(configuration) {
        if (!configuration)
            configuration = new ContentManagementFlags();

        try {
            const xmlConfig = configuration.ToEngineXml();

            const entryPoint = this.GetEntryPoint("GWFileConfigXML", "int", [
                wchar_t
            ]);

            const engineOutcome = entryPoint(xmlConfig);
            const engineOutcomeName = Enum.GetString(EngineOutcome, engineOutcome);

            if (engineOutcome != EngineOutcome.Success) {
                var error = this.GWFileErrorMsg();
                console.log("Could not set Engine Configuration, error: " + error);
            }
            else {
                console.log("Successfully set configuration");
            }

            return {
                engineOutcome,
                engineOutcomeName
            };
        }
        catch (err) {
            console.log(err);
        }
    }

    GWMemoryToMemoryProtect(buffer, fileType) {
        if (!buffer) throw "Buffer was not defined";

        let engineOutcome, engineOutcomeName,
            errorMessage, protectedFileLength,
            protectedFile;

        try {
            let pFile_t = ref.refType(ref.types.void);
            let pFileLength_t = ref.refType(ref.types.size_t);

            let pFilePtr = ref.alloc(pFile_t);
            let pFileLenPtr = ref.alloc(pFileLength_t);

            const entryPoint = this.GetEntryPoint(
                "GWMemoryToMemoryProtect",
                "int",
                [
                    "pointer",
                    "size_t",
                    wchar_t,
                    pFile_t,
                    pFileLength_t
                ]);

            engineOutcome = entryPoint(
                buffer,
                buffer.length,
                fileType,
                pFilePtr,
                pFileLenPtr);

            engineOutcome = engineOutcome;
            engineOutcomeName = Enum.GetString(EngineOutcome, engineOutcome);

            if (engineOutcome != EngineOutcome.Success) {
                errorMessage = this.GWFileErrorMsg();

                console.log("Unable to protect file: " + errorMessage);
            }
            else {
                protectedFileLength = pFileLenPtr.readUInt64LE();
                protectedFile = ref.readPointer(pFilePtr, 0, protectedFileLength);
                console.log("Successfully rebuilt file.");
            }
        }
        catch (err) {
            console.log("Error rebuilding file: " + err.toString());
            throw err;
        }

        return {
            engineOutcome, engineOutcomeName,
            errorMessage, protectedFileLength,
            protectedFile
        };
    }

    GWFileErrorMsg() {
        const entryPoint = this.GetEntryPoint("GWFileErrorMsg", wchar_t, []);

        let errorMessage = '';

        try {
            errorMessage = entryPoint();
        }
        catch (err) {
            console.log(err)
        }

        console.log("Error Message: '" + errorMessage + "'");

        return errorMessage;
    }

    GWFileDone() {
        const donePtr = this.engine.get("GWFileDone");
        const doneEntryPoint = ffi.ForeignFunction(donePtr, "int", []);
        doneEntryPoint();
    }

    Close() {
        this.engine.close();
    }
}

module.exports = Engine;