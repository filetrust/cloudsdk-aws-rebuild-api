namespace Glasswall.Core.Engine.Messaging
{
    public enum FileType
    {
        Unknown = 0,
        FileIssues = 1,
        BufferIssues = 2,
        InternalIssues = 3,
        LicenseExpired = 4,
        PasswordProtectedOpcFile = 5,
        Pdf = 16, // 0x00000010
        Doc = 17, // 0x00000011
        Docx = 18, // 0x00000012
        Ppt = 19, // 0x00000013
        Pptx = 20, // 0x00000014
        Xls = 21, // 0x00000015
        Xlsx = 22, // 0x00000016
        Png = 23, // 0x00000017
        Jpeg = 24, // 0x00000018
        Gif = 25, // 0x00000019
        Emf = 26, // 0x0000001A
        Wmf = 27, // 0x0000001B
        Rtf = 28, // 0x0000001C
        Bmp = 29, // 0x0000001D
    }
}
