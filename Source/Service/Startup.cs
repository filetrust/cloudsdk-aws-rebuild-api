using System;
using Glasswall.CloudSdk.AWS.Common.Web;
using Glasswall.Core.Engine;
using Glasswall.Core.Engine.Common;
using Glasswall.Core.Engine.Common.FileProcessing;
using Glasswall.Core.Engine.Common.GlasswallEngineLibrary;
using Glasswall.Core.Engine.Common.PolicyConfig;
using Glasswall.Core.Engine.FileProcessing;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Glasswall.CloudSdk.AWS.Rebuild
{
    public class Startup : AwsCommonStartup
    {
        public Startup(IConfiguration configuration) : base(configuration)
        {
        }

        protected override void ConfigureAdditionalServices(IServiceCollection services)
        {
            services.AddSingleton<IFileTypeDetector, FileTypeDetector>();
            services.AddSingleton<IFileProtector, FileProtector>();
            services.AddSingleton<IAdaptor<ContentManagementFlags, string>, GlasswallConfigurationAdaptor>();

            var p = (int)Environment.OSVersion.Platform;

            if ((p == 4) || (p == 6) || (p == 128))
            {
                services.AddSingleton<IGlasswallFileOperations, LinuxEngineOperations>();
            }
            else
            {
                services.AddSingleton<IGlasswallFileOperations, WindowsEngineOperations>();
            }
        }

        protected override void ConfigureAdditional(IApplicationBuilder app, IWebHostEnvironment env)
        {
        }
    }
}