var ref = require('ref-napi')
var IconvLite = require("iconv-lite");

// vars used by the "wchar_t" type
let wchar_size;
let encoding;

// On Windows they're UTF-16 (2-bytes), but on Unix platform they're UTF-32
// (4-bytes).
if ('win32' == process.platform) {
  wchar_size = 2;
  encoding = "utf-16le";
} else {
  wchar_size = 4;
  encoding = "utf-32le";
}

// Create a "wchar_t *" type. We use the "CString" type as a base since it's pretty
// close to what we actually want. We just have to define custom "get" and "set"
// functions and then we can use this type in FFI functions.
var wchar_t = Object.create(ref.types.CString)
wchar_t.get = function get (buf, offset) {
  var _buf = ref.readPointer(buf, offset);
  if (_buf.isNull()) {
    return null
  }
  var stringBuf = ref.reinterpretUntilZeros(_buf, wchar_size)
  return IconvLite.decode(stringBuf, encoding);
};
wchar_t.set = function set (buf, offset, val) {
  var _buf = val;

  if ('string' == typeof val) {
    _buf = IconvLite.encode(val + "\0", encoding);
  }

  return buf.writePointer(_buf, offset);
};

module.exports = {
    wchar_t
}