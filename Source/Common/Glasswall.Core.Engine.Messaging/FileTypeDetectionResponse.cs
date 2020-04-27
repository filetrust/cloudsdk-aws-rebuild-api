using System;

namespace Glasswall.Core.Engine.Messaging
{
    [Serializable]
    public class FileTypeDetectionResponse
    {
        public FileTypeDetectionResponse(FileType fileType, int fileSize)
        {
            this.FileType = fileType;
            this.FileSize = fileSize;
        }

        public FileType FileType { get; }

        public string FileTypeName => FileType.ToString();

        public int FileSize { get; }
    }
}
