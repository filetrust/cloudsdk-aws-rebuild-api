const {
    handleUrlRequest
} = require("./rebuild-api/rebuildUrlHandler");

let response;

const getEventHandler = (event) => {
    const notFoundHandler = (_) => {
        return {
            statusCode: 404
        }
    };
    
    const notImplementedHandler = (_) => {
        return {
            statusCode: 418,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                errorMessage: "Not Implemented"
            })
        }
    };

    if (event.path == "/api/v1/rebuild/url")
        return handleUrlRequest;
    
    if (event.path == "/api/v1/rebuild/base64")
        return notImplementedHandler;

    if (event.path == "/api/v1/rebuild/file")
        return notImplementedHandler;

    if (event.path == "/api/v1/dummy/put")
        return notImplementedHandler;

    return notFoundHandler;
}

exports.lambdaHandler = async (event, context) => {
    try {
        const eventHandler = getEventHandler(event);
        response = eventHandler(event, context);
    }
    catch (err) {
        response = {
            statusCode: 418,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                errorMessage: err
            })
        }
    }

    return response;
};