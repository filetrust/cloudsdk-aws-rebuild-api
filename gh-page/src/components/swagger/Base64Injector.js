const Base64Injector = {
    GetBase64
}

async function GetBase64(input) {
    if (!input || !input.value || input.value === "")
        return "";

    const fileBuffer = await _readInputFileBuffer(input.files[0])
    return _arrayBufferToBase64(fileBuffer);
}

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

export default Base64Injector;