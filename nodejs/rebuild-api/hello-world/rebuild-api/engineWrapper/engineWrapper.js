const fs = require('fs')
const ref = require('ref-napi');
const ffi = require('ffi-napi');
const EngineOutcome = require("../engineOutcome");
const { wchar_t } = require("../node-ref-napi-custom-types");
const pFile_t = ref.refType(ref.types.void);
const pFileLength_t = ref.refType(ref.types.size_t);

class MethodWrapper {
    _engine;
    _entryPointPtr;
    _entryPoint;
    _entryPointName;

    constructor(engine, entryPointName, returnType, paramTypes) {
        this._engine = engine;
        this._entryPointPtr = this._engine.get(entryPointName);

        if (!paramTypes)
            paramTypes = [];

        this._entryPointName = entryPointName;
        this._entryPoint = ffi.ForeignFunction(this._entryPointPtr, returnType, paramTypes);
    }

    Finalise() {
        this._engine = null;
        this._entryPointPtr = null;
        this._entryPoint = null;
        this._entryPointName = null;
    }

    Execute() {
        console.log("Executing " + this._entryPointName + " with " + arguments.length + " args: " + arguments);

        if (!arguments.length)
            return this._entryPoint();

        if (arguments.length === 1)
            return this._entryPoint(arguments[0]);

        if (arguments.length === 2)
            return this._entryPoint(arguments[0], arguments[1]);

        if (arguments.length === 3)
            return this._entryPoint(arguments[0], arguments[1], arguments[2]);

        if (arguments.length === 4)
            return this._entryPoint(arguments[0], arguments[1], arguments[2], arguments[3]);

        if (arguments.length === 5)
            return this._entryPoint(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);

        if (arguments.length === 6)
            return this._entryPoint(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
    }
}

// TODO: need to look at if i need to cleanup the pointers created

/** Exposes the methods found in the DLL, node-ffi-napi is used to load the engine at runtime.
 * ref-napi is used to create 'types' that read the raw data sent to/from the engine
 * pointer types need to be marshalled and js Buffer's are used to represent pointers
 */
class EngineWrapper {
    _GlasswallEngine;
    _GWFileErrorMsg;
    _GWFileDone;
    _GWFileVersion;
    _GWDetermineFileTypeFromFileInMem;
    _GWFileConfigXML;
    _GWMemoryToMemoryProtect;

    constructor(libPath) {
        if (!fs.existsSync(libPath))
            throw "Cannot find DLL at " + libPath;
        this._GlasswallEngine = ffi.DynamicLibrary(libPath);
        this._GWFileErrorMsg = new MethodWrapper(this._GlasswallEngine, "GWFileErrorMsg", wchar_t, []);
        this._GWFileDone = new MethodWrapper(this._GlasswallEngine, "GWFileDone", "int", []);
        this._GWFileVersion = new MethodWrapper(this._GlasswallEngine, "GWFileVersion", wchar_t, []);
        this._GWDetermineFileTypeFromFileInMem = new MethodWrapper(this._GlasswallEngine, "GWDetermineFileTypeFromFileInMem", "int", ["pointer", "size_t"]);
        this._GWFileConfigXML = new MethodWrapper(this._GlasswallEngine, "GWFileConfigXML", "int", [wchar_t]);

        this._GWMemoryToMemoryProtect = new MethodWrapper(this._GlasswallEngine, "GWMemoryToMemoryProtect", "int",
            [
                "pointer",
                "size_t",
                wchar_t,
                pFile_t,
                pFileLength_t
            ]);
    }

    GWFileVersion() {
        return this._GWFileVersion.Execute();
    }

    GWDetermineFileTypeFromFileInMem(buffer) {
        if (!buffer) throw "Buffer was not defined";

        try {
            return this._GWDetermineFileTypeFromFileInMem.Execute(buffer, buffer.length);
        }
        finally {
            buffer = null;
        }
    }

    GWFileConfigXML(xmlConfig) {
        try {
            return this._GWFileConfigXML.Execute(xmlConfig);
        }
        finally {
            xmlConfig = null;
        }
    }

    GWMemoryToMemoryProtect(buffer, fileType) {
        if (!buffer) throw "Buffer was not defined";

        let engineOutcome, protectedFile;

        let pFilePtr = ref.alloc(pFile_t);
        let pFileLenPtr = ref.alloc(pFileLength_t);

        try {
            engineOutcome = this._GWMemoryToMemoryProtect.Execute(
                buffer,
                buffer.length,
                fileType,
                pFilePtr,
                pFileLenPtr);

            if (engineOutcome === EngineOutcome.Success) {
                const protectedFileLength = pFileLenPtr.readUInt64LE();
                protectedFile = ref.readPointer(pFilePtr, 0, protectedFileLength);
            }
        }
        finally {
            pFilePtr = null;
            pFileLenPtr = null;
            buffer = null;
            fileType = null;
        }

        return { engineOutcome, protectedFile };
    }

    GWFileErrorMsg() {
        return this._GWFileErrorMsg.Execute();
    }

    GWFileDone() {
        return this._GWFileDone.Execute();
    }

    Finalise() {
        this._GWFileDone.Finalise();
        this._GWFileDone = null;
        this._GWFileVersion.Finalise();
        this._GWFileVersion = null;
        this._GWDetermineFileTypeFromFileInMem.Finalise();
        this._GWDetermineFileTypeFromFileInMem = null;
        this._GWFileConfigXML.Finalise();
        this._GWFileConfigXML = null;
        this._GWMemoryToMemoryProtect.Finalise();
        this._GWMemoryToMemoryProtect = null;
        this._GlasswallEngine.close();
        this._GlasswallEngine = null;
    }
}

module.exports = EngineWrapper;