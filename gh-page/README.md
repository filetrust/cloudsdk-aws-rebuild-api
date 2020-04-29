# Glasswall File Type Rebuild

Simple single page application written in react, which allows users to have a file rebuilt with the Glasswall d-First Engine.

## Try it out
You can view a live demo hosted on this repo [here](https://filetrust.github.io/product-file-type-detection/#/drop)

## Related Blog posts

## Getting Started
To get the frontend running locally:
* Clone this repo
* `npm install` to install all required dependencies
* `npm start` to star the local server (this project uses create-react-app)

The local web server will use the standard React port 3000.

## Running the tests

Tests can be run locally with `npm test`

## Deployment

Deployment is handled via Azure DevOps pipelines. Upon pushing to master a Build will take place, packaging up the application with Docker and pushing the image to an Azure Container Registry. Once the CI build has been completed a Release will upload the lastest docker image to the App Service running the React App.

## FAQ

https://github.com/filetrust/product-file-type-detection/blob/master/faq.md
