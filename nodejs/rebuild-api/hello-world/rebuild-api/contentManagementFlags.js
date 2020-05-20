var o2x = require('object-to-xml');

const cloudFlagToEngineFlag = (cloudFlag) => {
    if (cloudFlag === 0)
        return "allow"; // allow

    if (cloudFlag === 2)
        return "disallow"; // disallow

    if (cloudFlag === 1)
        return "sanitise"; // sanitise

    return 0;
}

const valueOrDefault = (flag) => {
    if (!flag)
        return cloudFlagToEngineFlag(1);

    return cloudFlagToEngineFlag(flag);
}

class ContentManagementFlags {
    ToEngineXml = () => {
        if (!this.PdfContentManagement)
            this.PdfContentManagement = {};

        if (!this.PowerPointContentManagement)
            this.PowerPointContentManagement = {};

        if (!this.ExcelContentManagement)
            this.ExcelContentManagement = {};

        if (!this.WordContentManagement)
            this.WordContentManagement = {};

        let engineConfigObj = {
            config:
            {
                pdfConfig:
                {
                    acroform: valueOrDefault(this.PdfContentManagement.Acroform),
                    actions_all: valueOrDefault(this.PdfContentManagement.ActionsAll),
                    internal_hyperlinks: valueOrDefault(this.PdfContentManagement.InternalHyperlinks),
                    external_hyperlinks: valueOrDefault(this.PdfContentManagement.ExternalHyperlinks),
                    embedded_files: valueOrDefault(this.PdfContentManagement.EmbeddedFiles),
                    embedded_images: valueOrDefault(this.PdfContentManagement.EmbeddedImages),
                    javascript: valueOrDefault(this.PdfContentManagement.Javascript),
                    metadata: valueOrDefault(this.PdfContentManagement.Metadata)
                },
                pptConfig:
                {
                    embedded_files: valueOrDefault(this.PowerPointContentManagement.EmbeddedFiles),
                    embedded_images: valueOrDefault(this.PowerPointContentManagement.EmbeddedImages),
                    internal_hyperlinks: valueOrDefault(this.PowerPointContentManagement.InternalHyperlinks),
                    external_hyperlinks: valueOrDefault(this.PowerPointContentManagement.ExternalHyperlinks),
                    macros: valueOrDefault(this.PowerPointContentManagement.Macros),
                    metadata: valueOrDefault(this.PowerPointContentManagement.Metadata),
                    review_comments: valueOrDefault(this.PowerPointContentManagement.ReviewComments)
                },
                xlsConfig:
                {
                    embedded_files: valueOrDefault(this.ExcelContentManagement.EmbeddedFiles),
                    embedded_images: valueOrDefault(this.ExcelContentManagement.EmbeddedImages),
                    internal_hyperlinks: valueOrDefault(this.ExcelContentManagement.InternalHyperlinks),
                    external_hyperlinks: valueOrDefault(this.ExcelContentManagement.ExternalHyperlinks),
                    macros: valueOrDefault(this.ExcelContentManagement.Macros),
                    metadata: valueOrDefault(this.ExcelContentManagement.Metadata),
                    review_comments: valueOrDefault(this.ExcelContentManagement.ReviewComments),
                    dynamic_data_exchange: valueOrDefault(this.ExcelContentManagement.DynamicDataExchange)
                },
                wordConfig:
                {
                    embedded_files: valueOrDefault(this.WordContentManagement.EmbeddedFiles),
                    embedded_images: valueOrDefault(this.WordContentManagement.EmbeddedImages),
                    internal_hyperlinks: valueOrDefault(this.WordContentManagement.InternalHyperlinks),
                    external_hyperlinks: valueOrDefault(this.WordContentManagement.ExternalHyperlinks),
                    macros: valueOrDefault(this.WordContentManagement.Macros),
                    metadata: valueOrDefault(this.WordContentManagement.Metadata),
                    review_comments: valueOrDefault(this.WordContentManagement.ReviewComments),
                    dynamic_data_exchange: valueOrDefault(this.WordContentManagement.DynamicDataExchange)
                }
            }
        }

        return '<?xml version="1.0" encoding="utf-8"?>' + o2x(engineConfigObj);
    }

    PdfContentManagement = {
        Metadata: 1,
        InternalHyperlinks: 1,
        ExternalHyperlinks: 1,
        EmbeddedFiles: 1,
        EmbeddedImages: 1,

        Javascript: 1,
        Acroform: 1,
        ActionsAll: 1
    }

    ExcelContentManagement = {
        Metadata: 1,
        InternalHyperlinks: 1,
        ExternalHyperlinks: 1,
        EmbeddedFiles: 1,
        EmbeddedImages: 1,

        DynamicDataExchange: 1,
        Macros: 1,
        ReviewComments: 1
    }

    PowerPointContentManagement = {
        Metadata: 1,
        InternalHyperlinks: 1,
        ExternalHyperlinks: 1,
        EmbeddedFiles: 1,
        EmbeddedImages: 1,

        Macros: 1,
        ReviewComments: 1
    }

    WordContentManagement = {
        Metadata: 1,
        InternalHyperlinks: 1,
        ExternalHyperlinks: 1,
        EmbeddedFiles: 1,
        EmbeddedImages: 1,

        DynamicDataExchange: 1,
        Macros: 1,
        ReviewComments: 1
    }
}

module.exports = ContentManagementFlags;