using System;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Text;
using Glasswall.CloudSdk.Common;
using Glasswall.CloudSdk.Common.Web.Abstraction;
using Glasswall.CloudSdk.Common.Web.Models;
using Glasswall.Core.Engine.Common.FileProcessing;
using Glasswall.Core.Engine.Common.PolicyConfig;
using Glasswall.Core.Engine.Messaging;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Glasswall.CloudSdk.AWS.Rebuild.Controllers
{
    public class RebuildController : CloudSdkController<RebuildController>
    {
        private readonly IGlasswallVersionService _glasswallVersionService;
        private readonly IFileTypeDetector _fileTypeDetector;
        private readonly IFileProtector _fileProtector;

        public RebuildController(
            IGlasswallVersionService glasswallVersionService,
            IFileTypeDetector fileTypeDetector,
            IFileProtector fileProtector,
            IMetricService metricService,
            ILogger<RebuildController> logger) : base(logger, metricService)
        {
            _glasswallVersionService = glasswallVersionService ?? throw new ArgumentNullException(nameof(glasswallVersionService));
            _fileTypeDetector = fileTypeDetector ?? throw new ArgumentNullException(nameof(fileTypeDetector));
            _fileProtector = fileProtector ?? throw new ArgumentNullException(nameof(fileProtector));
        }

        [HttpPost("file")]
        public IActionResult RebuildFromFormFile([FromForm]ContentManagementFlags contentManagementFlags, [FromForm]IFormFile file)
        {
            try
            {
                byte[] fileBytes;
                using (var ms = new MemoryStream())
                {
                    file.OpenReadStream().CopyTo(ms);
                    fileBytes = ms.ToArray();
                }

                return Ok(new
                {
                    file.Length,
                    contentManagementFlags,
                    str = Encoding.UTF8.GetString(fileBytes)
                });
            }
            catch (Exception ex)
            {
                return Ok(new { Ex =  ex.ToString() });
            }
        }

        [HttpPost("base64")]
        public IActionResult RebuildFromBase64([FromBody][Required]Base64Request request)
        {
            try
            {
                Logger.LogInformation("'{0}' method invoked", nameof(RebuildFromBase64));

                if (!ModelState.IsValid) 
                    return BadRequest(ModelState);
                
                if (!TryGetBase64File(request.Base64, out var file))
                    return BadRequest("Input file could not be decoded from base64.");

                RecordEngineVersion();

                var fileType = DetectFromBytes(file);

                if (fileType.FileType == FileType.Unknown)
                    return UnprocessableEntity("File could not be determined to be a supported file");

                var protectedFileResponse = RebuildFromBytes(
                    request.ContentManagementFlags, fileType.FileTypeName, file);

                if (protectedFileResponse?.ProtectedFile == null)
                    return UnprocessableEntity($"File could not be rebuilt. Engine status: {protectedFileResponse?.Outcome}");

                return new FileContentResult(protectedFileResponse.ProtectedFile, "application/octet-stream") { FileDownloadName = request.FileName ?? "Unknown" };
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
                Logger.LogInformation("'{0}' method invoked", nameof(RebuildUrlToUrl));

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (!TryGetFile(request.InputGetUrl, out var file))
                    return BadRequest("Input file could not be downloaded.");

                RecordEngineVersion();

                var fileType = DetectFromBytes(file);

                if (fileType.FileType == FileType.Unknown)
                    return UnprocessableEntity("File could not be determined to be a supported file");

                var protectedFileResponse = RebuildFromBytes(
                    request.ContentManagementFlags, fileType.FileTypeName, file);

                if (protectedFileResponse?.ProtectedFile == null)
                    return UnprocessableEntity($"File could not be rebuilt. Engine status: {protectedFileResponse?.Outcome}");

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

        private void RecordEngineVersion()
        {
            var version = _glasswallVersionService.GetVersion();
            MetricService.Record(Metric.Version, version);
        }

        private FileTypeDetectionResponse DetectFromBytes(byte[] bytes)
        {
            TimeMetricTracker.Restart();
            var fileTypeResponse = _fileTypeDetector.DetermineFileType(bytes);
            TimeMetricTracker.Stop();
            
            MetricService.Record(Metric.DetectFileTypeTime, TimeMetricTracker.Elapsed);
            return fileTypeResponse;
        }

        private IFileProtectResponse RebuildFromBytes(ContentManagementFlags contentManagementFlags, string fileType, byte[] bytes)
        {
            contentManagementFlags = contentManagementFlags.ValidatedOrDefault();

            TimeMetricTracker.Restart();
            var response = _fileProtector.GetProtectedFile(contentManagementFlags, fileType, bytes);
            TimeMetricTracker.Stop();

            MetricService.Record(Metric.RebuildTime, TimeMetricTracker.Elapsed);
            return response;
        }
    }
}