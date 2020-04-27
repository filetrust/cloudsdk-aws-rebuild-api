using System;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Glasswall.CloudSdk.Common.Web.Abstraction
{
    [Route("api/[controller]")]
    public abstract class CloudSdkController<TController> : ControllerBase
    {
        protected readonly ILogger<TController> Logger;

        protected CloudSdkController(ILogger<TController> logger)
        {
            Logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        protected bool TryGetBase64File(string base64File, out byte[] file)
        {
            if (base64File == null) throw new ArgumentNullException(nameof(base64File));

            file = null;

            try
            {
                file = Convert.FromBase64String(base64File);

                return true;
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Could not parse base64 file {0}", base64File);

                return false;
            }
        }

        protected bool TryGetFile(Uri url, out byte[] file)
        {
            if (url == null) throw new ArgumentNullException(nameof(url));

            file = null;

            try
            {
                using var client = new HttpClient();
                var stopwatch = new Stopwatch();
                stopwatch.Start();
                file = client.GetByteArrayAsync(url).GetAwaiter().GetResult();
                stopwatch.Stop();
                Logger.Log(LogLevel.Information, $"File '{url}' took {stopwatch.Elapsed:c} to download");
            }
            catch (Exception ex)
            {
                Logger.LogError("Could not download file from Url {0} - Exception: {1}", url, ex.ToString());

                return false;
            }

            return true;
        }

        protected bool TryPutFile(Uri url, byte[] file)
        {
            if (url == null) throw new ArgumentNullException(nameof(url));
            if (file == null) throw new ArgumentNullException(nameof(file));

            try
            {
                Logger.LogInformation("Uploading file of size '{0}' to url '{1}'", file.Length, url);

                using var client = new HttpClient();
                var stopwatch = new Stopwatch();
                stopwatch.Start();
                var response = client.PutAsync(url, new ByteArrayContent(file)).GetAwaiter().GetResult();

                if (!response.IsSuccessStatusCode)
                {
                    Logger.LogWarning("Could not put file to Url {0} - Status code: {1}", url, response.StatusCode);
                    return false;
                }

                stopwatch.Stop();
                Logger.LogInformation($"File '{url}' took {stopwatch.Elapsed:c} to download");
            }
            catch (Exception ex)
            {
                Logger.LogError("Could not put file to Url {0} - Exception: {1}", url, ex.ToString());

                return false;
            }

            return true;
        }

        protected string GetFileNameFromUrl(string url)
        {
            return url.Split('/').Last().Split('?')[0];
        }
    }
}
