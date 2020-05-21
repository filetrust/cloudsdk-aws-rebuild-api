const _readInputFileBuffer = async(file) => {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = error => {
            reject(error);
        };
    });
};

const _arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    let binary = "";
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);
};

const Base64Injector = {
    GetBase64: async(input) => {
        if (!input || !input.value || input.value === "")
        {
            return "";
        }
    
        const fileBuffer = await _readInputFileBuffer(input.files[0]);
        return _arrayBufferToBase64(fileBuffer);
    }
};

export default Base64Injector;