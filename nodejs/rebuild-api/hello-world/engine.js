const fs = require('fs')
const ref = require('ref-napi');
const ffi = require('ffi-napi');
const Array = require("ref-array-napi");
const { fileTypes, parse } = require("./fileTypes.js")

const libPath = process.platform == 'win32' ?
    "C:\\Users\\seb\\Documents\\Scripts\\lib\\windows\\SDK\\glasswall.classic.dll"
    : "C:\\Users\\seb\\Documents\\Scripts\\lib\\linux\\SDK\\libglasswall.classic.so";

// TODO: need to look at if i need to cleanup the pointers created

class Engine {
    engine;
    
    constructor() {
        if (!fileExists(libPath)) {
            console.log("Can't find dll");
            throw "Cannot find DLL at " + libPath;
        }

        console.log("Found DLL at " + libPath);

        this.engine = ffi.DynamicLibrary(libPath);
    }

    GetLibraryVersion() {
        // Load the engine and entry point
        const entryPointPtr = this.engine.get("GWFileVersion");

        // custom type that maps to wchar_t*
        const wcharString = createCustomUnicodeType();
        const entryPoint = ffi.ForeignFunction(entryPointPtr, wcharString, []);

        // Execute the entry point
        let version = '';
        try {
            version = entryPoint();
        }
        catch (err) {
            console.log(err)
        }
        finally {
            this.GWFileDone();
        }

        console.log("Version: '" + version + "'");

        return version;
    }

    DetermineFileType(buffer) {
        if (!buffer) throw "Buffer was not defined";

        try {
            // Load the engine and entry point
            const entryPointPtr = this.engine.get("GWDetermineFileTypeFromFileInMem");

            const entryPoint = ffi.ForeignFunction(entryPointPtr, "int", [
                "pointer",
                "size_t"
            ]);

            // Execute the entry point
            const fileType = entryPoint(buffer, buffer.length);

            console.log("File Type: '" + fileType + "'");

            return {
                fileType,
                fileTypeName: parse(fileType)
            };
        }
        catch (err) {
            console.log("Error, defaulting to Unknown. Error: " + err.toString());
        }
        finally {
            this.GWFileDone();
        }

        return {
            fileType: fileTypes.Unknown,
            fileTypeName: parse(fileTypes.Unknown)
        };
    }
    
    GWMemoryToMemoryProtect(buffer, fileType) {
        if (!buffer) throw "Buffer was not defined";

        try {
            const entryPointPtr = this.engine.get("GWMemoryToMemoryProtect");
            const entryPoint = ffi.ForeignFunction(entryPointPtr, "int", [
                "pointer",
                "size_t",
                "int",
                "pointer",
                "pointer"
            ]);

            var protectedFileBuffer = Buffer.alloc(0);
            var protectedFileBufferLengthBuffer = Buffer.alloc(0);
            const protectedFileStatus = entryPoint(
                buffer,
                buffer.length,
                fileType,
                protectedFileBuffer,
                protectedFileBufferLengthBuffer);

            const protectedFile = ref.readPointer(protectedFileBuffer);
            const protectedFileLength = ref.readUInt64LE(protectedFileBufferLengthBuffer);
            const errorMessage = this.GWFileErrorMsg();

            console.log("Protected file length: '" + protectedFileLength + "'");

            return {
                protectedFile,
                protectedFileStatus,
                errorMessage
            }
        }
        catch (err) {
            console.log("Error rebuilding file: " + err.toString());
        }
        finally {
            this.GWFileDone();
        }
        
        return null;
    }

    GWFileErrorMsg() {
        // Load the engine and entry point
        const entryPointPtr = this.engine.get("GWFileErrorMsg");

        // custom type that maps to wchar_t*
        const wcharString = createCustomUnicodeType();
        const entryPoint = ffi.ForeignFunction(entryPointPtr, wcharString, []);

        // Execute the entry point
        let errorMessage = '';
        try {
            errorMessage = entryPoint();
        }
        catch (err) {
            console.log(err)
        }
        finally {
            this.GWFileDone();
        }

        console.log("Error Message: '" + errorMessage + "'");

        return errorMessage;
    }

    GWFileDone() {
        const donePtr = this.engine.get("GWFileDone");
        const doneEntryPoint = ffi.ForeignFunction(donePtr, "int", [ ]);
        doneEntryPoint();
    }

    Close() {
        this.engine.Close();
    }
}


const createCustomUnicodeType = () => {
    var wchar_size = process.platform == 'win32' ? 2 : 4
    var typ = Object.create(ref.types.CString)
    typ.get = function get(buf, offset) {
        var _buf = buf.readPointer(offset)
        if (_buf.isNull()) {
            return null
        }
        var stringBuf = _buf.reinterpretUntilZeros(wchar_size)
        return stringBuf.toString('utf16le') // TODO: decode UTF-32 on Unix
    };
    typ.set = function set(buf, offset, val) {
        // TODO: better UTF-16 and UTF-32 encoding
        var _buf = new Buffer((val.length + 1) * wchar_size)
        _buf.fill(0)
        var l = 0
        for (var i = wchar_size - 1; i < _buf.length; i += wchar_size) {
            _buf[i] = val.charCodeAt(l++)
        }
        return buf.writePointer(_buf, offset)
    };

    return typ;
}

const fileExists = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            return true;
        }

        return false;
    } catch (err) {
        console.log(err);
        return false;
    }
}

const marshalCStringToJsString = (cstring) => {

}

module.exports = Engine;