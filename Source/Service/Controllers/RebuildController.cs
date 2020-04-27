using System;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using Glasswall.CloudSdk.Common.Web.Abstraction;
using Glasswall.CloudSdk.Common.Web.Models;
using Glasswall.Core.Engine.Common.FileProcessing;
using Glasswall.Core.Engine.Common.PolicyConfig;
using Glasswall.Core.Engine.Messaging;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Glasswall.CloudSdk.AWS.Rebuild.Controllers
{
    public class RebuildController : CloudSdkController<RebuildController>
    {
        private readonly IFileTypeDetector _fileTypeDetector;
        private readonly IFileProtector _fileProtector;

        public RebuildController(
            IFileTypeDetector fileTypeDetector,
            IFileProtector fileProtector,
            ILogger<RebuildController> logger) : base(logger)
        {
            _fileTypeDetector = fileTypeDetector ?? throw new ArgumentNullException(nameof(fileTypeDetector));
            _fileProtector = fileProtector ?? throw new ArgumentNullException(nameof(fileProtector));
        }

        [HttpPost("base64")]
        public IActionResult RebuildFromBase64([FromBody][Required]Base64Request request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                Logger.LogInformation("'{0}' method invoked", nameof(RebuildFromBase64));

                if (!TryGetBase64File(request.Base64, out var file))
                    return BadRequest("Input file could not be decoded from base64.");

                var fileType = DetectFromBytes(file);

                if (fileType.FileType == FileType.Unknown)
                    return new UnprocessableEntityObjectResult("File could not be determined to be a supported file");

                var protectedFileResponse = RebuildFromBytes(request.FileName, fileType.FileTypeName, file, request.ContentManagementFlags);

                if (protectedFileResponse.ProtectedFile != null)
                    return new FileContentResult(protectedFileResponse.ProtectedFile, "application/octet-stream") { FileDownloadName = request.FileName ?? "Unknown" };

                return Ok();
            }
            catch (Exception e)
            {
                Logger.LogError(e, $"Exception occured processing file: {e.Message}");
                throw;
            }
        }

        [HttpPost]
        public IActionResult RebuildUrlToUrl([FromBody][Required] UrlToUrlRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                Logger.LogInformation("'{0}' method invoked", nameof(RebuildUrlToUrl));

                if (!TryGetFile(request.InputGetUrl, out var file))
                    return BadRequest("Input file could not be downloaded.");

                var fileType = DetectFromBytes(file);

                if (fileType.FileType == FileType.Unknown)
                    return new UnprocessableEntityObjectResult("File could not be determined to be a supported file");

                var fileName = GetFileNameFromUrl(request.InputGetUrl.AbsolutePath);
                var protectedFileResponse = RebuildFromBytes(fileName, fileType.FileTypeName, file, request.ContentManagementFlags);

                if (protectedFileResponse.ProtectedFile != null)
                    if (!TryPutFile(request.OutputPutUrl, protectedFileResponse.ProtectedFile))
                        return BadRequest("Could not put protected file to the supplied output url");

                return Ok();
            }
            catch (Exception e)
            {
                Logger.LogError(e, $"Exception occured processing file: {e.Message}");
                throw;
            }
        }

        private FileTypeDetectionResponse DetectFromBytes(byte[] bytes)
        {
            var stopwatch = new Stopwatch();
            stopwatch.Start();
            var fileTypeResponse = _fileTypeDetector.DetermineFileType(bytes);
            stopwatch.Stop();
            Logger.LogInformation("File type '{0}' detected in '{1}'.", fileTypeResponse?.FileTypeName, stopwatch.ToString());
            return fileTypeResponse;
        }

        private IFileProtectResponse RebuildFromBytes(string fileName, string fileType, byte[] bytes, ContentManagementFlags contentManagementFlags)
        {
            contentManagementFlags = contentManagementFlags.ValidatedOrDefault();
            
            var stopwatch = new Stopwatch();
            stopwatch.Start();
            var response = _fileProtector.GetProtectedFile(contentManagementFlags, fileType, bytes);
            stopwatch.Stop();

            Logger.Log(LogLevel.Information, $"File '{fileName}' with type '{fileType}' rebuilt in {stopwatch.Elapsed:c}");
            
            return response;
        }
    }
}