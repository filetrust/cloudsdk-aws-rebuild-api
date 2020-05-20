const Enum = {
    GetString: (enumeration, enumerationValue) => {
        return Object.keys(enumeration).find(key => enumeration[key] == enumerationValue);
    }
}

module.exports = Enum;