const fs = require("fs");
const { lambdaHandler } = require("./rebuild-api/hello-world/app"); 

const eventString = fs.readFileSync(__dirname + "\\rebuild-api\\events\\event.json", 'utf8');

let event = JSON.parse(eventString);

let d = JSON.parse(event.body)
d.InputGetUrl = "https://file-examples.com/wp-content/uploads/2017/02/file_example_XLSX_5000.xlsx";
d.OutputPutUrl = "https://jp-test-output-2.s3.us-west-2.amazonaws.com/rebuilt-files/7e167644-27f6-444d-9d22-80db01260d62/21-05-2020%2009:14:27/Clean.docx?X-Amz-Expires=3600&x-amz-security-token=IQoJb3JpZ2luX2VjEND%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMiJGMEQCID%2FKgGHOQb6TD%2BxVQyXwwFIKAr9mJZVUghr286P88QSzAiA1hSBZVIRt2hCMut2X3Jg0GV5U6MMTSHOq994XO9lwZyr6AQgpEAAaDDM3MDM3Nzk2MDE0MSIM657uFHHkwKwSLT4xKtcBnGBG6b%2F0JCQ7VdhVCbrE0SAvqqWFPbKPEeZLPJTUwE7aqb2kC5JrpiH4P2MjM%2FfDYPEMRyPWqKW8zJGKH6YRl738NWHJALWUiovaFBDfBumfuXoUuFFnQpRK%2F6dbUZYgI%2Fm3PglhDD2IckzlrJSdKsNmK%2BUy99ZEZZCzOXnjy7rYjxnk1bo4S%2F0rGIdyHK%2F86C7kuY0PljPvm58WZ2lQbs4T11%2BcM0TKNo46MgEMyE%2FOV6prdlVj5OsOT6xyCzRrLK11eav2SgLI%2FGfb5ktC2MojxXctVg0w4vCY9gU64QG1gyblfvtxCkbW1H%2FzUNVWoS0aWFv0yp97gtl8YAZnkeM2uvDuINK7gCTMOW5alLMR4t6oXUjjjTKvZA1BE2pjhUR2irCEhGV7IWu2%2FNx4GOXg9G4KK6tLKDH4M6YYbMDDYKvGXe839PQbPiRfi5E1nbrbsjXD9w4BDzH3dne8aqU3Qw7bwh6BhLHzcYaHeb57%2FB5GIWZushyvJYIjhmyMefPxRbuN3kK3ENmdAtXGzyUGvf%2Ff8Kw4vFwQTJDEJyIqv0WUCJWg2Hh5DFxluQPfEe%2FQkr%2F2X4RBh1GD2hAIepc%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAVMPB7FLG2BOWVWES/20200521/us-west-2/s3/aws4_request&X-Amz-Date=20200521T081427Z&X-Amz-SignedHeaders=host;x-amz-security-token&X-Amz-Signature=4785f6d5c851962e9e2466bd47c937c83a3f66ecfbf4d137f389709b4ef01434"
event.body = JSON.stringify(d);

lambdaHandler(event, console).then(response => {
    console.log(response);
    Object.keys(response.headers).forEach(header => {
        console.log(`${header} - ${response.headers[header]}`)
    });
});