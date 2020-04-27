using Glasswall.Core.Engine.Common;
using Glasswall.Core.Engine.Common.FileProcessing;

namespace Glasswall.Core.Engine.FileProcessing
{
    public class FileProtectResponse : IFileProtectResponse
    {
        public byte[] ProtectedFile { get; set; }
        public EngineOutcome Outcome { get; set; }
    }
}
