const fs = require("fs");
const { lambdaHandler } = require("./rebuild-api/hello-world/app"); 

const eventString = fs.readFileSync(__dirname + "\\rebuild-api\\events\\event.json", 'utf8');

const event = JSON.parse(eventString);

lambdaHandler(event, console).then(response => {
    console.log(response);
});