const {
    handleUrlRequest
} = require("./rebuild-api/rebuildUrlHandler");

const Metric = require("./rebuild-api/metric");

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
    const memoryUsageStart = process.memoryUsage();

    try {
        const eventHandler = getEventHandler(event);
        console.log("--Starting Event Handler--");
        response = await eventHandler(event, context);
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

    console.log("--Finished Event Handler--");

    const memoryUsageEnd = process.memoryUsage();

    try {
        if (global.gc) { 
            console.log("GC ran");
            global.gc(); 
        }
    } catch (e) {
        console.log("`node --expose-gc index.js`");
        process.exit();
    }
    
    response.headers[Metric.StartHeapUsed] = memoryUsageStart.heapUsed;
    response.headers[Metric.StartHeapTotal] = memoryUsageStart.heapTotal;
    response.headers[Metric.StartRSS] = memoryUsageStart.rss;
    response.headers[Metric.StartExternal] = memoryUsageStart.external;
    response.headers[Metric.StartArrayBuffers] = memoryUsageStart.arrayBuffers;
    
    response.headers[Metric.EndHeapUsed] = memoryUsageEnd.heapUsed;
    response.headers[Metric.EndHeapTotal] = memoryUsageEnd.heapTotal;
    response.headers[Metric.EndRSS] = memoryUsageEnd.rss;
    response.headers[Metric.EndExternal] = memoryUsageEnd.external;
    response.headers[Metric.EndArrayBuffers] = memoryUsageEnd.arrayBuffers;

    return response;
};