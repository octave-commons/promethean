require=(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return (b64.length * 3 / 4) - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr((len * 3 / 4) - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0; i < l; i += 4) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = ((uint8[i] << 16) & 0xFF0000) + ((uint8[i + 1] << 8) & 0xFF00) + (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],2:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  get: function () {
    if (!(this instanceof Buffer)) {
      return undefined
    }
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  get: function () {
    if (!(this instanceof Buffer)) {
      return undefined
    }
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('Invalid typed array length')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (isArrayBuffer(value) || (value && isArrayBuffer(value.buffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return fromObject(value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if (ArrayBuffer.isView(obj) || 'length' in obj) {
      if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object.')
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (ArrayBuffer.isView(buf)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isArrayBuffer(string)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : new Buffer(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffers from another context (i.e. an iframe) do not pass the `instanceof` check
// but they should be treated as valid. See: https://github.com/feross/buffer/issues/166
function isArrayBuffer (obj) {
  return obj instanceof ArrayBuffer ||
    (obj != null && obj.constructor != null && obj.constructor.name === 'ArrayBuffer' &&
      typeof obj.byteLength === 'number')
}

function numberIsNaN (obj) {
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":1,"ieee754":3}],3:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],4:[function(require,module,exports){
const { isArrayBufferViewType } = require('../util');

const $layout = Symbol('layout');
const $type   = Symbol('type');

class HandleArray extends Array
{
	constructor( type, length, buffer=(new ArrayBuffer(type.size*(length|0))), offset=0 )
	{
		super( length );
		this.buffer = buffer;
		this.data   = new DataView( this.buffer );
		this.type   = type;
		this.offset = offset;

		let size = type.prototype[$type].size;

		for( let i=0; i<length; i++ ) this[i] = new (type)( buffer, (offset+i*size)|0 );
	}
	each( f )
	{
		this.forEach( f );
	}
}
/****************************************************************************************
	Type base class
****************************************************************************************/

const _ViewTypes_ = new Map();

class Type
{
	static get( o, x )
	{
		if( o.isPrimitive ) return o;
		if( o.isView      ) return o;
		if( o.isHandle    ) return o.prototype[$type];

		if( !!(x = _ViewTypes_.get(o)) ) return x;
	}
	static is(x)
	{
		return Type.prototype.isPrototypeOf(x);
	}
	constructor( size=0, length=0, uniform=true )
	{
		this.size    = size;
		this.length  = length;
		this.uniform = uniform;
	}
	get isType() { return true; }
}
/****************************************************************************************
	Primitive corresponds to a single native value of a specific type : int, int8,
	... uint, ... float, ..., etc.
****************************************************************************************/
class Primitive extends Type
{
	static is( o ) { return !!(o.isPrimitive); }
	constructor( array_type, getter, setter )
	{
		super( array_type.BYTES_PER_ELEMENT, 1, true );
		this.array  = array_type;
		this.setter = setter;
		this.getter = getter;
	}
	get isPrimitive() { return true; }
	get( data, offset )
	{
		return this.getter.call( data, offset, true );
	}
	set( data, offset, value )
	{
		this.setter.call( data, offset, value, true );
	}
}
/****************************************************************************************
	ViewType corresponds to multiple native values of a single native type stored
	continuously: an array.

	param 'type' should be class extending a TypedArray type which privide the
	BYTE_LENGTH and ELEMENTS properties
****************************************************************************************/
class ViewType extends Type
{
	static is( x )
	{
		return isArrayBufferViewType(x);
	}
	constructor( type )
	{
		super( type.BYTE_LENGTH, type.ELEMENTS, true );
		this.type = type;
		_ViewTypes_.set( type, this );
	}
	get( data, offset )
	{
		return new (this.type)( data, offset, this.length );
	}
	get isView() { return true; }
}
/****************************************************************************************
	Composite corresponds to multiple native values of multiple native type stored
	continuously: a struct.
****************************************************************************************/
function addDescriptor( handle, field )
{
	if( !!field.isPrimitive )
	{
		Object.defineProperty( handle.prototype, field.key,
		{
				enumerable : true,
				get : function()
				{
					return field.type.get( this, field.offset );
				},
				set : function( v )
				{
					field.type.set( this, field.offset, v );
				}
			}
		);
	}
	if( !!field.isView )
	{
		Object.defineProperty( handle.prototype, field.key,
			{
				enumerable   : true,
				configurable : false,
				writable     : true,
				value        : null
			}
		);
	}
	if( !!field.isComposite )
	{
		Object.defineProperty( handle.prototype, field.key,
			{
				enumerable   : true,
				configurable : false,
				writable     : true,
				value        : null
			}
		);
	}
}
class Composite extends Type
{
	constructor( members, ret=true )
	{
		super();
		this.layout = {};
		this.handle = Handle.extend( this );
		this.keys   = Object.keys(members);
		this.uniType= null;
		let type, field, prev=Type.get(members[this.keys[0]]);

		for( let key of this.keys )
		{
			type             = Type.get(members[key]);
			field            = new Field( key, type, this.size );
			this.layout[key] = field;
			this.size        = (this.size   + type.size  )|0;
			this.length      = (this.length + type.length)|0;
			this.uniform     = this.uniform ? (prev === type) : false;

			addDescriptor( this.handle, field );
			prev = type;
		}
		if( this.uniform ) this.uniType = prev;
		if( ret ) return this.handle;
	}
	get isComposite() { return true; }
}
/****************************************************************************************
	Field store Composite instance layout information
****************************************************************************************/
class Field
{
	constructor( key, type, offset  )
	{
		this.key    = key;
		this.type   = type;
		this.offset = offset;
	}
	get isField() { return true;            }
	get size()    { return this.type.size;  }
	get length()  { return this.type.length }

	get isPrimitive() { return !!this.type.isPrimitive; }
	get isComposite() { return !!this.type.isComposite; }
	get isView()      { return !!this.type.isView;      }
	get isUniform()   { return !!this.type.uniform;     }
}
/****************************************************************************************
	Handle is a base class for instances of a Composite
****************************************************************************************/
class Handle extends DataView
{
	static is()
	{
		return Handle.prototype.isPrototypeOf(x);
	}
	constructor( data, offset, length )
	{
		super( data, offset, length );
	}
	static extend( type )
	{
		let handle_t = class extends Handle
		{
			static is( subject )
			{
				return (subject instanceof handle_t) || handle_t.prototype.isPrototypeOf(subject);
			}
			constructor( data=(new ArrayBuffer(type.size)), offset=0 )
			{
				super( data, offset, type.size );
				Handle.init( type, this );
			}
		};
		Object.defineProperty( handle_t.prototype, $type, {value: type} );

		return handle_t;
	}
	static Array( buffer_or_length, offset=0, length, buffer )
	{
		if( buffer_or_length instanceof ArrayBuffer )
		{
			buffer = buffer_or_length;
			length = length || ((buffer.length - offset) / this.prototype[$type].size)|0;
		}
		else
		{
			length = buffer_or_length|0;
			buffer = new ArrayBuffer( length* this.prototype[$type].size );
		}
		return new HandleArray( this, length, buffer, offset );
	}

	static get typeinfo()
	{
		return this.prototype[$type];
	}
	static get layout()
	{
		return this.prototype[$type].layout;
	}
	static get size()
	{
		return this.prototype[$type].size;
	}
	static get length()
	{
		return this.prototype[$type].length;
	}
	static get uniform()
	{
		return this.prototype[$type].uniform;
	}
	static get isHandle()
	{
		return true;
	}
	static get ELEMENTS()
	{
		return this.prototype[$type].length;
	}
	static get BYTE_LENGTH()
	{
		return this.prototype[$type].size;
	}

	toString()
	{
		let type   = this[$type];
		let v;
		let r = '{ ';
		for( let key of type.keys )
		{
			v = ((this[key] * 100)|0) / 100;
			if( type.isPrimitive ) { r+= `${key}: ${v}, `; continue; }
			r+= `${key}: ${this[key].toString()}, `; continue;
		}
		r+= ' }';
		return r;
	}

	static init( info, instance )
	{
		let buffer = instance.buffer;
		let offset = instance.byteOffset;
		let layout = info.layout;
		let field;

		for( let key of info.keys )
		{
			field = layout[key];
			if( field.isView )
			{
				instance[key] = field.type.get( buffer, (offset + field.offset)|0 );
				continue;
			}
			if( field.isComposite )
			{
				instance[key] = new (field.type.handle)( buffer, (offset + field.offset)|0, field.size );
				continue;
			}
		}
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports =
{
	Composite : Composite,
	Handle    : Handle,
	Primitive : Primitive,
	Type      : Type,
	View      : ViewType
};
},{"../util":31}],5:[function(require,module,exports){

class Clock
{
	constructor( auto=true )
	{
		this.auto    = start;
		this.first    = performance.now();
		this.previous = 0.0;
		this.elapsed  = 0.0;
		this.running  = false;
	}
	start()
	{
		if( !this.running )
		{
			this.first    = performance.now();
			this.previous = this.first;
			this.elapsed  = 0.0;
			this.running  = true;
		}
		return this;
	}
	restart()
	{
		return this.stop().start();
	}
	stop()
	{
		this.running = false;
		return this;
	}
	get delta()
	{
		let next = 0.0, result = 0.0;

		if( this.start && !this.running ) this.start();
		if( this.running )
		{
			next          = performance.now();
			this.elapsed += (result = next - this.previous);
			this.previous = next;
		}
		return result;
	}
}
},{}],6:[function(require,module,exports){

class MyError extends Error
{
  constructor(message)
  {
    super(message);
    this.message = message;
    this.name    = this.constructor;
  }
}

throw (new MyError('testError'));
},{}],7:[function(require,module,exports){
class Emitter
{
	constructor()
	{
		this.listeners = new Map();
	}
	on( key, callback, entry )
	{
		if( !( entry = this.listeners.get( key ) ) )
		{
			this.listeners.set( key, (entry = new Array()) );
		}
		if( entry.indexOf( callback ) === -1 )
		{
			entry.push( callback );
		}
		return this;
	}
	has( key, callback, entry )
	{
		return !!( entry = this.listeners.get( key ) ) && ( entry.indexOf( listener ) === -1 );
	}
	clear( key, callback, entry, index )
	{
		if( !!( entry = this.listeners.get( key ) ) && ( ( index = entry.indexOf( listener ) ) === -1 ) )
		{
			entry.splice( index, 1 );
		}
		return this;
	}
	emit( key, ...args )
	{
		let entry;
		if( !!( entry = this.listeners.get( key ) ) )
		{
			let l = entry.length
			for( let i = 0; i < l; i++ )
			{
				entry[ i ]( ...args );
			}
		}
	}
}
////////////////////////////////////////////////////////////////////////////////
function throttle( threshhold, fn, context=null )
{
	let last, deferTimer;
	return function( ...args )
	{
		let now = +new Date();
		if( last && (now < (last + threshhold)) )
		{
			clearTimeout( deferTimer );
			deferTimer = setTimeout( ()=>{ last = now; fn.apply( context, args ); }, threshhold );
		}
		else
		{
			last = now;
			fn.apply( context, args );
		}
	};
}
////////////////////////////////////////////////////////////////////////////////
function debounce( delay, fn, context=null )
{
	let timer = null;
	return function( ...args )
	{
		clearTimeout( timer );
		timer = setTimeout( ()=>(fn.apply( context, args )), delay );
	};
}
////////////////////////////////////////////////////////////////////////////////
module.exports = {
	Emitter,
	throttle,
	debounce
};

},{}],8:[function(require,module,exports){

function parse_args( length, args )
{
	return args.length ? args : [length];
}
const pow     = Math.pow;
const sqrt    = Math.sqrt;
const abs     = Math.abs;
const isArray = Array.isArray;
const Cs      = (c      ) => (c / 255);
const RGB     = (c=Cs(c)) => (c <= 0.03928)?(c / 12.92):(pow(((c + 0.055) / 1.055), 2.4));

const BlendMode =
{
	multiply(c, other)
	{
        return c * other;
    },
    screen(c, other)
	{
        return c + other - c * other;
    },
    overlay(c=c*2, other, fn)
	{
        return (c <= 1) ? BlendMode.multiply(c, other) : BlendMode.screen(c - 1, other);
    },
    softlight(c, other)
	{
        let d = 1, e = c;
        if( other > 0.5 )
		{
            e = 1;
            d = (c > 0.25) ? sqrt(c) : (((16 * c - 12) * c + 4) * c);
        }
        return c - (1 - 2 * other) * e * (d - c);
    },
    hardlight(c, other)
	{
        return BlendMode.overlay(other, c);
    },
    difference(c, other)
	{
        return abs(c - other);
    },
    exclusion: function(c, other) {
        return c + other - 2 * c * other;
    },
    average(c, other)
	{
        return (c + other) / 2;
    },
    negation(c, other)
	{
        return 1 - abs(c + other - 1);
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class RGBA extends Uint8Array
{

	static blend( a, b )
	{
		return a.clone.mix(b);
	}
	/////////////////////////////////////////////////////////////////////////////////////
	constructor( ...args )
	{
		super( ...(parse_args( 4, args )) );
	}
	/////////////////////////////////////////////////////////////////////////////////////
	static get ELEMENTS()
	{
		return 4;
	}
	static get BYTE_LENGTH()
	{
		return 4 * Uint8Array.BYTES_PER_ELEMENT;
	}
	get isRGB()   { return true;           }
	get isColor() { return true;           }
	get r()       { return this[0];        }
	get g()       { return this[1];        }
	get b()       { return this[2];        }
	get a()       { return this[3];        }
	set r(v)      { this[0] = v   ;        }
	set g(v)      { this[1] = v   ;        }
	set b(v)      { this[2] = v   ;        }
	set a(v)      { this[3] = v   ;        }
	get clone()   { return new RGBA(this); }
	get brightness()
	{
		return (this[0] * 299 + this[1] * 587 + this[2] * 114) / 1000;
	}
	get luminance()
	{
		return (0.2126 * RGB(this[0])) + (0.7152 * RGB(this[1])) + (0.0722 * RGB(this[2]));
	}
/*
	get hsla()
	{
		let [r, g, b, a] = [Cs(this[0]),  Cs(this[1]),  Cs(this[2]),  Cs(this[3]) ];
		let [max, min  ] = [Math.max(r, g, b), Math.min(r, g, b)];
		let [h, s, l, d] = [0, 0, ((max + min) / 2), (max - min)];

		if (max !== min)
		{
			s = (l > 0.5) ? (d / (2 - max - min)) : (d / (max + min));
			switch(max)
			{
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2;               break;
				case b: h = (r - g) / d + 4;               break;
			}
			h /= 6;
		}
		return new HLSA([h * 360, s, l, a]);
	}
*/
	/////////////////////////////////////////////////////////////////////////////////////
	set( r,g,b,a )
	{
		[this[0], this[1], this[2], this[3]] = [r,g,b,a];
		return this;
	}
	blend( other, fn=BlendMode.average )
	{
		let [ r,  g,  b,  a] = [Cs(this[0]),  Cs(this[1]),  Cs(this[2]),  Cs(this[3])       ];
		let [or, og, ob, oa] = [Cs(other[0]), Cs(other[1]), Cs(other[2]), Cs(other[3])      ];
		let [rr, rb, rg, ra] = [fn(r,or),     fn(r,or),     fn(r,or),     (a + oa * (1 - a))];
		if( ra )
		{
			rr = (oa * or + a * (r - oa * (a + or - ra))) / ra;
			rg = (oa * og + a * (g - oa * (a + og - ra))) / ra;
			rb = (oa * ob + a * (b - oa * (a + ob - ra))) / ra;
		}
		[this[0],this[1],this[2],this[3]] = [rr, rb, rg, ra];
		return this;
	}
	/////////////////////////////////////////////////////////////////////////////////////
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
class HSLA extends Float32Array
{
	/////////////////////////////////////////////////////////////////////////////////////
	constructor( ...args )
	{
		super( ...(parse_args( 4, args )) );
	}
	/////////////////////////////////////////////////////////////////////////////////////
	static get ELEMENTS()
	{
		return 4;
	}
	static get BYTE_LENGTH()
	{
		return 4 * Float32Array.BYTES_PER_ELEMENT;
	}
	get isHLS()   { return true;           }
	get isColor() { return true;           }
	get h()       { return this[0];        }
	get l()       { return this[1];        }
	get s()       { return this[2];        }
	get a()       { return this[4];        }
	get clone()   { return new HLSA(this); }

}
class sRGBA extends Float32Array
{

}
class HSL extends Float32Array
{

}
*/
module.exports =
{
	RGBA,
	BlendMode
}
},{}],9:[function(require,module,exports){
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

/**
 * @class Common utilities
 * @name glMatrix
 */
var glMatrix = {};

// Configuration Constants
glMatrix.EPSILON     = 0.000001;
glMatrix.ARRAY_TYPE  = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
glMatrix.RANDOM      = Math.random;
glMatrix.ENABLE_SIMD = true;

// Capability detection
glMatrix.SIMD_AVAILABLE = (glMatrix.ARRAY_TYPE === Float32Array) && (typeof SIMD != 'undefined');
glMatrix.USE_SIMD       = glMatrix.ENABLE_SIMD && glMatrix.SIMD_AVAILABLE;

/**
 * Sets the type of array used when creating new vectors and matrices
 *
 * @param {Type} type Array type, such as Float32Array or Array
 */
glMatrix.setMatrixArrayType = function(type) {
    glMatrix.ARRAY_TYPE = type;
}

var degree = Math.PI / 180;

/**
* Convert Degree To Radian
*
* @param {Number} a Angle in Degrees
*/
glMatrix.toRadian = function(a){
     return a * degree;
}

/**
 * Tests whether or not the arguments have approximately the same value, within an absolute
 * or relative tolerance of glMatrix.EPSILON (an absolute tolerance is used for values less
 * than or equal to 1.0, and a relative tolerance is used for larger values)
 *
 * @param {Number} a The first number to test.
 * @param {Number} b The second number to test.
 * @returns {Boolean} True if the numbers are approximately equal, false otherwise.
 */
glMatrix.equals = function(a, b) {
	return Math.abs(a - b) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a), Math.abs(b));
}

module.exports = glMatrix;

},{}],10:[function(require,module,exports){
/**
 * @fileoverview gl-matrix - High performance matrix and vector operations
 * @author Brandon Jones
 * @author Colin MacKenzie IV
 * @version 2.3.2
 */

/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */
// END HEADER

exports.glMatrix = require("./common.js");
exports.mat2     = require("./mat2.js");
exports.mat2d    = require("./mat2d.js");
exports.mat3     = require("./mat3.js");
exports.mat4     = require("./mat4.js");
exports.quat     = require("./quat.js");
exports.vec2     = require("./vec2.js");
exports.vec3     = require("./vec3.js");
exports.vec4     = require("./vec4.js");
},{"./common.js":9,"./mat2.js":11,"./mat2d.js":12,"./mat3.js":13,"./mat4.js":14,"./quat.js":15,"./vec2.js":16,"./vec3.js":17,"./vec4.js":18}],11:[function(require,module,exports){
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix = require("./common.js");

/**
 * @class 2x2 Matrix
 * @name mat2
 */
var mat2 = {};

/**
 * Creates a new identity mat2
 *
 * @returns {mat2} a new 2x2 matrix
 */
mat2.create = function() {
    var out = new glMatrix.ARRAY_TYPE(4);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Creates a new mat2 initialized with values from an existing matrix
 *
 * @param {mat2} a matrix to clone
 * @returns {mat2} a new 2x2 matrix
 */
mat2.clone = function(a) {
    var out = new glMatrix.ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Copy the values from one mat2 to another
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set a mat2 to the identity matrix
 *
 * @param {mat2} out the receiving matrix
 * @returns {mat2} out
 */
mat2.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Create a new mat2 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m10 Component in column 1, row 0 position (index 2)
 * @param {Number} m11 Component in column 1, row 1 position (index 3)
 * @returns {mat2} out A new 2x2 matrix
 */
mat2.fromValues = function(m00, m01, m10, m11) {
    var out = new glMatrix.ARRAY_TYPE(4);
    out[0] = m00;
    out[1] = m01;
    out[2] = m10;
    out[3] = m11;
    return out;
};

/**
 * Set the components of a mat2 to the given values
 *
 * @param {mat2} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m10 Component in column 1, row 0 position (index 2)
 * @param {Number} m11 Component in column 1, row 1 position (index 3)
 * @returns {mat2} out
 */
mat2.set = function(out, m00, m01, m10, m11) {
    out[0] = m00;
    out[1] = m01;
    out[2] = m10;
    out[3] = m11;
    return out;
};


/**
 * Transpose the values of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a1 = a[1];
        out[1] = a[2];
        out[2] = a1;
    } else {
        out[0] = a[0];
        out[1] = a[2];
        out[2] = a[1];
        out[3] = a[3];
    }
    
    return out;
};

/**
 * Inverts a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],

        // Calculate the determinant
        det = a0 * a3 - a2 * a1;

    if (!det) {
        return null;
    }
    det = 1.0 / det;
    
    out[0] =  a3 * det;
    out[1] = -a1 * det;
    out[2] = -a2 * det;
    out[3] =  a0 * det;

    return out;
};

/**
 * Calculates the adjugate of a mat2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the source matrix
 * @returns {mat2} out
 */
mat2.adjoint = function(out, a) {
    // Caching this value is nessecary if out == a
    var a0 = a[0];
    out[0] =  a[3];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] =  a0;

    return out;
};

/**
 * Calculates the determinant of a mat2
 *
 * @param {mat2} a the source matrix
 * @returns {Number} determinant of a
 */
mat2.determinant = function (a) {
    return a[0] * a[3] - a[2] * a[1];
};

/**
 * Multiplies two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */
mat2.multiply = function (out, a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = a0 * b0 + a2 * b1;
    out[1] = a1 * b0 + a3 * b1;
    out[2] = a0 * b2 + a2 * b3;
    out[3] = a1 * b2 + a3 * b3;
    return out;
};

/**
 * Alias for {@link mat2.multiply}
 * @function
 */
mat2.mul = mat2.multiply;

/**
 * Rotates a mat2 by the given angle
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */
mat2.rotate = function (out, a, rad) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        s = Math.sin(rad),
        c = Math.cos(rad);
    out[0] = a0 *  c + a2 * s;
    out[1] = a1 *  c + a3 * s;
    out[2] = a0 * -s + a2 * c;
    out[3] = a1 * -s + a3 * c;
    return out;
};

/**
 * Scales the mat2 by the dimensions in the given vec2
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2} out
 **/
mat2.scale = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        v0 = v[0], v1 = v[1];
    out[0] = a0 * v0;
    out[1] = a1 * v0;
    out[2] = a2 * v1;
    out[3] = a3 * v1;
    return out;
};

/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat2.identity(dest);
 *     mat2.rotate(dest, dest, rad);
 *
 * @param {mat2} out mat2 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2} out
 */
mat2.fromRotation = function(out, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad);
    out[0] = c;
    out[1] = s;
    out[2] = -s;
    out[3] = c;
    return out;
}

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat2.identity(dest);
 *     mat2.scale(dest, dest, vec);
 *
 * @param {mat2} out mat2 receiving operation result
 * @param {vec2} v Scaling vector
 * @returns {mat2} out
 */
mat2.fromScaling = function(out, v) {
    out[0] = v[0];
    out[1] = 0;
    out[2] = 0;
    out[3] = v[1];
    return out;
}

/**
 * Returns a string representation of a mat2
 *
 * @param {mat2} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat2.str = function (a) {
    return 'mat2(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

/**
 * Returns Frobenius norm of a mat2
 *
 * @param {mat2} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat2.frob = function (a) {
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2)))
};

/**
 * Returns L, D and U matrices (Lower triangular, Diagonal and Upper triangular) by factorizing the input matrix
 * @param {mat2} L the lower triangular matrix 
 * @param {mat2} D the diagonal matrix 
 * @param {mat2} U the upper triangular matrix 
 * @param {mat2} a the input matrix to factorize
 */

mat2.LDU = function (L, D, U, a) { 
    L[2] = a[2]/a[0]; 
    U[0] = a[0]; 
    U[1] = a[1]; 
    U[3] = a[3] - L[2] * U[1]; 
    return [L, D, U];       
}; 

/**
 * Adds two mat2's
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */
mat2.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    return out;
};

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @returns {mat2} out
 */
mat2.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    return out;
};

/**
 * Alias for {@link mat2.subtract}
 * @function
 */
mat2.sub = mat2.subtract;

/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {mat2} a The first matrix.
 * @param {mat2} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
mat2.exactEquals = function (a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
};

/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {mat2} a The first matrix.
 * @param {mat2} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
mat2.equals = function (a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    return (Math.abs(a0 - b0) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
            Math.abs(a3 - b3) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a3), Math.abs(b3)));
};

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat2} out the receiving matrix
 * @param {mat2} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat2} out
 */
mat2.multiplyScalar = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    return out;
};

/**
 * Adds two mat2's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat2} out the receiving vector
 * @param {mat2} a the first operand
 * @param {mat2} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat2} out
 */
mat2.multiplyScalarAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    out[3] = a[3] + (b[3] * scale);
    return out;
};

module.exports = mat2;

},{"./common.js":9}],12:[function(require,module,exports){
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix = require("./common.js");

/**
 * @class 2x3 Matrix
 * @name mat2d
 * 
 * @description 
 * A mat2d contains six elements defined as:
 * <pre>
 * [a, c, tx,
 *  b, d, ty]
 * </pre>
 * This is a short form for the 3x3 matrix:
 * <pre>
 * [a, c, tx,
 *  b, d, ty,
 *  0, 0, 1]
 * </pre>
 * The last row is ignored so the array is shorter and operations are faster.
 */
var mat2d = {};

/**
 * Creates a new identity mat2d
 *
 * @returns {mat2d} a new 2x3 matrix
 */
mat2d.create = function() {
    var out = new glMatrix.ARRAY_TYPE(6);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
};

/**
 * Creates a new mat2d initialized with values from an existing matrix
 *
 * @param {mat2d} a matrix to clone
 * @returns {mat2d} a new 2x3 matrix
 */
mat2d.clone = function(a) {
    var out = new glMatrix.ARRAY_TYPE(6);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
};

/**
 * Copy the values from one mat2d to another
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */
mat2d.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    return out;
};

/**
 * Set a mat2d to the identity matrix
 *
 * @param {mat2d} out the receiving matrix
 * @returns {mat2d} out
 */
mat2d.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = 0;
    out[5] = 0;
    return out;
};

/**
 * Create a new mat2d with the given values
 *
 * @param {Number} a Component A (index 0)
 * @param {Number} b Component B (index 1)
 * @param {Number} c Component C (index 2)
 * @param {Number} d Component D (index 3)
 * @param {Number} tx Component TX (index 4)
 * @param {Number} ty Component TY (index 5)
 * @returns {mat2d} A new mat2d
 */
mat2d.fromValues = function(a, b, c, d, tx, ty) {
    var out = new glMatrix.ARRAY_TYPE(6);
    out[0] = a;
    out[1] = b;
    out[2] = c;
    out[3] = d;
    out[4] = tx;
    out[5] = ty;
    return out;
};

/**
 * Set the components of a mat2d to the given values
 *
 * @param {mat2d} out the receiving matrix
 * @param {Number} a Component A (index 0)
 * @param {Number} b Component B (index 1)
 * @param {Number} c Component C (index 2)
 * @param {Number} d Component D (index 3)
 * @param {Number} tx Component TX (index 4)
 * @param {Number} ty Component TY (index 5)
 * @returns {mat2d} out
 */
mat2d.set = function(out, a, b, c, d, tx, ty) {
    out[0] = a;
    out[1] = b;
    out[2] = c;
    out[3] = d;
    out[4] = tx;
    out[5] = ty;
    return out;
};

/**
 * Inverts a mat2d
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the source matrix
 * @returns {mat2d} out
 */
mat2d.invert = function(out, a) {
    var aa = a[0], ab = a[1], ac = a[2], ad = a[3],
        atx = a[4], aty = a[5];

    var det = aa * ad - ab * ac;
    if(!det){
        return null;
    }
    det = 1.0 / det;

    out[0] = ad * det;
    out[1] = -ab * det;
    out[2] = -ac * det;
    out[3] = aa * det;
    out[4] = (ac * aty - ad * atx) * det;
    out[5] = (ab * atx - aa * aty) * det;
    return out;
};

/**
 * Calculates the determinant of a mat2d
 *
 * @param {mat2d} a the source matrix
 * @returns {Number} determinant of a
 */
mat2d.determinant = function (a) {
    return a[0] * a[3] - a[1] * a[2];
};

/**
 * Multiplies two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @returns {mat2d} out
 */
mat2d.multiply = function (out, a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];
    out[0] = a0 * b0 + a2 * b1;
    out[1] = a1 * b0 + a3 * b1;
    out[2] = a0 * b2 + a2 * b3;
    out[3] = a1 * b2 + a3 * b3;
    out[4] = a0 * b4 + a2 * b5 + a4;
    out[5] = a1 * b4 + a3 * b5 + a5;
    return out;
};

/**
 * Alias for {@link mat2d.multiply}
 * @function
 */
mat2d.mul = mat2d.multiply;

/**
 * Rotates a mat2d by the given angle
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */
mat2d.rotate = function (out, a, rad) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        s = Math.sin(rad),
        c = Math.cos(rad);
    out[0] = a0 *  c + a2 * s;
    out[1] = a1 *  c + a3 * s;
    out[2] = a0 * -s + a2 * c;
    out[3] = a1 * -s + a3 * c;
    out[4] = a4;
    out[5] = a5;
    return out;
};

/**
 * Scales the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat2d} out
 **/
mat2d.scale = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        v0 = v[0], v1 = v[1];
    out[0] = a0 * v0;
    out[1] = a1 * v0;
    out[2] = a2 * v1;
    out[3] = a3 * v1;
    out[4] = a4;
    out[5] = a5;
    return out;
};

/**
 * Translates the mat2d by the dimensions in the given vec2
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to translate
 * @param {vec2} v the vec2 to translate the matrix by
 * @returns {mat2d} out
 **/
mat2d.translate = function(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5],
        v0 = v[0], v1 = v[1];
    out[0] = a0;
    out[1] = a1;
    out[2] = a2;
    out[3] = a3;
    out[4] = a0 * v0 + a2 * v1 + a4;
    out[5] = a1 * v0 + a3 * v1 + a5;
    return out;
};

/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.rotate(dest, dest, rad);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat2d} out
 */
mat2d.fromRotation = function(out, rad) {
    var s = Math.sin(rad), c = Math.cos(rad);
    out[0] = c;
    out[1] = s;
    out[2] = -s;
    out[3] = c;
    out[4] = 0;
    out[5] = 0;
    return out;
}

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.scale(dest, dest, vec);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {vec2} v Scaling vector
 * @returns {mat2d} out
 */
mat2d.fromScaling = function(out, v) {
    out[0] = v[0];
    out[1] = 0;
    out[2] = 0;
    out[3] = v[1];
    out[4] = 0;
    out[5] = 0;
    return out;
}

/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat2d.identity(dest);
 *     mat2d.translate(dest, dest, vec);
 *
 * @param {mat2d} out mat2d receiving operation result
 * @param {vec2} v Translation vector
 * @returns {mat2d} out
 */
mat2d.fromTranslation = function(out, v) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    out[4] = v[0];
    out[5] = v[1];
    return out;
}

/**
 * Returns a string representation of a mat2d
 *
 * @param {mat2d} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat2d.str = function (a) {
    return 'mat2d(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + 
                    a[3] + ', ' + a[4] + ', ' + a[5] + ')';
};

/**
 * Returns Frobenius norm of a mat2d
 *
 * @param {mat2d} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat2d.frob = function (a) { 
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + 1))
}; 

/**
 * Adds two mat2d's
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @returns {mat2d} out
 */
mat2d.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    out[4] = a[4] + b[4];
    out[5] = a[5] + b[5];
    return out;
};

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @returns {mat2d} out
 */
mat2d.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    out[4] = a[4] - b[4];
    out[5] = a[5] - b[5];
    return out;
};

/**
 * Alias for {@link mat2d.subtract}
 * @function
 */
mat2d.sub = mat2d.subtract;

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat2d} out the receiving matrix
 * @param {mat2d} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat2d} out
 */
mat2d.multiplyScalar = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    out[4] = a[4] * b;
    out[5] = a[5] * b;
    return out;
};

/**
 * Adds two mat2d's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat2d} out the receiving vector
 * @param {mat2d} a the first operand
 * @param {mat2d} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat2d} out
 */
mat2d.multiplyScalarAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    out[3] = a[3] + (b[3] * scale);
    out[4] = a[4] + (b[4] * scale);
    out[5] = a[5] + (b[5] * scale);
    return out;
};

/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {mat2d} a The first matrix.
 * @param {mat2d} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
mat2d.exactEquals = function (a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5];
};

/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {mat2d} a The first matrix.
 * @param {mat2d} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
mat2d.equals = function (a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];
    return (Math.abs(a0 - b0) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
            Math.abs(a3 - b3) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
            Math.abs(a4 - b4) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
            Math.abs(a5 - b5) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a5), Math.abs(b5)));
};

module.exports = mat2d;

},{"./common.js":9}],13:[function(require,module,exports){
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix = require("./common.js");

/**
 * @class 3x3 Matrix
 * @name mat3
 */
var mat3 = {};

/**
 * Creates a new identity mat3
 *
 * @returns {mat3} a new 3x3 matrix
 */
mat3.create = function() {
    var out = new glMatrix.ARRAY_TYPE(9);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Copies the upper-left 3x3 values into the given mat3.
 *
 * @param {mat3} out the receiving 3x3 matrix
 * @param {mat4} a   the source 4x4 matrix
 * @returns {mat3} out
 */
mat3.fromMat4 = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[4];
    out[4] = a[5];
    out[5] = a[6];
    out[6] = a[8];
    out[7] = a[9];
    out[8] = a[10];
    return out;
};

/**
 * Creates a new mat3 initialized with values from an existing matrix
 *
 * @param {mat3} a matrix to clone
 * @returns {mat3} a new 3x3 matrix
 */
mat3.clone = function(a) {
    var out = new glMatrix.ARRAY_TYPE(9);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Copy the values from one mat3 to another
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Create a new mat3 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m10 Component in column 1, row 0 position (index 3)
 * @param {Number} m11 Component in column 1, row 1 position (index 4)
 * @param {Number} m12 Component in column 1, row 2 position (index 5)
 * @param {Number} m20 Component in column 2, row 0 position (index 6)
 * @param {Number} m21 Component in column 2, row 1 position (index 7)
 * @param {Number} m22 Component in column 2, row 2 position (index 8)
 * @returns {mat3} A new mat3
 */
mat3.fromValues = function(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
    var out = new glMatrix.ARRAY_TYPE(9);
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m10;
    out[4] = m11;
    out[5] = m12;
    out[6] = m20;
    out[7] = m21;
    out[8] = m22;
    return out;
};

/**
 * Set the components of a mat3 to the given values
 *
 * @param {mat3} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m10 Component in column 1, row 0 position (index 3)
 * @param {Number} m11 Component in column 1, row 1 position (index 4)
 * @param {Number} m12 Component in column 1, row 2 position (index 5)
 * @param {Number} m20 Component in column 2, row 0 position (index 6)
 * @param {Number} m21 Component in column 2, row 1 position (index 7)
 * @param {Number} m22 Component in column 2, row 2 position (index 8)
 * @returns {mat3} out
 */
mat3.set = function(out, m00, m01, m02, m10, m11, m12, m20, m21, m22) {
    out[0] = m00;
    out[1] = m01;
    out[2] = m02;
    out[3] = m10;
    out[4] = m11;
    out[5] = m12;
    out[6] = m20;
    out[7] = m21;
    out[8] = m22;
    return out;
};

/**
 * Set a mat3 to the identity matrix
 *
 * @param {mat3} out the receiving matrix
 * @returns {mat3} out
 */
mat3.identity = function(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
};

/**
 * Transpose the values of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.transpose = function(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a12 = a[5];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a01;
        out[5] = a[7];
        out[6] = a02;
        out[7] = a12;
    } else {
        out[0] = a[0];
        out[1] = a[3];
        out[2] = a[6];
        out[3] = a[1];
        out[4] = a[4];
        out[5] = a[7];
        out[6] = a[2];
        out[7] = a[5];
        out[8] = a[8];
    }

    return out;
};

/**
 * Inverts a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.invert = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b01 = a22 * a11 - a12 * a21,
        b11 = -a22 * a10 + a12 * a20,
        b21 = a21 * a10 - a11 * a20,

        // Calculate the determinant
        det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) {
        return null;
    }
    det = 1.0 / det;

    out[0] = b01 * det;
    out[1] = (-a22 * a01 + a02 * a21) * det;
    out[2] = (a12 * a01 - a02 * a11) * det;
    out[3] = b11 * det;
    out[4] = (a22 * a00 - a02 * a20) * det;
    out[5] = (-a12 * a00 + a02 * a10) * det;
    out[6] = b21 * det;
    out[7] = (-a21 * a00 + a01 * a20) * det;
    out[8] = (a11 * a00 - a01 * a10) * det;
    return out;
};

/**
 * Calculates the adjugate of a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the source matrix
 * @returns {mat3} out
 */
mat3.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    out[0] = (a11 * a22 - a12 * a21);
    out[1] = (a02 * a21 - a01 * a22);
    out[2] = (a01 * a12 - a02 * a11);
    out[3] = (a12 * a20 - a10 * a22);
    out[4] = (a00 * a22 - a02 * a20);
    out[5] = (a02 * a10 - a00 * a12);
    out[6] = (a10 * a21 - a11 * a20);
    out[7] = (a01 * a20 - a00 * a21);
    out[8] = (a00 * a11 - a01 * a10);
    return out;
};

/**
 * Calculates the determinant of a mat3
 *
 * @param {mat3} a the source matrix
 * @returns {Number} determinant of a
 */
mat3.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
};

/**
 * Multiplies two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
mat3.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b00 = b[0], b01 = b[1], b02 = b[2],
        b10 = b[3], b11 = b[4], b12 = b[5],
        b20 = b[6], b21 = b[7], b22 = b[8];

    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
    out[2] = b00 * a02 + b01 * a12 + b02 * a22;

    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
    out[5] = b10 * a02 + b11 * a12 + b12 * a22;

    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
};

/**
 * Alias for {@link mat3.multiply}
 * @function
 */
mat3.mul = mat3.multiply;

/**
 * Translate a mat3 by the given vector
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to translate
 * @param {vec2} v vector to translate by
 * @returns {mat3} out
 */
mat3.translate = function(out, a, v) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],
        x = v[0], y = v[1];

    out[0] = a00;
    out[1] = a01;
    out[2] = a02;

    out[3] = a10;
    out[4] = a11;
    out[5] = a12;

    out[6] = x * a00 + y * a10 + a20;
    out[7] = x * a01 + y * a11 + a21;
    out[8] = x * a02 + y * a12 + a22;
    return out;
};

/**
 * Rotates a mat3 by the given angle
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
mat3.rotate = function (out, a, rad) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        s = Math.sin(rad),
        c = Math.cos(rad);

    out[0] = c * a00 + s * a10;
    out[1] = c * a01 + s * a11;
    out[2] = c * a02 + s * a12;

    out[3] = c * a10 - s * a00;
    out[4] = c * a11 - s * a01;
    out[5] = c * a12 - s * a02;

    out[6] = a20;
    out[7] = a21;
    out[8] = a22;
    return out;
};

/**
 * Scales the mat3 by the dimensions in the given vec2
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to rotate
 * @param {vec2} v the vec2 to scale the matrix by
 * @returns {mat3} out
 **/
mat3.scale = function(out, a, v) {
    var x = v[0], y = v[1];

    out[0] = x * a[0];
    out[1] = x * a[1];
    out[2] = x * a[2];

    out[3] = y * a[3];
    out[4] = y * a[4];
    out[5] = y * a[5];

    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.translate(dest, dest, vec);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {vec2} v Translation vector
 * @returns {mat3} out
 */
mat3.fromTranslation = function(out, v) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = v[0];
    out[7] = v[1];
    out[8] = 1;
    return out;
}

/**
 * Creates a matrix from a given angle
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.rotate(dest, dest, rad);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat3} out
 */
mat3.fromRotation = function(out, rad) {
    var s = Math.sin(rad), c = Math.cos(rad);

    out[0] = c;
    out[1] = s;
    out[2] = 0;

    out[3] = -s;
    out[4] = c;
    out[5] = 0;

    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
}

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat3.identity(dest);
 *     mat3.scale(dest, dest, vec);
 *
 * @param {mat3} out mat3 receiving operation result
 * @param {vec2} v Scaling vector
 * @returns {mat3} out
 */
mat3.fromScaling = function(out, v) {
    out[0] = v[0];
    out[1] = 0;
    out[2] = 0;

    out[3] = 0;
    out[4] = v[1];
    out[5] = 0;

    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
}

/**
 * Copies the values from a mat2d into a mat3
 *
 * @param {mat3} out the receiving matrix
 * @param {mat2d} a the matrix to copy
 * @returns {mat3} out
 **/
mat3.fromMat2d = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = 0;

    out[3] = a[2];
    out[4] = a[3];
    out[5] = 0;

    out[6] = a[4];
    out[7] = a[5];
    out[8] = 1;
    return out;
};

/**
* Calculates a 3x3 matrix from the given quaternion
*
* @param {mat3} out mat3 receiving operation result
* @param {quat} q Quaternion to create matrix from
*
* @returns {mat3} out
*/
mat3.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        yx = y * x2,
        yy = y * y2,
        zx = z * x2,
        zy = z * y2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - yy - zz;
    out[3] = yx - wz;
    out[6] = zx + wy;

    out[1] = yx + wz;
    out[4] = 1 - xx - zz;
    out[7] = zy - wx;

    out[2] = zx - wy;
    out[5] = zy + wx;
    out[8] = 1 - xx - yy;

    return out;
};

/**
* Calculates a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
*
* @param {mat3} out mat3 receiving operation result
* @param {mat4} a Mat4 to derive the normal matrix from
*
* @returns {mat3} out
*/
mat3.normalFromMat4 = function (out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
        return null;
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

    out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

    out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

    return out;
};

/**
 * Returns a string representation of a mat3
 *
 * @param {mat3} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat3.str = function (a) {
    return 'mat3(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' +
                    a[3] + ', ' + a[4] + ', ' + a[5] + ', ' +
                    a[6] + ', ' + a[7] + ', ' + a[8] + ')';
};

/**
 * Returns Frobenius norm of a mat3
 *
 * @param {mat3} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat3.frob = function (a) {
    return(Math.sqrt(Math.pow(a[0], 2) + Math.pow(a[1], 2) + Math.pow(a[2], 2) + Math.pow(a[3], 2) + Math.pow(a[4], 2) + Math.pow(a[5], 2) + Math.pow(a[6], 2) + Math.pow(a[7], 2) + Math.pow(a[8], 2)))
};

/**
 * Adds two mat3's
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
mat3.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    out[4] = a[4] + b[4];
    out[5] = a[5] + b[5];
    out[6] = a[6] + b[6];
    out[7] = a[7] + b[7];
    out[8] = a[8] + b[8];
    return out;
};

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @returns {mat3} out
 */
mat3.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    out[4] = a[4] - b[4];
    out[5] = a[5] - b[5];
    out[6] = a[6] - b[6];
    out[7] = a[7] - b[7];
    out[8] = a[8] - b[8];
    return out;
};

/**
 * Alias for {@link mat3.subtract}
 * @function
 */
mat3.sub = mat3.subtract;

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat3} out the receiving matrix
 * @param {mat3} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat3} out
 */
mat3.multiplyScalar = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    out[4] = a[4] * b;
    out[5] = a[5] * b;
    out[6] = a[6] * b;
    out[7] = a[7] * b;
    out[8] = a[8] * b;
    return out;
};

/**
 * Adds two mat3's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat3} out the receiving vector
 * @param {mat3} a the first operand
 * @param {mat3} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat3} out
 */
mat3.multiplyScalarAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    out[3] = a[3] + (b[3] * scale);
    out[4] = a[4] + (b[4] * scale);
    out[5] = a[5] + (b[5] * scale);
    out[6] = a[6] + (b[6] * scale);
    out[7] = a[7] + (b[7] * scale);
    out[8] = a[8] + (b[8] * scale);
    return out;
};

/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {mat3} a The first matrix.
 * @param {mat3} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
mat3.exactEquals = function (a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] &&
           a[3] === b[3] && a[4] === b[4] && a[5] === b[5] &&
           a[6] === b[6] && a[7] === b[7] && a[8] === b[8];
};

/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {mat3} a The first matrix.
 * @param {mat3} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
mat3.equals = function (a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7], a8 = a[8];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7], b8 = b[8];
    return (Math.abs(a0 - b0) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
            Math.abs(a3 - b3) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a3), Math.abs(b3)) &&
            Math.abs(a4 - b4) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a4), Math.abs(b4)) &&
            Math.abs(a5 - b5) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a5), Math.abs(b5)) &&
            Math.abs(a6 - b6) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a6), Math.abs(b6)) &&
            Math.abs(a7 - b7) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a7), Math.abs(b7)) &&
            Math.abs(a8 - b8) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a8), Math.abs(b8)));
};


module.exports = mat3;

},{"./common.js":9}],14:[function(require,module,exports){
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix = require( "./common.js" );

/**
 * @class 4x4 Matrix
 * @name mat4
 */
var mat4 = {
	scalar:
	{},
	SIMD:
	{}
};

/**
 * Creates a new identity mat4
 *
 * @returns {mat4} a new 4x4 matrix
 */
mat4.create = function()
{
	var out = new glMatrix.ARRAY_TYPE( 16 );
	out[ 0 ] = 1;
	out[ 1 ] = 0;
	out[ 2 ] = 0;
	out[ 3 ] = 0;
	out[ 4 ] = 0;
	out[ 5 ] = 1;
	out[ 6 ] = 0;
	out[ 7 ] = 0;
	out[ 8 ] = 0;
	out[ 9 ] = 0;
	out[ 10 ] = 1;
	out[ 11 ] = 0;
	out[ 12 ] = 0;
	out[ 13 ] = 0;
	out[ 14 ] = 0;
	out[ 15 ] = 1;
	return out;
};

/**
 * Creates a new mat4 initialized with values from an existing matrix
 *
 * @param {mat4} a matrix to clone
 * @returns {mat4} a new 4x4 matrix
 */
mat4.clone = function( a )
{
	var out = new glMatrix.ARRAY_TYPE( 16 );
	out[ 0 ] = a[ 0 ];
	out[ 1 ] = a[ 1 ];
	out[ 2 ] = a[ 2 ];
	out[ 3 ] = a[ 3 ];
	out[ 4 ] = a[ 4 ];
	out[ 5 ] = a[ 5 ];
	out[ 6 ] = a[ 6 ];
	out[ 7 ] = a[ 7 ];
	out[ 8 ] = a[ 8 ];
	out[ 9 ] = a[ 9 ];
	out[ 10 ] = a[ 10 ];
	out[ 11 ] = a[ 11 ];
	out[ 12 ] = a[ 12 ];
	out[ 13 ] = a[ 13 ];
	out[ 14 ] = a[ 14 ];
	out[ 15 ] = a[ 15 ];
	return out;
};

/**
 * Copy the values from one mat4 to another
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.copy = function( out, a )
{
	out[ 0 ] = a[ 0 ];
	out[ 1 ] = a[ 1 ];
	out[ 2 ] = a[ 2 ];
	out[ 3 ] = a[ 3 ];
	out[ 4 ] = a[ 4 ];
	out[ 5 ] = a[ 5 ];
	out[ 6 ] = a[ 6 ];
	out[ 7 ] = a[ 7 ];
	out[ 8 ] = a[ 8 ];
	out[ 9 ] = a[ 9 ];
	out[ 10 ] = a[ 10 ];
	out[ 11 ] = a[ 11 ];
	out[ 12 ] = a[ 12 ];
	out[ 13 ] = a[ 13 ];
	out[ 14 ] = a[ 14 ];
	out[ 15 ] = a[ 15 ];
	return out;
};

/**
 * Create a new mat4 with the given values
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} A new mat4
 */
mat4.fromValues = function( m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33 )
{
	var out = new glMatrix.ARRAY_TYPE( 16 );
	out[ 0 ] = m00;
	out[ 1 ] = m01;
	out[ 2 ] = m02;
	out[ 3 ] = m03;
	out[ 4 ] = m10;
	out[ 5 ] = m11;
	out[ 6 ] = m12;
	out[ 7 ] = m13;
	out[ 8 ] = m20;
	out[ 9 ] = m21;
	out[ 10 ] = m22;
	out[ 11 ] = m23;
	out[ 12 ] = m30;
	out[ 13 ] = m31;
	out[ 14 ] = m32;
	out[ 15 ] = m33;
	return out;
};

/**
 * Set the components of a mat4 to the given values
 *
 * @param {mat4} out the receiving matrix
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} out
 */
mat4.set = function( out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33 )
{
	out[ 0 ] = m00;
	out[ 1 ] = m01;
	out[ 2 ] = m02;
	out[ 3 ] = m03;
	out[ 4 ] = m10;
	out[ 5 ] = m11;
	out[ 6 ] = m12;
	out[ 7 ] = m13;
	out[ 8 ] = m20;
	out[ 9 ] = m21;
	out[ 10 ] = m22;
	out[ 11 ] = m23;
	out[ 12 ] = m30;
	out[ 13 ] = m31;
	out[ 14 ] = m32;
	out[ 15 ] = m33;
	return out;
};


/**
 * Set a mat4 to the identity matrix
 *
 * @param {mat4} out the receiving matrix
 * @returns {mat4} out
 */
mat4.identity = function( out )
{
	out[ 0 ] = 1;
	out[ 1 ] = 0;
	out[ 2 ] = 0;
	out[ 3 ] = 0;
	out[ 4 ] = 0;
	out[ 5 ] = 1;
	out[ 6 ] = 0;
	out[ 7 ] = 0;
	out[ 8 ] = 0;
	out[ 9 ] = 0;
	out[ 10 ] = 1;
	out[ 11 ] = 0;
	out[ 12 ] = 0;
	out[ 13 ] = 0;
	out[ 14 ] = 0;
	out[ 15 ] = 1;
	return out;
};

/**
 * Transpose the values of a mat4 not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.scalar.transpose = function( out, a )
{
	// If we are transposing ourselves we can skip a few steps but have to cache some values
	if ( out === a )
	{
		var a01 = a[ 1 ],
			a02 = a[ 2 ],
			a03 = a[ 3 ],
			a12 = a[ 6 ],
			a13 = a[ 7 ],
			a23 = a[ 11 ];

		out[ 1 ] = a[ 4 ];
		out[ 2 ] = a[ 8 ];
		out[ 3 ] = a[ 12 ];
		out[ 4 ] = a01;
		out[ 6 ] = a[ 9 ];
		out[ 7 ] = a[ 13 ];
		out[ 8 ] = a02;
		out[ 9 ] = a12;
		out[ 11 ] = a[ 14 ];
		out[ 12 ] = a03;
		out[ 13 ] = a13;
		out[ 14 ] = a23;
	}
	else
	{
		out[ 0 ] = a[ 0 ];
		out[ 1 ] = a[ 4 ];
		out[ 2 ] = a[ 8 ];
		out[ 3 ] = a[ 12 ];
		out[ 4 ] = a[ 1 ];
		out[ 5 ] = a[ 5 ];
		out[ 6 ] = a[ 9 ];
		out[ 7 ] = a[ 13 ];
		out[ 8 ] = a[ 2 ];
		out[ 9 ] = a[ 6 ];
		out[ 10 ] = a[ 10 ];
		out[ 11 ] = a[ 14 ];
		out[ 12 ] = a[ 3 ];
		out[ 13 ] = a[ 7 ];
		out[ 14 ] = a[ 11 ];
		out[ 15 ] = a[ 15 ];
	}

	return out;
};

/**
 * Transpose the values of a mat4 using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.SIMD.transpose = function( out, a )
{
	var a0, a1, a2, a3,
		tmp01, tmp23,
		out0, out1, out2, out3;

	a0 = SIMD.Float32x4.load( a, 0 );
	a1 = SIMD.Float32x4.load( a, 4 );
	a2 = SIMD.Float32x4.load( a, 8 );
	a3 = SIMD.Float32x4.load( a, 12 );

	tmp01 = SIMD.Float32x4.shuffle( a0, a1, 0, 1, 4, 5 );
	tmp23 = SIMD.Float32x4.shuffle( a2, a3, 0, 1, 4, 5 );
	out0 = SIMD.Float32x4.shuffle( tmp01, tmp23, 0, 2, 4, 6 );
	out1 = SIMD.Float32x4.shuffle( tmp01, tmp23, 1, 3, 5, 7 );
	SIMD.Float32x4.store( out, 0, out0 );
	SIMD.Float32x4.store( out, 4, out1 );

	tmp01 = SIMD.Float32x4.shuffle( a0, a1, 2, 3, 6, 7 );
	tmp23 = SIMD.Float32x4.shuffle( a2, a3, 2, 3, 6, 7 );
	out2 = SIMD.Float32x4.shuffle( tmp01, tmp23, 0, 2, 4, 6 );
	out3 = SIMD.Float32x4.shuffle( tmp01, tmp23, 1, 3, 5, 7 );
	SIMD.Float32x4.store( out, 8, out2 );
	SIMD.Float32x4.store( out, 12, out3 );

	return out;
};

/**
 * Transpse a mat4 using SIMD if available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.transpose = glMatrix.USE_SIMD ? mat4.SIMD.transpose : mat4.scalar.transpose;

/**
 * Inverts a mat4 not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.scalar.invert = function( out, a )
{
	var a00 = a[ 0 ],
		a01 = a[ 1 ],
		a02 = a[ 2 ],
		a03 = a[ 3 ],
		a10 = a[ 4 ],
		a11 = a[ 5 ],
		a12 = a[ 6 ],
		a13 = a[ 7 ],
		a20 = a[ 8 ],
		a21 = a[ 9 ],
		a22 = a[ 10 ],
		a23 = a[ 11 ],
		a30 = a[ 12 ],
		a31 = a[ 13 ],
		a32 = a[ 14 ],
		a33 = a[ 15 ],

		b00 = a00 * a11 - a01 * a10,
		b01 = a00 * a12 - a02 * a10,
		b02 = a00 * a13 - a03 * a10,
		b03 = a01 * a12 - a02 * a11,
		b04 = a01 * a13 - a03 * a11,
		b05 = a02 * a13 - a03 * a12,
		b06 = a20 * a31 - a21 * a30,
		b07 = a20 * a32 - a22 * a30,
		b08 = a20 * a33 - a23 * a30,
		b09 = a21 * a32 - a22 * a31,
		b10 = a21 * a33 - a23 * a31,
		b11 = a22 * a33 - a23 * a32,

		// Calculate the determinant
		det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

	if ( !det )
	{
		return null;
	}
	det = 1.0 / det;

	out[ 0 ] = ( a11 * b11 - a12 * b10 + a13 * b09 ) * det;
	out[ 1 ] = ( a02 * b10 - a01 * b11 - a03 * b09 ) * det;
	out[ 2 ] = ( a31 * b05 - a32 * b04 + a33 * b03 ) * det;
	out[ 3 ] = ( a22 * b04 - a21 * b05 - a23 * b03 ) * det;
	out[ 4 ] = ( a12 * b08 - a10 * b11 - a13 * b07 ) * det;
	out[ 5 ] = ( a00 * b11 - a02 * b08 + a03 * b07 ) * det;
	out[ 6 ] = ( a32 * b02 - a30 * b05 - a33 * b01 ) * det;
	out[ 7 ] = ( a20 * b05 - a22 * b02 + a23 * b01 ) * det;
	out[ 8 ] = ( a10 * b10 - a11 * b08 + a13 * b06 ) * det;
	out[ 9 ] = ( a01 * b08 - a00 * b10 - a03 * b06 ) * det;
	out[ 10 ] = ( a30 * b04 - a31 * b02 + a33 * b00 ) * det;
	out[ 11 ] = ( a21 * b02 - a20 * b04 - a23 * b00 ) * det;
	out[ 12 ] = ( a11 * b07 - a10 * b09 - a12 * b06 ) * det;
	out[ 13 ] = ( a00 * b09 - a01 * b07 + a02 * b06 ) * det;
	out[ 14 ] = ( a31 * b01 - a30 * b03 - a32 * b00 ) * det;
	out[ 15 ] = ( a20 * b03 - a21 * b01 + a22 * b00 ) * det;

	return out;
};

/**
 * Inverts a mat4 using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.SIMD.invert = function( out, a )
{
	var row0, row1, row2, row3,
		tmp1,
		minor0, minor1, minor2, minor3,
		det,
		a0 = SIMD.Float32x4.load( a, 0 ),
		a1 = SIMD.Float32x4.load( a, 4 ),
		a2 = SIMD.Float32x4.load( a, 8 ),
		a3 = SIMD.Float32x4.load( a, 12 );

	// Compute matrix adjugate
	tmp1   = SIMD.Float32x4.shuffle( a0, a1, 0, 1, 4, 5 );
	row1   = SIMD.Float32x4.shuffle( a2, a3, 0, 1, 4, 5 );
	row0   = SIMD.Float32x4.shuffle( tmp1, row1, 0, 2, 4, 6 );
	row1   = SIMD.Float32x4.shuffle( row1, tmp1, 1, 3, 5, 7 );
	tmp1   = SIMD.Float32x4.shuffle( a0, a1, 2, 3, 6, 7 );
	row3   = SIMD.Float32x4.shuffle( a2, a3, 2, 3, 6, 7 );
	row2   = SIMD.Float32x4.shuffle( tmp1, row3, 0, 2, 4, 6 );
	row3   = SIMD.Float32x4.shuffle( row3, tmp1, 1, 3, 5, 7 );

	tmp1   = SIMD.Float32x4.mul( row2, row3 );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 1, 0, 3, 2 );
	minor0 = SIMD.Float32x4.mul( row1, tmp1 );
	minor1 = SIMD.Float32x4.mul( row0, tmp1 );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 2, 3, 0, 1 );
	minor0 = SIMD.Float32x4.sub( SIMD.Float32x4.mul( row1, tmp1 ), minor0 );
	minor1 = SIMD.Float32x4.sub( SIMD.Float32x4.mul( row0, tmp1 ), minor1 );
	minor1 = SIMD.Float32x4.swizzle( minor1, 2, 3, 0, 1 );

	tmp1   = SIMD.Float32x4.mul( row1, row2 );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 1, 0, 3, 2 );
	minor0 = SIMD.Float32x4.add( SIMD.Float32x4.mul( row3, tmp1 ), minor0 );
	minor3 = SIMD.Float32x4.mul( row0, tmp1 );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 2, 3, 0, 1 );
	minor0 = SIMD.Float32x4.sub( minor0, SIMD.Float32x4.mul( row3, tmp1 ) );
	minor3 = SIMD.Float32x4.sub( SIMD.Float32x4.mul( row0, tmp1 ), minor3 );
	minor3 = SIMD.Float32x4.swizzle( minor3, 2, 3, 0, 1 );

	tmp1   = SIMD.Float32x4.mul( SIMD.Float32x4.swizzle( row1, 2, 3, 0, 1 ), row3 );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 1, 0, 3, 2 );
	row2   = SIMD.Float32x4.swizzle( row2, 2, 3, 0, 1 );
	minor0 = SIMD.Float32x4.add( SIMD.Float32x4.mul( row2, tmp1 ), minor0 );
	minor2 = SIMD.Float32x4.mul( row0, tmp1 );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 2, 3, 0, 1 );
	minor0 = SIMD.Float32x4.sub( minor0, SIMD.Float32x4.mul( row2, tmp1 ) );
	minor2 = SIMD.Float32x4.sub( SIMD.Float32x4.mul( row0, tmp1 ), minor2 );
	minor2 = SIMD.Float32x4.swizzle( minor2, 2, 3, 0, 1 );

	tmp1   = SIMD.Float32x4.mul( row0, row1 );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 1, 0, 3, 2 );
	minor2 = SIMD.Float32x4.add( SIMD.Float32x4.mul( row3, tmp1 ), minor2 );
	minor3 = SIMD.Float32x4.sub( SIMD.Float32x4.mul( row2, tmp1 ), minor3 );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 2, 3, 0, 1 );
	minor2 = SIMD.Float32x4.sub( SIMD.Float32x4.mul( row3, tmp1 ), minor2 );
	minor3 = SIMD.Float32x4.sub( minor3, SIMD.Float32x4.mul( row2, tmp1 ) );

	tmp1   = SIMD.Float32x4.mul( row0, row3 );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 1, 0, 3, 2 );
	minor1 = SIMD.Float32x4.sub( minor1, SIMD.Float32x4.mul( row2, tmp1 ) );
	minor2 = SIMD.Float32x4.add( SIMD.Float32x4.mul( row1, tmp1 ), minor2 );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 2, 3, 0, 1 );
	minor1 = SIMD.Float32x4.add( SIMD.Float32x4.mul( row2, tmp1 ), minor1 );
	minor2 = SIMD.Float32x4.sub( minor2, SIMD.Float32x4.mul( row1, tmp1 ) );

	tmp1   = SIMD.Float32x4.mul( row0, row2 );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 1, 0, 3, 2 );
	minor1 = SIMD.Float32x4.add( SIMD.Float32x4.mul( row3, tmp1 ), minor1 );
	minor3 = SIMD.Float32x4.sub( minor3, SIMD.Float32x4.mul( row1, tmp1 ) );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 2, 3, 0, 1 );
	minor1 = SIMD.Float32x4.sub( minor1, SIMD.Float32x4.mul( row3, tmp1 ) );
	minor3 = SIMD.Float32x4.add( SIMD.Float32x4.mul( row1, tmp1 ), minor3 );

	// Compute matrix determinant
	det    = SIMD.Float32x4.mul( row0, minor0 );
	det    = SIMD.Float32x4.add( SIMD.Float32x4.swizzle( det, 2, 3, 0, 1 ), det );
	det    = SIMD.Float32x4.add( SIMD.Float32x4.swizzle( det, 1, 0, 3, 2 ), det );
	tmp1   = SIMD.Float32x4.reciprocalApproximation( det );
	det    = SIMD.Float32x4.sub(
		SIMD.Float32x4.add( tmp1, tmp1 ),
		SIMD.Float32x4.mul( det, SIMD.Float32x4.mul( tmp1, tmp1 ) ) );
	det    = SIMD.Float32x4.swizzle( det, 0, 0, 0, 0 );
	if ( !det )
	{
		return null;
	}

	// Compute matrix inverse
	SIMD.Float32x4.store( out, 0, SIMD.Float32x4.mul( det, minor0 ) );
	SIMD.Float32x4.store( out, 4, SIMD.Float32x4.mul( det, minor1 ) );
	SIMD.Float32x4.store( out, 8, SIMD.Float32x4.mul( det, minor2 ) );
	SIMD.Float32x4.store( out, 12, SIMD.Float32x4.mul( det, minor3 ) );
	return out;
}

/**
 * Inverts a mat4 using SIMD if available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.invert = glMatrix.USE_SIMD ? mat4.SIMD.invert : mat4.scalar.invert;

/**
 * Calculates the adjugate of a mat4 not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.scalar.adjoint = function( out, a )
{
	var a00 = a[ 0 ],
		a01 = a[ 1 ],
		a02 = a[ 2 ],
		a03 = a[ 3 ],
		a10 = a[ 4 ],
		a11 = a[ 5 ],
		a12 = a[ 6 ],
		a13 = a[ 7 ],
		a20 = a[ 8 ],
		a21 = a[ 9 ],
		a22 = a[ 10 ],
		a23 = a[ 11 ],
		a30 = a[ 12 ],
		a31 = a[ 13 ],
		a32 = a[ 14 ],
		a33 = a[ 15 ];

	out[ 0 ]  = ( a11 * ( a22 * a33 - a23 * a32 ) - a21 * ( a12 * a33 - a13 * a32 ) + a31 * ( a12 * a23 - a13 * a22 ) );
	out[ 1 ]  = -( a01 * ( a22 * a33 - a23 * a32 ) - a21 * ( a02 * a33 - a03 * a32 ) + a31 * ( a02 * a23 - a03 * a22 ) );
	out[ 2 ]  = ( a01 * ( a12 * a33 - a13 * a32 ) - a11 * ( a02 * a33 - a03 * a32 ) + a31 * ( a02 * a13 - a03 * a12 ) );
	out[ 3 ]  = -( a01 * ( a12 * a23 - a13 * a22 ) - a11 * ( a02 * a23 - a03 * a22 ) + a21 * ( a02 * a13 - a03 * a12 ) );
	out[ 4 ]  = -( a10 * ( a22 * a33 - a23 * a32 ) - a20 * ( a12 * a33 - a13 * a32 ) + a30 * ( a12 * a23 - a13 * a22 ) );
	out[ 5 ]  = ( a00 * ( a22 * a33 - a23 * a32 ) - a20 * ( a02 * a33 - a03 * a32 ) + a30 * ( a02 * a23 - a03 * a22 ) );
	out[ 6 ]  = -( a00 * ( a12 * a33 - a13 * a32 ) - a10 * ( a02 * a33 - a03 * a32 ) + a30 * ( a02 * a13 - a03 * a12 ) );
	out[ 7 ]  = ( a00 * ( a12 * a23 - a13 * a22 ) - a10 * ( a02 * a23 - a03 * a22 ) + a20 * ( a02 * a13 - a03 * a12 ) );
	out[ 8 ]  = ( a10 * ( a21 * a33 - a23 * a31 ) - a20 * ( a11 * a33 - a13 * a31 ) + a30 * ( a11 * a23 - a13 * a21 ) );
	out[ 9 ]  = -( a00 * ( a21 * a33 - a23 * a31 ) - a20 * ( a01 * a33 - a03 * a31 ) + a30 * ( a01 * a23 - a03 * a21 ) );
	out[ 10 ] = ( a00 * ( a11 * a33 - a13 * a31 ) - a10 * ( a01 * a33 - a03 * a31 ) + a30 * ( a01 * a13 - a03 * a11 ) );
	out[ 11 ] = -( a00 * ( a11 * a23 - a13 * a21 ) - a10 * ( a01 * a23 - a03 * a21 ) + a20 * ( a01 * a13 - a03 * a11 ) );
	out[ 12 ] = -( a10 * ( a21 * a32 - a22 * a31 ) - a20 * ( a11 * a32 - a12 * a31 ) + a30 * ( a11 * a22 - a12 * a21 ) );
	out[ 13 ] = ( a00 * ( a21 * a32 - a22 * a31 ) - a20 * ( a01 * a32 - a02 * a31 ) + a30 * ( a01 * a22 - a02 * a21 ) );
	out[ 14 ] = -( a00 * ( a11 * a32 - a12 * a31 ) - a10 * ( a01 * a32 - a02 * a31 ) + a30 * ( a01 * a12 - a02 * a11 ) );
	out[ 15 ] = ( a00 * ( a11 * a22 - a12 * a21 ) - a10 * ( a01 * a22 - a02 * a21 ) + a20 * ( a01 * a12 - a02 * a11 ) );
	return out;
};

/**
 * Calculates the adjugate of a mat4 using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.SIMD.adjoint = function( out, a )
{
	var a0, a1, a2, a3;
	var row0, row1, row2, row3;
	var tmp1;
	var minor0, minor1, minor2, minor3;

	a0     = SIMD.Float32x4.load( a, 0 );
	a1     = SIMD.Float32x4.load( a, 4 );
	a2     = SIMD.Float32x4.load( a, 8 );
	a3     = SIMD.Float32x4.load( a, 12 );

	// Transpose the source matrix.  Sort of.  Not a true transpose operation
	tmp1   = SIMD.Float32x4.shuffle( a0, a1, 0, 1, 4, 5 );
	row1   = SIMD.Float32x4.shuffle( a2, a3, 0, 1, 4, 5 );
	row0   = SIMD.Float32x4.shuffle( tmp1, row1, 0, 2, 4, 6 );
	row1   = SIMD.Float32x4.shuffle( row1, tmp1, 1, 3, 5, 7 );

	tmp1   = SIMD.Float32x4.shuffle( a0, a1, 2, 3, 6, 7 );
	row3   = SIMD.Float32x4.shuffle( a2, a3, 2, 3, 6, 7 );
	row2   = SIMD.Float32x4.shuffle( tmp1, row3, 0, 2, 4, 6 );
	row3   = SIMD.Float32x4.shuffle( row3, tmp1, 1, 3, 5, 7 );

	tmp1   = SIMD.Float32x4.mul( row2, row3 );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 1, 0, 3, 2 );
	minor0 = SIMD.Float32x4.mul( row1, tmp1 );
	minor1 = SIMD.Float32x4.mul( row0, tmp1 );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 2, 3, 0, 1 );
	minor0 = SIMD.Float32x4.sub( SIMD.Float32x4.mul( row1, tmp1 ), minor0 );
	minor1 = SIMD.Float32x4.sub( SIMD.Float32x4.mul( row0, tmp1 ), minor1 );
	minor1 = SIMD.Float32x4.swizzle( minor1, 2, 3, 0, 1 );

	tmp1   = SIMD.Float32x4.mul( row1, row2 );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 1, 0, 3, 2 );
	minor0 = SIMD.Float32x4.add( SIMD.Float32x4.mul( row3, tmp1 ), minor0 );
	minor3 = SIMD.Float32x4.mul( row0, tmp1 );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 2, 3, 0, 1 );
	minor0 = SIMD.Float32x4.sub( minor0, SIMD.Float32x4.mul( row3, tmp1 ) );
	minor3 = SIMD.Float32x4.sub( SIMD.Float32x4.mul( row0, tmp1 ), minor3 );
	minor3 = SIMD.Float32x4.swizzle( minor3, 2, 3, 0, 1 );

	tmp1   = SIMD.Float32x4.mul( SIMD.Float32x4.swizzle( row1, 2, 3, 0, 1 ), row3 );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 1, 0, 3, 2 );
	row2   = SIMD.Float32x4.swizzle( row2, 2, 3, 0, 1 );
	minor0 = SIMD.Float32x4.add( SIMD.Float32x4.mul( row2, tmp1 ), minor0 );
	minor2 = SIMD.Float32x4.mul( row0, tmp1 );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 2, 3, 0, 1 );
	minor0 = SIMD.Float32x4.sub( minor0, SIMD.Float32x4.mul( row2, tmp1 ) );
	minor2 = SIMD.Float32x4.sub( SIMD.Float32x4.mul( row0, tmp1 ), minor2 );
	minor2 = SIMD.Float32x4.swizzle( minor2, 2, 3, 0, 1 );

	tmp1   = SIMD.Float32x4.mul( row0, row1 );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 1, 0, 3, 2 );
	minor2 = SIMD.Float32x4.add( SIMD.Float32x4.mul( row3, tmp1 ), minor2 );
	minor3 = SIMD.Float32x4.sub( SIMD.Float32x4.mul( row2, tmp1 ), minor3 );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 2, 3, 0, 1 );
	minor2 = SIMD.Float32x4.sub( SIMD.Float32x4.mul( row3, tmp1 ), minor2 );
	minor3 = SIMD.Float32x4.sub( minor3, SIMD.Float32x4.mul( row2, tmp1 ) );

	tmp1   = SIMD.Float32x4.mul( row0, row3 );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 1, 0, 3, 2 );
	minor1 = SIMD.Float32x4.sub( minor1, SIMD.Float32x4.mul( row2, tmp1 ) );
	minor2 = SIMD.Float32x4.add( SIMD.Float32x4.mul( row1, tmp1 ), minor2 );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 2, 3, 0, 1 );
	minor1 = SIMD.Float32x4.add( SIMD.Float32x4.mul( row2, tmp1 ), minor1 );
	minor2 = SIMD.Float32x4.sub( minor2, SIMD.Float32x4.mul( row1, tmp1 ) );

	tmp1   = SIMD.Float32x4.mul( row0, row2 );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 1, 0, 3, 2 );
	minor1 = SIMD.Float32x4.add( SIMD.Float32x4.mul( row3, tmp1 ), minor1 );
	minor3 = SIMD.Float32x4.sub( minor3, SIMD.Float32x4.mul( row1, tmp1 ) );
	tmp1   = SIMD.Float32x4.swizzle( tmp1, 2, 3, 0, 1 );
	minor1 = SIMD.Float32x4.sub( minor1, SIMD.Float32x4.mul( row3, tmp1 ) );
	minor3 = SIMD.Float32x4.add( SIMD.Float32x4.mul( row1, tmp1 ), minor3 );

	SIMD.Float32x4.store( out, 0, minor0 );
	SIMD.Float32x4.store( out, 4, minor1 );
	SIMD.Float32x4.store( out, 8, minor2 );
	SIMD.Float32x4.store( out, 12, minor3 );
	return out;
};

/**
 * Calculates the adjugate of a mat4 using SIMD if available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
mat4.adjoint = glMatrix.USE_SIMD ? mat4.SIMD.adjoint : mat4.scalar.adjoint;

/**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} a the source matrix
 * @returns {Number} determinant of a
 */
mat4.determinant = function( a )
{
	var a00 = a[ 0 ],
		a01 = a[ 1 ],
		a02 = a[ 2 ],
		a03 = a[ 3 ],
		a10 = a[ 4 ],
		a11 = a[ 5 ],
		a12 = a[ 6 ],
		a13 = a[ 7 ],
		a20 = a[ 8 ],
		a21 = a[ 9 ],
		a22 = a[ 10 ],
		a23 = a[ 11 ],
		a30 = a[ 12 ],
		a31 = a[ 13 ],
		a32 = a[ 14 ],
		a33 = a[ 15 ],

		b00 = a00 * a11 - a01 * a10,
		b01 = a00 * a12 - a02 * a10,
		b02 = a00 * a13 - a03 * a10,
		b03 = a01 * a12 - a02 * a11,
		b04 = a01 * a13 - a03 * a11,
		b05 = a02 * a13 - a03 * a12,
		b06 = a20 * a31 - a21 * a30,
		b07 = a20 * a32 - a22 * a30,
		b08 = a20 * a33 - a23 * a30,
		b09 = a21 * a32 - a22 * a31,
		b10 = a21 * a33 - a23 * a31,
		b11 = a22 * a33 - a23 * a32;

	// Calculate the determinant
	return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
};

/**
 * Multiplies two mat4's explicitly using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand, must be a Float32Array
 * @param {mat4} b the second operand, must be a Float32Array
 * @returns {mat4} out
 */
mat4.SIMD.multiply = function( out, a, b )
{
	var a0 = SIMD.Float32x4.load( a, 0 );
	var a1 = SIMD.Float32x4.load( a, 4 );
	var a2 = SIMD.Float32x4.load( a, 8 );
	var a3 = SIMD.Float32x4.load( a, 12 );

	var b0 = SIMD.Float32x4.load( b, 0 );
	var out0 = SIMD.Float32x4.add(
		SIMD.Float32x4.mul( SIMD.Float32x4.swizzle( b0, 0, 0, 0, 0 ), a0 ),
		SIMD.Float32x4.add(
			SIMD.Float32x4.mul( SIMD.Float32x4.swizzle( b0, 1, 1, 1, 1 ), a1 ),
			SIMD.Float32x4.add(
				SIMD.Float32x4.mul( SIMD.Float32x4.swizzle( b0, 2, 2, 2, 2 ), a2 ),
				SIMD.Float32x4.mul( SIMD.Float32x4.swizzle( b0, 3, 3, 3, 3 ), a3 ) ) ) );
	SIMD.Float32x4.store( out, 0, out0 );

	var b1 = SIMD.Float32x4.load( b, 4 );
	var out1 = SIMD.Float32x4.add(
		SIMD.Float32x4.mul( SIMD.Float32x4.swizzle( b1, 0, 0, 0, 0 ), a0 ),
		SIMD.Float32x4.add(
			SIMD.Float32x4.mul( SIMD.Float32x4.swizzle( b1, 1, 1, 1, 1 ), a1 ),
			SIMD.Float32x4.add(
				SIMD.Float32x4.mul( SIMD.Float32x4.swizzle( b1, 2, 2, 2, 2 ), a2 ),
				SIMD.Float32x4.mul( SIMD.Float32x4.swizzle( b1, 3, 3, 3, 3 ), a3 ) ) ) );
	SIMD.Float32x4.store( out, 4, out1 );

	var b2 = SIMD.Float32x4.load( b, 8 );
	var out2 = SIMD.Float32x4.add(
		SIMD.Float32x4.mul( SIMD.Float32x4.swizzle( b2, 0, 0, 0, 0 ), a0 ),
		SIMD.Float32x4.add(
			SIMD.Float32x4.mul( SIMD.Float32x4.swizzle( b2, 1, 1, 1, 1 ), a1 ),
			SIMD.Float32x4.add(
				SIMD.Float32x4.mul( SIMD.Float32x4.swizzle( b2, 2, 2, 2, 2 ), a2 ),
				SIMD.Float32x4.mul( SIMD.Float32x4.swizzle( b2, 3, 3, 3, 3 ), a3 ) ) ) );
	SIMD.Float32x4.store( out, 8, out2 );

	var b3 = SIMD.Float32x4.load( b, 12 );
	var out3 = SIMD.Float32x4.add(
		SIMD.Float32x4.mul( SIMD.Float32x4.swizzle( b3, 0, 0, 0, 0 ), a0 ),
		SIMD.Float32x4.add(
			SIMD.Float32x4.mul( SIMD.Float32x4.swizzle( b3, 1, 1, 1, 1 ), a1 ),
			SIMD.Float32x4.add(
				SIMD.Float32x4.mul( SIMD.Float32x4.swizzle( b3, 2, 2, 2, 2 ), a2 ),
				SIMD.Float32x4.mul( SIMD.Float32x4.swizzle( b3, 3, 3, 3, 3 ), a3 ) ) ) );
	SIMD.Float32x4.store( out, 12, out3 );

	return out;
};

/**
 * Multiplies two mat4's explicitly not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
mat4.scalar.multiply = function( out, a, b )
{
	var a00 = a[ 0 ],
		a01 = a[ 1 ],
		a02 = a[ 2 ],
		a03 = a[ 3 ],
		a10 = a[ 4 ],
		a11 = a[ 5 ],
		a12 = a[ 6 ],
		a13 = a[ 7 ],
		a20 = a[ 8 ],
		a21 = a[ 9 ],
		a22 = a[ 10 ],
		a23 = a[ 11 ],
		a30 = a[ 12 ],
		a31 = a[ 13 ],
		a32 = a[ 14 ],
		a33 = a[ 15 ];

	// Cache only the current line of the second matrix
	var b0 = b[ 0 ],
		b1 = b[ 1 ],
		b2 = b[ 2 ],
		b3 = b[ 3 ];
	out[ 0 ] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[ 1 ] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[ 2 ] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[ 3 ] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

	b0 = b[ 4 ];
	b1 = b[ 5 ];
	b2 = b[ 6 ];
	b3 = b[ 7 ];
	out[ 4 ] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[ 5 ] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[ 6 ] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[ 7 ] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

	b0 = b[ 8 ];
	b1 = b[ 9 ];
	b2 = b[ 10 ];
	b3 = b[ 11 ];
	out[ 8 ] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[ 9 ] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[ 10 ] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[ 11 ] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

	b0 = b[ 12 ];
	b1 = b[ 13 ];
	b2 = b[ 14 ];
	b3 = b[ 15 ];
	out[ 12 ] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	out[ 13 ] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	out[ 14 ] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	out[ 15 ] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	return out;
};

/**
 * Multiplies two mat4's using SIMD if available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
mat4.multiply = glMatrix.USE_SIMD ? mat4.SIMD.multiply : mat4.scalar.multiply;

/**
 * Alias for {@link mat4.multiply}
 * @function
 */
mat4.mul = mat4.multiply;

/**
 * Translate a mat4 by the given vector not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
mat4.scalar.translate = function( out, a, v )
{
	var x = v[ 0 ],
		y = v[ 1 ],
		z = v[ 2 ],
		a00, a01, a02, a03,
		a10, a11, a12, a13,
		a20, a21, a22, a23;

	if ( a === out )
	{
		out[ 12 ] = a[ 0 ] * x + a[ 4 ] * y + a[ 8 ] * z + a[ 12 ];
		out[ 13 ] = a[ 1 ] * x + a[ 5 ] * y + a[ 9 ] * z + a[ 13 ];
		out[ 14 ] = a[ 2 ] * x + a[ 6 ] * y + a[ 10 ] * z + a[ 14 ];
		out[ 15 ] = a[ 3 ] * x + a[ 7 ] * y + a[ 11 ] * z + a[ 15 ];
	}
	else
	{
		a00 = a[ 0 ];
		a01 = a[ 1 ];
		a02 = a[ 2 ];
		a03 = a[ 3 ];
		a10 = a[ 4 ];
		a11 = a[ 5 ];
		a12 = a[ 6 ];
		a13 = a[ 7 ];
		a20 = a[ 8 ];
		a21 = a[ 9 ];
		a22 = a[ 10 ];
		a23 = a[ 11 ];

		out[ 0 ] = a00;
		out[ 1 ] = a01;
		out[ 2 ] = a02;
		out[ 3 ] = a03;
		out[ 4 ] = a10;
		out[ 5 ] = a11;
		out[ 6 ] = a12;
		out[ 7 ] = a13;
		out[ 8 ] = a20;
		out[ 9 ] = a21;
		out[ 10 ] = a22;
		out[ 11 ] = a23;

		out[ 12 ] = a00 * x + a10 * y + a20 * z + a[ 12 ];
		out[ 13 ] = a01 * x + a11 * y + a21 * z + a[ 13 ];
		out[ 14 ] = a02 * x + a12 * y + a22 * z + a[ 14 ];
		out[ 15 ] = a03 * x + a13 * y + a23 * z + a[ 15 ];
	}

	return out;
};

/**
 * Translates a mat4 by the given vector using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
mat4.SIMD.translate = function( out, a, v )
{
	var a0 = SIMD.Float32x4.load( a, 0 ),
		a1 = SIMD.Float32x4.load( a, 4 ),
		a2 = SIMD.Float32x4.load( a, 8 ),
		a3 = SIMD.Float32x4.load( a, 12 ),
		vec = SIMD.Float32x4( v[ 0 ], v[ 1 ], v[ 2 ], 0 );

	if ( a !== out )
	{
		out[ 0 ] = a[ 0 ];
		out[ 1 ] = a[ 1 ];
		out[ 2 ] = a[ 2 ];
		out[ 3 ] = a[ 3 ];
		out[ 4 ] = a[ 4 ];
		out[ 5 ] = a[ 5 ];
		out[ 6 ] = a[ 6 ];
		out[ 7 ] = a[ 7 ];
		out[ 8 ] = a[ 8 ];
		out[ 9 ] = a[ 9 ];
		out[ 10 ] = a[ 10 ];
		out[ 11 ] = a[ 11 ];
	}

	a0 = SIMD.Float32x4.mul( a0, SIMD.Float32x4.swizzle( vec, 0, 0, 0, 0 ) );
	a1 = SIMD.Float32x4.mul( a1, SIMD.Float32x4.swizzle( vec, 1, 1, 1, 1 ) );
	a2 = SIMD.Float32x4.mul( a2, SIMD.Float32x4.swizzle( vec, 2, 2, 2, 2 ) );

	var t0 = SIMD.Float32x4.add( a0, SIMD.Float32x4.add( a1, SIMD.Float32x4.add( a2, a3 ) ) );
	SIMD.Float32x4.store( out, 12, t0 );

	return out;
};

/**
 * Translates a mat4 by the given vector using SIMD if available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to translate
 * @param {vec3} v vector to translate by
 * @returns {mat4} out
 */
mat4.translate = glMatrix.USE_SIMD ? mat4.SIMD.translate : mat4.scalar.translate;

/**
 * Scales the mat4 by the dimensions in the given vec3 not using vectorization
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
mat4.scalar.scale = function( out, a, v )
{
	var x = v[ 0 ],
		y = v[ 1 ],
		z = v[ 2 ];

	out[ 0 ] = a[ 0 ] * x;
	out[ 1 ] = a[ 1 ] * x;
	out[ 2 ] = a[ 2 ] * x;
	out[ 3 ] = a[ 3 ] * x;
	out[ 4 ] = a[ 4 ] * y;
	out[ 5 ] = a[ 5 ] * y;
	out[ 6 ] = a[ 6 ] * y;
	out[ 7 ] = a[ 7 ] * y;
	out[ 8 ] = a[ 8 ] * z;
	out[ 9 ] = a[ 9 ] * z;
	out[ 10 ] = a[ 10 ] * z;
	out[ 11 ] = a[ 11 ] * z;
	out[ 12 ] = a[ 12 ];
	out[ 13 ] = a[ 13 ];
	out[ 14 ] = a[ 14 ];
	out[ 15 ] = a[ 15 ];
	return out;
};

/**
 * Scales the mat4 by the dimensions in the given vec3 using vectorization
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
mat4.SIMD.scale = function( out, a, v )
{
	var a0, a1, a2;
	var vec = SIMD.Float32x4( v[ 0 ], v[ 1 ], v[ 2 ], 0 );

	a0 = SIMD.Float32x4.load( a, 0 );
	SIMD.Float32x4.store(
		out, 0, SIMD.Float32x4.mul( a0, SIMD.Float32x4.swizzle( vec, 0, 0, 0, 0 ) ) );

	a1 = SIMD.Float32x4.load( a, 4 );
	SIMD.Float32x4.store(
		out, 4, SIMD.Float32x4.mul( a1, SIMD.Float32x4.swizzle( vec, 1, 1, 1, 1 ) ) );

	a2 = SIMD.Float32x4.load( a, 8 );
	SIMD.Float32x4.store(
		out, 8, SIMD.Float32x4.mul( a2, SIMD.Float32x4.swizzle( vec, 2, 2, 2, 2 ) ) );

	out[ 12 ] = a[ 12 ];
	out[ 13 ] = a[ 13 ];
	out[ 14 ] = a[ 14 ];
	out[ 15 ] = a[ 15 ];
	return out;
};

/**
 * Scales the mat4 by the dimensions in the given vec3 using SIMD if available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 */
mat4.scale = glMatrix.USE_SIMD ? mat4.SIMD.scale : mat4.scalar.scale;

/**
 * Rotates a mat4 by the given angle around the given axis
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
mat4.rotate = function( out, a, rad, axis )
{
	var x = axis[ 0 ],
		y = axis[ 1 ],
		z = axis[ 2 ],
		len = Math.sqrt( x * x + y * y + z * z ),
		s, c, t,
		a00, a01, a02, a03,
		a10, a11, a12, a13,
		a20, a21, a22, a23,
		b00, b01, b02,
		b10, b11, b12,
		b20, b21, b22;

	if ( Math.abs( len ) < glMatrix.EPSILON )
	{
		return null;
	}

	len = 1 / len;
	x *= len;
	y *= len;
	z *= len;

	s = Math.sin( rad );
	c = Math.cos( rad );
	t = 1 - c;

	a00 = a[ 0 ];
	a01 = a[ 1 ];
	a02 = a[ 2 ];
	a03 = a[ 3 ];
	a10 = a[ 4 ];
	a11 = a[ 5 ];
	a12 = a[ 6 ];
	a13 = a[ 7 ];
	a20 = a[ 8 ];
	a21 = a[ 9 ];
	a22 = a[ 10 ];
	a23 = a[ 11 ];

	// Construct the elements of the rotation matrix
	b00 = x * x * t + c;
	b01 = y * x * t + z * s;
	b02 = z * x * t - y * s;
	b10 = x * y * t - z * s;
	b11 = y * y * t + c;
	b12 = z * y * t + x * s;
	b20 = x * z * t + y * s;
	b21 = y * z * t - x * s;
	b22 = z * z * t + c;

	// Perform rotation-specific matrix multiplication
	out[ 0 ] = a00 * b00 + a10 * b01 + a20 * b02;
	out[ 1 ] = a01 * b00 + a11 * b01 + a21 * b02;
	out[ 2 ] = a02 * b00 + a12 * b01 + a22 * b02;
	out[ 3 ] = a03 * b00 + a13 * b01 + a23 * b02;
	out[ 4 ] = a00 * b10 + a10 * b11 + a20 * b12;
	out[ 5 ] = a01 * b10 + a11 * b11 + a21 * b12;
	out[ 6 ] = a02 * b10 + a12 * b11 + a22 * b12;
	out[ 7 ] = a03 * b10 + a13 * b11 + a23 * b12;
	out[ 8 ] = a00 * b20 + a10 * b21 + a20 * b22;
	out[ 9 ] = a01 * b20 + a11 * b21 + a21 * b22;
	out[ 10 ] = a02 * b20 + a12 * b21 + a22 * b22;
	out[ 11 ] = a03 * b20 + a13 * b21 + a23 * b22;

	if ( a !== out )
	{ // If the source and destination differ, copy the unchanged last row
		out[ 12 ] = a[ 12 ];
		out[ 13 ] = a[ 13 ];
		out[ 14 ] = a[ 14 ];
		out[ 15 ] = a[ 15 ];
	}
	return out;
};

/**
 * Rotates a matrix by the given angle around the X axis not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.scalar.rotateX = function( out, a, rad )
{
	var s = Math.sin( rad ),
		c = Math.cos( rad ),
		a10 = a[ 4 ],
		a11 = a[ 5 ],
		a12 = a[ 6 ],
		a13 = a[ 7 ],
		a20 = a[ 8 ],
		a21 = a[ 9 ],
		a22 = a[ 10 ],
		a23 = a[ 11 ];

	if ( a !== out )
	{ // If the source and destination differ, copy the unchanged rows
		out[ 0 ] = a[ 0 ];
		out[ 1 ] = a[ 1 ];
		out[ 2 ] = a[ 2 ];
		out[ 3 ] = a[ 3 ];
		out[ 12 ] = a[ 12 ];
		out[ 13 ] = a[ 13 ];
		out[ 14 ] = a[ 14 ];
		out[ 15 ] = a[ 15 ];
	}

	// Perform axis-specific matrix multiplication
	out[ 4 ] = a10 * c + a20 * s;
	out[ 5 ] = a11 * c + a21 * s;
	out[ 6 ] = a12 * c + a22 * s;
	out[ 7 ] = a13 * c + a23 * s;
	out[ 8 ] = a20 * c - a10 * s;
	out[ 9 ] = a21 * c - a11 * s;
	out[ 10 ] = a22 * c - a12 * s;
	out[ 11 ] = a23 * c - a13 * s;
	return out;
};

/**
 * Rotates a matrix by the given angle around the X axis using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.SIMD.rotateX = function( out, a, rad )
{
	var s = SIMD.Float32x4.splat( Math.sin( rad ) ),
		c = SIMD.Float32x4.splat( Math.cos( rad ) );

	if ( a !== out )
	{ // If the source and destination differ, copy the unchanged rows
		out[ 0 ] = a[ 0 ];
		out[ 1 ] = a[ 1 ];
		out[ 2 ] = a[ 2 ];
		out[ 3 ] = a[ 3 ];
		out[ 12 ] = a[ 12 ];
		out[ 13 ] = a[ 13 ];
		out[ 14 ] = a[ 14 ];
		out[ 15 ] = a[ 15 ];
	}

	// Perform axis-specific matrix multiplication
	var a_1 = SIMD.Float32x4.load( a, 4 );
	var a_2 = SIMD.Float32x4.load( a, 8 );
	SIMD.Float32x4.store( out, 4,
		SIMD.Float32x4.add( SIMD.Float32x4.mul( a_1, c ), SIMD.Float32x4.mul( a_2, s ) ) );
	SIMD.Float32x4.store( out, 8,
		SIMD.Float32x4.sub( SIMD.Float32x4.mul( a_2, c ), SIMD.Float32x4.mul( a_1, s ) ) );
	return out;
};

/**
 * Rotates a matrix by the given angle around the X axis using SIMD if availabe and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateX = glMatrix.USE_SIMD ? mat4.SIMD.rotateX : mat4.scalar.rotateX;

/**
 * Rotates a matrix by the given angle around the Y axis not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.scalar.rotateY = function( out, a, rad )
{
	var s = Math.sin( rad ),
		c = Math.cos( rad ),
		a00 = a[ 0 ],
		a01 = a[ 1 ],
		a02 = a[ 2 ],
		a03 = a[ 3 ],
		a20 = a[ 8 ],
		a21 = a[ 9 ],
		a22 = a[ 10 ],
		a23 = a[ 11 ];

	if ( a !== out )
	{ // If the source and destination differ, copy the unchanged rows
		out[ 4 ] = a[ 4 ];
		out[ 5 ] = a[ 5 ];
		out[ 6 ] = a[ 6 ];
		out[ 7 ] = a[ 7 ];
		out[ 12 ] = a[ 12 ];
		out[ 13 ] = a[ 13 ];
		out[ 14 ] = a[ 14 ];
		out[ 15 ] = a[ 15 ];
	}

	// Perform axis-specific matrix multiplication
	out[ 0 ] = a00 * c - a20 * s;
	out[ 1 ] = a01 * c - a21 * s;
	out[ 2 ] = a02 * c - a22 * s;
	out[ 3 ] = a03 * c - a23 * s;
	out[ 8 ] = a00 * s + a20 * c;
	out[ 9 ] = a01 * s + a21 * c;
	out[ 10 ] = a02 * s + a22 * c;
	out[ 11 ] = a03 * s + a23 * c;
	return out;
};

/**
 * Rotates a matrix by the given angle around the Y axis using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.SIMD.rotateY = function( out, a, rad )
{
	var s = SIMD.Float32x4.splat( Math.sin( rad ) ),
		c = SIMD.Float32x4.splat( Math.cos( rad ) );

	if ( a !== out )
	{ // If the source and destination differ, copy the unchanged rows
		out[ 4 ] = a[ 4 ];
		out[ 5 ] = a[ 5 ];
		out[ 6 ] = a[ 6 ];
		out[ 7 ] = a[ 7 ];
		out[ 12 ] = a[ 12 ];
		out[ 13 ] = a[ 13 ];
		out[ 14 ] = a[ 14 ];
		out[ 15 ] = a[ 15 ];
	}

	// Perform axis-specific matrix multiplication
	var a_0 = SIMD.Float32x4.load( a, 0 );
	var a_2 = SIMD.Float32x4.load( a, 8 );
	SIMD.Float32x4.store( out, 0,
		SIMD.Float32x4.sub( SIMD.Float32x4.mul( a_0, c ), SIMD.Float32x4.mul( a_2, s ) ) );
	SIMD.Float32x4.store( out, 8,
		SIMD.Float32x4.add( SIMD.Float32x4.mul( a_0, s ), SIMD.Float32x4.mul( a_2, c ) ) );
	return out;
};

/**
 * Rotates a matrix by the given angle around the Y axis if SIMD available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateY = glMatrix.USE_SIMD ? mat4.SIMD.rotateY : mat4.scalar.rotateY;

/**
 * Rotates a matrix by the given angle around the Z axis not using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.scalar.rotateZ = function( out, a, rad )
{
	var s = Math.sin( rad ),
		c = Math.cos( rad ),
		a00 = a[ 0 ],
		a01 = a[ 1 ],
		a02 = a[ 2 ],
		a03 = a[ 3 ],
		a10 = a[ 4 ],
		a11 = a[ 5 ],
		a12 = a[ 6 ],
		a13 = a[ 7 ];

	if ( a !== out )
	{ // If the source and destination differ, copy the unchanged last row
		out[ 8 ] = a[ 8 ];
		out[ 9 ] = a[ 9 ];
		out[ 10 ] = a[ 10 ];
		out[ 11 ] = a[ 11 ];
		out[ 12 ] = a[ 12 ];
		out[ 13 ] = a[ 13 ];
		out[ 14 ] = a[ 14 ];
		out[ 15 ] = a[ 15 ];
	}

	// Perform axis-specific matrix multiplication
	out[ 0 ] = a00 * c + a10 * s;
	out[ 1 ] = a01 * c + a11 * s;
	out[ 2 ] = a02 * c + a12 * s;
	out[ 3 ] = a03 * c + a13 * s;
	out[ 4 ] = a10 * c - a00 * s;
	out[ 5 ] = a11 * c - a01 * s;
	out[ 6 ] = a12 * c - a02 * s;
	out[ 7 ] = a13 * c - a03 * s;
	return out;
};

/**
 * Rotates a matrix by the given angle around the Z axis using SIMD
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.SIMD.rotateZ = function( out, a, rad )
{
	var s = SIMD.Float32x4.splat( Math.sin( rad ) ),
		c = SIMD.Float32x4.splat( Math.cos( rad ) );

	if ( a !== out )
	{ // If the source and destination differ, copy the unchanged last row
		out[ 8 ] = a[ 8 ];
		out[ 9 ] = a[ 9 ];
		out[ 10 ] = a[ 10 ];
		out[ 11 ] = a[ 11 ];
		out[ 12 ] = a[ 12 ];
		out[ 13 ] = a[ 13 ];
		out[ 14 ] = a[ 14 ];
		out[ 15 ] = a[ 15 ];
	}

	// Perform axis-specific matrix multiplication
	var a_0 = SIMD.Float32x4.load( a, 0 );
	var a_1 = SIMD.Float32x4.load( a, 4 );
	SIMD.Float32x4.store( out, 0,
		SIMD.Float32x4.add( SIMD.Float32x4.mul( a_0, c ), SIMD.Float32x4.mul( a_1, s ) ) );
	SIMD.Float32x4.store( out, 4,
		SIMD.Float32x4.sub( SIMD.Float32x4.mul( a_1, c ), SIMD.Float32x4.mul( a_0, s ) ) );
	return out;
};

/**
 * Rotates a matrix by the given angle around the Z axis if SIMD available and enabled
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.rotateZ = glMatrix.USE_SIMD ? mat4.SIMD.rotateZ : mat4.scalar.rotateZ;

/**
 * Creates a matrix from a vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
mat4.fromTranslation = function( out, v )
{
	out[ 0 ] = 1;
	out[ 1 ] = 0;
	out[ 2 ] = 0;
	out[ 3 ] = 0;
	out[ 4 ] = 0;
	out[ 5 ] = 1;
	out[ 6 ] = 0;
	out[ 7 ] = 0;
	out[ 8 ] = 0;
	out[ 9 ] = 0;
	out[ 10 ] = 1;
	out[ 11 ] = 0;
	out[ 12 ] = v[ 0 ];
	out[ 13 ] = v[ 1 ];
	out[ 14 ] = v[ 2 ];
	out[ 15 ] = 1;
	return out;
}

/**
 * Creates a matrix from a vector scaling
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.scale(dest, dest, vec);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {vec3} v Scaling vector
 * @returns {mat4} out
 */
mat4.fromScaling = function( out, v )
{
	out[ 0 ] = v[ 0 ];
	out[ 1 ] = 0;
	out[ 2 ] = 0;
	out[ 3 ] = 0;
	out[ 4 ] = 0;
	out[ 5 ] = v[ 1 ];
	out[ 6 ] = 0;
	out[ 7 ] = 0;
	out[ 8 ] = 0;
	out[ 9 ] = 0;
	out[ 10 ] = v[ 2 ];
	out[ 11 ] = 0;
	out[ 12 ] = 0;
	out[ 13 ] = 0;
	out[ 14 ] = 0;
	out[ 15 ] = 1;
	return out;
}

/**
 * Creates a matrix from a given angle around a given axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotate(dest, dest, rad, axis);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @param {vec3} axis the axis to rotate around
 * @returns {mat4} out
 */
mat4.fromRotation = function( out, rad, axis )
{
	var x = axis[ 0 ],
		y = axis[ 1 ],
		z = axis[ 2 ],
		len = Math.sqrt( x * x + y * y + z * z ),
		s, c, t;

	if ( Math.abs( len ) < glMatrix.EPSILON )
	{
		return null;
	}

	len = 1 / len;
	x *= len;
	y *= len;
	z *= len;

	s = Math.sin( rad );
	c = Math.cos( rad );
	t = 1 - c;

	// Perform rotation-specific matrix multiplication
	out[ 0 ] = x * x * t + c;
	out[ 1 ] = y * x * t + z * s;
	out[ 2 ] = z * x * t - y * s;
	out[ 3 ] = 0;
	out[ 4 ] = x * y * t - z * s;
	out[ 5 ] = y * y * t + c;
	out[ 6 ] = z * y * t + x * s;
	out[ 7 ] = 0;
	out[ 8 ] = x * z * t + y * s;
	out[ 9 ] = y * z * t - x * s;
	out[ 10 ] = z * z * t + c;
	out[ 11 ] = 0;
	out[ 12 ] = 0;
	out[ 13 ] = 0;
	out[ 14 ] = 0;
	out[ 15 ] = 1;
	return out;
}

/**
 * Creates a matrix from the given angle around the X axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateX(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.fromXRotation = function( out, rad )
{
	var s = Math.sin( rad ),
		c = Math.cos( rad );

	// Perform axis-specific matrix multiplication
	out[ 0 ] = 1;
	out[ 1 ] = 0;
	out[ 2 ] = 0;
	out[ 3 ] = 0;
	out[ 4 ] = 0;
	out[ 5 ] = c;
	out[ 6 ] = s;
	out[ 7 ] = 0;
	out[ 8 ] = 0;
	out[ 9 ] = -s;
	out[ 10 ] = c;
	out[ 11 ] = 0;
	out[ 12 ] = 0;
	out[ 13 ] = 0;
	out[ 14 ] = 0;
	out[ 15 ] = 1;
	return out;
}

/**
 * Creates a matrix from the given angle around the Y axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateY(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.fromYRotation = function( out, rad )
{
	var s = Math.sin( rad ),
		c = Math.cos( rad );

	// Perform axis-specific matrix multiplication
	out[ 0 ] = c;
	out[ 1 ] = 0;
	out[ 2 ] = -s;
	out[ 3 ] = 0;
	out[ 4 ] = 0;
	out[ 5 ] = 1;
	out[ 6 ] = 0;
	out[ 7 ] = 0;
	out[ 8 ] = s;
	out[ 9 ] = 0;
	out[ 10 ] = c;
	out[ 11 ] = 0;
	out[ 12 ] = 0;
	out[ 13 ] = 0;
	out[ 14 ] = 0;
	out[ 15 ] = 1;
	return out;
}

/**
 * Creates a matrix from the given angle around the Z axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.rotateZ(dest, dest, rad);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {Number} rad the angle to rotate the matrix by
 * @returns {mat4} out
 */
mat4.fromZRotation = function( out, rad )
{
	var s = Math.sin( rad ),
		c = Math.cos( rad );

	// Perform axis-specific matrix multiplication
	out[ 0 ] = c;
	out[ 1 ] = s;
	out[ 2 ] = 0;
	out[ 3 ] = 0;
	out[ 4 ] = -s;
	out[ 5 ] = c;
	out[ 6 ] = 0;
	out[ 7 ] = 0;
	out[ 8 ] = 0;
	out[ 9 ] = 0;
	out[ 10 ] = 1;
	out[ 11 ] = 0;
	out[ 12 ] = 0;
	out[ 13 ] = 0;
	out[ 14 ] = 0;
	out[ 15 ] = 1;
	return out;
}

/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @returns {mat4} out
 */
mat4.fromRotationTranslation = function( out, q, v )
{
	// Quaternion math
	var x = q[ 0 ],
		y = q[ 1 ],
		z = q[ 2 ],
		w = q[ 3 ],
		x2 = x + x,
		y2 = y + y,
		z2 = z + z,

		xx = x * x2,
		xy = x * y2,
		xz = x * z2,
		yy = y * y2,
		yz = y * z2,
		zz = z * z2,
		wx = w * x2,
		wy = w * y2,
		wz = w * z2;

	out[ 0 ] = 1 - ( yy + zz );
	out[ 1 ] = xy + wz;
	out[ 2 ] = xz - wy;
	out[ 3 ] = 0;
	out[ 4 ] = xy - wz;
	out[ 5 ] = 1 - ( xx + zz );
	out[ 6 ] = yz + wx;
	out[ 7 ] = 0;
	out[ 8 ] = xz + wy;
	out[ 9 ] = yz - wx;
	out[ 10 ] = 1 - ( xx + yy );
	out[ 11 ] = 0;
	out[ 12 ] = v[ 0 ];
	out[ 13 ] = v[ 1 ];
	out[ 14 ] = v[ 2 ];
	out[ 15 ] = 1;

	return out;
};

/**
 * Returns the translation vector component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslation,
 *  the returned vector will be the same as the translation vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive translation component
 * @param  {mat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */
mat4.getTranslation = function( out, mat )
{
	out[ 0 ] = mat[ 12 ];
	out[ 1 ] = mat[ 13 ];
	out[ 2 ] = mat[ 14 ];

	return out;
};

/**
 * Returns the scaling factor component of a transformation
 *  matrix. If a matrix is built with fromRotationTranslationScale
 *  with a normalized Quaternion paramter, the returned vector will be
 *  the same as the scaling vector
 *  originally supplied.
 * @param  {vec3} out Vector to receive scaling factor component
 * @param  {mat4} mat Matrix to be decomposed (input)
 * @return {vec3} out
 */
mat4.getScaling = function( out, mat )
{
	var m11 = mat[ 0 ],
		m12 = mat[ 1 ],
		m13 = mat[ 2 ],
		m21 = mat[ 4 ],
		m22 = mat[ 5 ],
		m23 = mat[ 6 ],
		m31 = mat[ 8 ],
		m32 = mat[ 9 ],
		m33 = mat[ 10 ];

	out[ 0 ] = Math.sqrt( m11 * m11 + m12 * m12 + m13 * m13 );
	out[ 1 ] = Math.sqrt( m21 * m21 + m22 * m22 + m23 * m23 );
	out[ 2 ] = Math.sqrt( m31 * m31 + m32 * m32 + m33 * m33 );

	return out;
};

/**
 * Returns a quaternion representing the rotational component
 *  of a transformation matrix. If a matrix is built with
 *  fromRotationTranslation, the returned quaternion will be the
 *  same as the quaternion originally supplied.
 * @param {quat} out Quaternion to receive the rotation component
 * @param {mat4} mat Matrix to be decomposed (input)
 * @return {quat} out
 */
mat4.getRotation = function( out, mat )
{
	// Algorithm taken from http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
	var trace = mat[ 0 ] + mat[ 5 ] + mat[ 10 ];
	var S = 0;

	if ( trace > 0 )
	{
		S = Math.sqrt( trace + 1.0 ) * 2;
		out[ 3 ] = 0.25 * S;
		out[ 0 ] = ( mat[ 6 ] - mat[ 9 ] ) / S;
		out[ 1 ] = ( mat[ 8 ] - mat[ 2 ] ) / S;
		out[ 2 ] = ( mat[ 1 ] - mat[ 4 ] ) / S;
	}
	else if ( ( mat[ 0 ] > mat[ 5 ] ) & ( mat[ 0 ] > mat[ 10 ] ) )
	{
		S = Math.sqrt( 1.0 + mat[ 0 ] - mat[ 5 ] - mat[ 10 ] ) * 2;
		out[ 3 ] = ( mat[ 6 ] - mat[ 9 ] ) / S;
		out[ 0 ] = 0.25 * S;
		out[ 1 ] = ( mat[ 1 ] + mat[ 4 ] ) / S;
		out[ 2 ] = ( mat[ 8 ] + mat[ 2 ] ) / S;
	}
	else if ( mat[ 5 ] > mat[ 10 ] )
	{
		S = Math.sqrt( 1.0 + mat[ 5 ] - mat[ 0 ] - mat[ 10 ] ) * 2;
		out[ 3 ] = ( mat[ 8 ] - mat[ 2 ] ) / S;
		out[ 0 ] = ( mat[ 1 ] + mat[ 4 ] ) / S;
		out[ 1 ] = 0.25 * S;
		out[ 2 ] = ( mat[ 6 ] + mat[ 9 ] ) / S;
	}
	else
	{
		S = Math.sqrt( 1.0 + mat[ 10 ] - mat[ 0 ] - mat[ 5 ] ) * 2;
		out[ 3 ] = ( mat[ 1 ] - mat[ 4 ] ) / S;
		out[ 0 ] = ( mat[ 8 ] + mat[ 2 ] ) / S;
		out[ 1 ] = ( mat[ 6 ] + mat[ 9 ] ) / S;
		out[ 2 ] = 0.25 * S;
	}

	return out;
};

/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @param {vec3} s Scaling vector
 * @returns {mat4} out
 */
mat4.fromRotationTranslationScale = function( out, q, v, s )
{
	// Quaternion math
	var x = q[ 0 ],
		y = q[ 1 ],
		z = q[ 2 ],
		w = q[ 3 ],
		x2 = x + x,
		y2 = y + y,
		z2 = z + z,

		xx = x * x2,
		xy = x * y2,
		xz = x * z2,
		yy = y * y2,
		yz = y * z2,
		zz = z * z2,
		wx = w * x2,
		wy = w * y2,
		wz = w * z2,
		sx = s[ 0 ],
		sy = s[ 1 ],
		sz = s[ 2 ];

	out[ 0 ] = ( 1 - ( yy + zz ) ) * sx;
	out[ 1 ] = ( xy + wz ) * sx;
	out[ 2 ] = ( xz - wy ) * sx;
	out[ 3 ] = 0;
	out[ 4 ] = ( xy - wz ) * sy;
	out[ 5 ] = ( 1 - ( xx + zz ) ) * sy;
	out[ 6 ] = ( yz + wx ) * sy;
	out[ 7 ] = 0;
	out[ 8 ] = ( xz + wy ) * sz;
	out[ 9 ] = ( yz - wx ) * sz;
	out[ 10 ] = ( 1 - ( xx + yy ) ) * sz;
	out[ 11 ] = 0;
	out[ 12 ] = v[ 0 ];
	out[ 13 ] = v[ 1 ];
	out[ 14 ] = v[ 2 ];
	out[ 15 ] = 1;

	return out;
};

/**
 * Creates a matrix from a quaternion rotation, vector translation and vector scale, rotating and scaling around the given origin
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     mat4.translate(dest, origin);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *     mat4.scale(dest, scale)
 *     mat4.translate(dest, negativeOrigin);
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat4} q Rotation quaternion
 * @param {vec3} v Translation vector
 * @param {vec3} s Scaling vector
 * @param {vec3} o The origin vector around which to scale and rotate
 * @returns {mat4} out
 */
mat4.fromRotationTranslationScaleOrigin = function( out, q, v, s, o )
{
	// Quaternion math
	var x = q[ 0 ],
		y = q[ 1 ],
		z = q[ 2 ],
		w = q[ 3 ],
		x2 = x + x,
		y2 = y + y,
		z2 = z + z,

		xx = x * x2,
		xy = x * y2,
		xz = x * z2,
		yy = y * y2,
		yz = y * z2,
		zz = z * z2,
		wx = w * x2,
		wy = w * y2,
		wz = w * z2,

		sx = s[ 0 ],
		sy = s[ 1 ],
		sz = s[ 2 ],

		ox = o[ 0 ],
		oy = o[ 1 ],
		oz = o[ 2 ];

	out[ 0 ] = ( 1 - ( yy + zz ) ) * sx;
	out[ 1 ] = ( xy + wz ) * sx;
	out[ 2 ] = ( xz - wy ) * sx;
	out[ 3 ] = 0;
	out[ 4 ] = ( xy - wz ) * sy;
	out[ 5 ] = ( 1 - ( xx + zz ) ) * sy;
	out[ 6 ] = ( yz + wx ) * sy;
	out[ 7 ] = 0;
	out[ 8 ] = ( xz + wy ) * sz;
	out[ 9 ] = ( yz - wx ) * sz;
	out[ 10 ] = ( 1 - ( xx + yy ) ) * sz;
	out[ 11 ] = 0;
	out[ 12 ] = v[ 0 ] + ox - ( out[ 0 ] * ox + out[ 4 ] * oy + out[ 8 ] * oz );
	out[ 13 ] = v[ 1 ] + oy - ( out[ 1 ] * ox + out[ 5 ] * oy + out[ 9 ] * oz );
	out[ 14 ] = v[ 2 ] + oz - ( out[ 2 ] * ox + out[ 6 ] * oy + out[ 10 ] * oz );
	out[ 15 ] = 1;

	return out;
};

/**
 * Calculates a 4x4 matrix from the given quaternion
 *
 * @param {mat4} out mat4 receiving operation result
 * @param {quat} q Quaternion to create matrix from
 *
 * @returns {mat4} out
 */
mat4.fromQuat = function( out, q )
{
	var x = q[ 0 ],
		y = q[ 1 ],
		z = q[ 2 ],
		w = q[ 3 ],
		x2 = x + x,
		y2 = y + y,
		z2 = z + z,

		xx = x * x2,
		yx = y * x2,
		yy = y * y2,
		zx = z * x2,
		zy = z * y2,
		zz = z * z2,
		wx = w * x2,
		wy = w * y2,
		wz = w * z2;

	out[ 0 ] = 1 - yy - zz;
	out[ 1 ] = yx + wz;
	out[ 2 ] = zx - wy;
	out[ 3 ] = 0;

	out[ 4 ] = yx - wz;
	out[ 5 ] = 1 - xx - zz;
	out[ 6 ] = zy + wx;
	out[ 7 ] = 0;

	out[ 8 ] = zx + wy;
	out[ 9 ] = zy - wx;
	out[ 10 ] = 1 - xx - yy;
	out[ 11 ] = 0;

	out[ 12 ] = 0;
	out[ 13 ] = 0;
	out[ 14 ] = 0;
	out[ 15 ] = 1;

	return out;
};

/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Number} left Left bound of the frustum
 * @param {Number} right Right bound of the frustum
 * @param {Number} bottom Bottom bound of the frustum
 * @param {Number} top Top bound of the frustum
 * @param {Number} near Near bound of the frustum
 * @param {Number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.frustum = function( out, left, right, bottom, top, near, far )
{
	var rl = 1 / ( right - left ),
		tb = 1 / ( top - bottom ),
		nf = 1 / ( near - far );
	out[ 0 ]  = ( near * 2 ) * rl;
	out[ 1 ]  = 0;
	out[ 2 ]  = 0;
	out[ 3 ]  = 0;
	out[ 4 ]  = 0;
	out[ 5 ]  = ( near * 2 ) * tb;
	out[ 6 ]  = 0;
	out[ 7 ]  = 0;
	out[ 8 ]  = ( right + left ) * rl;
	out[ 9 ]  = ( top + bottom ) * tb;
	out[ 10 ] = ( far + near ) * nf;
	out[ 11 ] = -1;
	out[ 12 ] = 0;
	out[ 13 ] = 0;
	out[ 14 ] = ( far * near * 2 ) * nf;
	out[ 15 ] = 0;
	return out;
};

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} fovy Vertical field of view in radians
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.perspective = function( out, fovy, aspect, near, far )
{
	var f = 1.0 / Math.tan( fovy / 2 ),
		nf = 1 / ( near - far );
	out[ 0 ] = f / aspect;
	out[ 1 ] = 0;
	out[ 2 ] = 0;
	out[ 3 ] = 0;
	out[ 4 ] = 0;
	out[ 5 ] = f;
	out[ 6 ] = 0;
	out[ 7 ] = 0;
	out[ 8 ] = 0;
	out[ 9 ] = 0;
	out[ 10 ] = ( far + near ) * nf;
	out[ 11 ] = -1;
	out[ 12 ] = 0;
	out[ 13 ] = 0;
	out[ 14 ] = ( 2 * far * near ) * nf;
	out[ 15 ] = 0;
	return out;
};

/**
 * Generates a perspective projection matrix with the given field of view.
 * This is primarily useful for generating projection matrices to be used
 * with the still experiemental WebVR API.
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {Object} fov Object containing the following values: upDegrees, downDegrees, leftDegrees, rightDegrees
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.perspectiveFromFieldOfView = function( out, fov, near, far )
{
	var upTan = Math.tan( fov.upDegrees * Math.PI / 180.0 ),
		downTan = Math.tan( fov.downDegrees * Math.PI / 180.0 ),
		leftTan = Math.tan( fov.leftDegrees * Math.PI / 180.0 ),
		rightTan = Math.tan( fov.rightDegrees * Math.PI / 180.0 ),
		xScale = 2.0 / ( leftTan + rightTan ),
		yScale = 2.0 / ( upTan + downTan );

	out[ 0 ] = xScale;
	out[ 1 ] = 0.0;
	out[ 2 ] = 0.0;
	out[ 3 ] = 0.0;
	out[ 4 ] = 0.0;
	out[ 5 ] = yScale;
	out[ 6 ] = 0.0;
	out[ 7 ] = 0.0;
	out[ 8 ] = -( ( leftTan - rightTan ) * xScale * 0.5 );
	out[ 9 ] = ( ( upTan - downTan ) * yScale * 0.5 );
	out[ 10 ] = far / ( near - far );
	out[ 11 ] = -1.0;
	out[ 12 ] = 0.0;
	out[ 13 ] = 0.0;
	out[ 14 ] = ( far * near ) / ( near - far );
	out[ 15 ] = 0.0;
	return out;
}

/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @returns {mat4} out
 */
mat4.ortho = function( out, left, right, bottom, top, near, far )
{
	var lr = 1 / ( left - right ),
		bt = 1 / ( bottom - top ),
		nf = 1 / ( near - far );
	out[ 0 ] = -2 * lr;
	out[ 1 ] = 0;
	out[ 2 ] = 0;
	out[ 3 ] = 0;
	out[ 4 ] = 0;
	out[ 5 ] = -2 * bt;
	out[ 6 ] = 0;
	out[ 7 ] = 0;
	out[ 8 ] = 0;
	out[ 9 ] = 0;
	out[ 10 ] = 2 * nf;
	out[ 11 ] = 0;
	out[ 12 ] = ( left + right ) * lr;
	out[ 13 ] = ( top + bottom ) * bt;
	out[ 14 ] = ( far + near ) * nf;
	out[ 15 ] = 1;
	return out;
};

/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * @param {mat4} out mat4 frustum matrix will be written into
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing up
 * @returns {mat4} out
 */
mat4.lookAt = function( out, eye, center, up )
{
	var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
		eyex = eye[ 0 ],
		eyey = eye[ 1 ],
		eyez = eye[ 2 ],
		upx = up[ 0 ],
		upy = up[ 1 ],
		upz = up[ 2 ],
		centerx = center[ 0 ],
		centery = center[ 1 ],
		centerz = center[ 2 ];

	if ( Math.abs( eyex - centerx ) < glMatrix.EPSILON &&
		Math.abs( eyey - centery ) < glMatrix.EPSILON &&
		Math.abs( eyez - centerz ) < glMatrix.EPSILON )
	{
		return mat4.identity( out );
	}

	z0 = eyex - centerx;
	z1 = eyey - centery;
	z2 = eyez - centerz;

	len = 1 / Math.sqrt( z0 * z0 + z1 * z1 + z2 * z2 );
	z0 *= len;
	z1 *= len;
	z2 *= len;

	x0 = upy * z2 - upz * z1;
	x1 = upz * z0 - upx * z2;
	x2 = upx * z1 - upy * z0;
	len = Math.sqrt( x0 * x0 + x1 * x1 + x2 * x2 );
	if ( !len )
	{
		x0 = 0;
		x1 = 0;
		x2 = 0;
	}
	else
	{
		len = 1 / len;
		x0 *= len;
		x1 *= len;
		x2 *= len;
	}

	y0 = z1 * x2 - z2 * x1;
	y1 = z2 * x0 - z0 * x2;
	y2 = z0 * x1 - z1 * x0;

	len = Math.sqrt( y0 * y0 + y1 * y1 + y2 * y2 );
	if ( !len )
	{
		y0 = 0;
		y1 = 0;
		y2 = 0;
	}
	else
	{
		len = 1 / len;
		y0 *= len;
		y1 *= len;
		y2 *= len;
	}

	out[ 0 ] = x0;
	out[ 1 ] = y0;
	out[ 2 ] = z0;
	out[ 3 ] = 0;
	out[ 4 ] = x1;
	out[ 5 ] = y1;
	out[ 6 ] = z1;
	out[ 7 ] = 0;
	out[ 8 ] = x2;
	out[ 9 ] = y2;
	out[ 10 ] = z2;
	out[ 11 ] = 0;
	out[ 12 ] = -( x0 * eyex + x1 * eyey + x2 * eyez );
	out[ 13 ] = -( y0 * eyex + y1 * eyey + y2 * eyez );
	out[ 14 ] = -( z0 * eyex + z1 * eyey + z2 * eyez );
	out[ 15 ] = 1;

	return out;
};

/**
 * Returns a string representation of a mat4
 *
 * @param {mat4} a matrix to represent as a string
 * @returns {String} string representation of the matrix
 */
mat4.str = function( a )
{
	return 'mat4(' + a[ 0 ] + ', ' + a[ 1 ] + ', ' + a[ 2 ] + ', ' + a[ 3 ] + ', ' +
		a[ 4 ] + ', ' + a[ 5 ] + ', ' + a[ 6 ] + ', ' + a[ 7 ] + ', ' +
		a[ 8 ] + ', ' + a[ 9 ] + ', ' + a[ 10 ] + ', ' + a[ 11 ] + ', ' +
		a[ 12 ] + ', ' + a[ 13 ] + ', ' + a[ 14 ] + ', ' + a[ 15 ] + ')';
};

/**
 * Returns Frobenius norm of a mat4
 *
 * @param {mat4} a the matrix to calculate Frobenius norm of
 * @returns {Number} Frobenius norm
 */
mat4.frob = function( a )
{
	return ( Math.sqrt( Math.pow( a[ 0 ], 2 ) + Math.pow( a[ 1 ], 2 ) + Math.pow( a[ 2 ], 2 ) + Math.pow( a[ 3 ], 2 ) + Math.pow( a[ 4 ], 2 ) + Math.pow( a[ 5 ], 2 ) + Math.pow( a[ 6 ], 2 ) + Math.pow( a[ 7 ], 2 ) + Math.pow( a[ 8 ], 2 ) + Math.pow( a[ 9 ], 2 ) + Math.pow( a[ 10 ], 2 ) + Math.pow( a[ 11 ], 2 ) + Math.pow( a[ 12 ], 2 ) + Math.pow( a[ 13 ], 2 ) + Math.pow( a[ 14 ], 2 ) + Math.pow( a[ 15 ], 2 ) ) )
};

/**
 * Adds two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
mat4.add = function( out, a, b )
{
	out[ 0 ] = a[ 0 ] + b[ 0 ];
	out[ 1 ] = a[ 1 ] + b[ 1 ];
	out[ 2 ] = a[ 2 ] + b[ 2 ];
	out[ 3 ] = a[ 3 ] + b[ 3 ];
	out[ 4 ] = a[ 4 ] + b[ 4 ];
	out[ 5 ] = a[ 5 ] + b[ 5 ];
	out[ 6 ] = a[ 6 ] + b[ 6 ];
	out[ 7 ] = a[ 7 ] + b[ 7 ];
	out[ 8 ] = a[ 8 ] + b[ 8 ];
	out[ 9 ] = a[ 9 ] + b[ 9 ];
	out[ 10 ] = a[ 10 ] + b[ 10 ];
	out[ 11 ] = a[ 11 ] + b[ 11 ];
	out[ 12 ] = a[ 12 ] + b[ 12 ];
	out[ 13 ] = a[ 13 ] + b[ 13 ];
	out[ 14 ] = a[ 14 ] + b[ 14 ];
	out[ 15 ] = a[ 15 ] + b[ 15 ];
	return out;
};

/**
 * Subtracts matrix b from matrix a
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
mat4.subtract = function( out, a, b )
{
	out[ 0 ] = a[ 0 ] - b[ 0 ];
	out[ 1 ] = a[ 1 ] - b[ 1 ];
	out[ 2 ] = a[ 2 ] - b[ 2 ];
	out[ 3 ] = a[ 3 ] - b[ 3 ];
	out[ 4 ] = a[ 4 ] - b[ 4 ];
	out[ 5 ] = a[ 5 ] - b[ 5 ];
	out[ 6 ] = a[ 6 ] - b[ 6 ];
	out[ 7 ] = a[ 7 ] - b[ 7 ];
	out[ 8 ] = a[ 8 ] - b[ 8 ];
	out[ 9 ] = a[ 9 ] - b[ 9 ];
	out[ 10 ] = a[ 10 ] - b[ 10 ];
	out[ 11 ] = a[ 11 ] - b[ 11 ];
	out[ 12 ] = a[ 12 ] - b[ 12 ];
	out[ 13 ] = a[ 13 ] - b[ 13 ];
	out[ 14 ] = a[ 14 ] - b[ 14 ];
	out[ 15 ] = a[ 15 ] - b[ 15 ];
	return out;
};

/**
 * Alias for {@link mat4.subtract}
 * @function
 */
mat4.sub = mat4.subtract;

/**
 * Multiply each element of the matrix by a scalar.
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {Number} b amount to scale the matrix's elements by
 * @returns {mat4} out
 */
mat4.multiplyScalar = function( out, a, b )
{
	out[ 0 ] = a[ 0 ] * b;
	out[ 1 ] = a[ 1 ] * b;
	out[ 2 ] = a[ 2 ] * b;
	out[ 3 ] = a[ 3 ] * b;
	out[ 4 ] = a[ 4 ] * b;
	out[ 5 ] = a[ 5 ] * b;
	out[ 6 ] = a[ 6 ] * b;
	out[ 7 ] = a[ 7 ] * b;
	out[ 8 ] = a[ 8 ] * b;
	out[ 9 ] = a[ 9 ] * b;
	out[ 10 ] = a[ 10 ] * b;
	out[ 11 ] = a[ 11 ] * b;
	out[ 12 ] = a[ 12 ] * b;
	out[ 13 ] = a[ 13 ] * b;
	out[ 14 ] = a[ 14 ] * b;
	out[ 15 ] = a[ 15 ] * b;
	return out;
};

/**
 * Adds two mat4's after multiplying each element of the second operand by a scalar value.
 *
 * @param {mat4} out the receiving vector
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @param {Number} scale the amount to scale b's elements by before adding
 * @returns {mat4} out
 */
mat4.multiplyScalarAndAdd = function( out, a, b, scale )
{
	out[ 0 ] = a[ 0 ] + ( b[ 0 ] * scale );
	out[ 1 ] = a[ 1 ] + ( b[ 1 ] * scale );
	out[ 2 ] = a[ 2 ] + ( b[ 2 ] * scale );
	out[ 3 ] = a[ 3 ] + ( b[ 3 ] * scale );
	out[ 4 ] = a[ 4 ] + ( b[ 4 ] * scale );
	out[ 5 ] = a[ 5 ] + ( b[ 5 ] * scale );
	out[ 6 ] = a[ 6 ] + ( b[ 6 ] * scale );
	out[ 7 ] = a[ 7 ] + ( b[ 7 ] * scale );
	out[ 8 ] = a[ 8 ] + ( b[ 8 ] * scale );
	out[ 9 ] = a[ 9 ] + ( b[ 9 ] * scale );
	out[ 10 ] = a[ 10 ] + ( b[ 10 ] * scale );
	out[ 11 ] = a[ 11 ] + ( b[ 11 ] * scale );
	out[ 12 ] = a[ 12 ] + ( b[ 12 ] * scale );
	out[ 13 ] = a[ 13 ] + ( b[ 13 ] * scale );
	out[ 14 ] = a[ 14 ] + ( b[ 14 ] * scale );
	out[ 15 ] = a[ 15 ] + ( b[ 15 ] * scale );
	return out;
};

/**
 * Returns whether or not the matrices have exactly the same elements in the same position (when compared with ===)
 *
 * @param {mat4} a The first matrix.
 * @param {mat4} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
mat4.exactEquals = function( a, b )
{
	return a[ 0 ] === b[ 0 ] && a[ 1 ] === b[ 1 ] && a[ 2 ] === b[ 2 ] && a[ 3 ] === b[ 3 ] &&
		a[ 4 ] === b[ 4 ] && a[ 5 ] === b[ 5 ] && a[ 6 ] === b[ 6 ] && a[ 7 ] === b[ 7 ] &&
		a[ 8 ] === b[ 8 ] && a[ 9 ] === b[ 9 ] && a[ 10 ] === b[ 10 ] && a[ 11 ] === b[ 11 ] &&
		a[ 12 ] === b[ 12 ] && a[ 13 ] === b[ 13 ] && a[ 14 ] === b[ 14 ] && a[ 15 ] === b[ 15 ];
};

/**
 * Returns whether or not the matrices have approximately the same elements in the same position.
 *
 * @param {mat4} a The first matrix.
 * @param {mat4} b The second matrix.
 * @returns {Boolean} True if the matrices are equal, false otherwise.
 */
mat4.equals = function( a, b )
{
	var a0 = a[ 0 ],
		a1 = a[ 1 ],
		a2 = a[ 2 ],
		a3 = a[ 3 ],
		a4 = a[ 4 ],
		a5 = a[ 5 ],
		a6 = a[ 6 ],
		a7 = a[ 7 ],
		a8 = a[ 8 ],
		a9 = a[ 9 ],
		a10 = a[ 10 ],
		a11 = a[ 11 ],
		a12 = a[ 12 ],
		a13 = a[ 13 ],
		a14 = a[ 14 ],
		a15 = a[ 15 ];

	var b0 = b[ 0 ],
		b1 = b[ 1 ],
		b2 = b[ 2 ],
		b3 = b[ 3 ],
		b4 = b[ 4 ],
		b5 = b[ 5 ],
		b6 = b[ 6 ],
		b7 = b[ 7 ],
		b8 = b[ 8 ],
		b9 = b[ 9 ],
		b10 = b[ 10 ],
		b11 = b[ 11 ],
		b12 = b[ 12 ],
		b13 = b[ 13 ],
		b14 = b[ 14 ],
		b15 = b[ 15 ];

	return ( Math.abs( a0 - b0 ) <= glMatrix.EPSILON * Math.max( 1.0, Math.abs( a0 ), Math.abs( b0 ) ) &&
		Math.abs( a1 - b1 ) <= glMatrix.EPSILON * Math.max( 1.0, Math.abs( a1 ), Math.abs( b1 ) ) &&
		Math.abs( a2 - b2 ) <= glMatrix.EPSILON * Math.max( 1.0, Math.abs( a2 ), Math.abs( b2 ) ) &&
		Math.abs( a3 - b3 ) <= glMatrix.EPSILON * Math.max( 1.0, Math.abs( a3 ), Math.abs( b3 ) ) &&
		Math.abs( a4 - b4 ) <= glMatrix.EPSILON * Math.max( 1.0, Math.abs( a4 ), Math.abs( b4 ) ) &&
		Math.abs( a5 - b5 ) <= glMatrix.EPSILON * Math.max( 1.0, Math.abs( a5 ), Math.abs( b5 ) ) &&
		Math.abs( a6 - b6 ) <= glMatrix.EPSILON * Math.max( 1.0, Math.abs( a6 ), Math.abs( b6 ) ) &&
		Math.abs( a7 - b7 ) <= glMatrix.EPSILON * Math.max( 1.0, Math.abs( a7 ), Math.abs( b7 ) ) &&
		Math.abs( a8 - b8 ) <= glMatrix.EPSILON * Math.max( 1.0, Math.abs( a8 ), Math.abs( b8 ) ) &&
		Math.abs( a9 - b9 ) <= glMatrix.EPSILON * Math.max( 1.0, Math.abs( a9 ), Math.abs( b9 ) ) &&
		Math.abs( a10 - b10 ) <= glMatrix.EPSILON * Math.max( 1.0, Math.abs( a10 ), Math.abs( b10 ) ) &&
		Math.abs( a11 - b11 ) <= glMatrix.EPSILON * Math.max( 1.0, Math.abs( a11 ), Math.abs( b11 ) ) &&
		Math.abs( a12 - b12 ) <= glMatrix.EPSILON * Math.max( 1.0, Math.abs( a12 ), Math.abs( b12 ) ) &&
		Math.abs( a13 - b13 ) <= glMatrix.EPSILON * Math.max( 1.0, Math.abs( a13 ), Math.abs( b13 ) ) &&
		Math.abs( a14 - b14 ) <= glMatrix.EPSILON * Math.max( 1.0, Math.abs( a14 ), Math.abs( b14 ) ) &&
		Math.abs( a15 - b15 ) <= glMatrix.EPSILON * Math.max( 1.0, Math.abs( a15 ), Math.abs( b15 ) ) );
};



module.exports = mat4;

},{"./common.js":9}],15:[function(require,module,exports){
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix = require("./common.js");
var mat3 = require("./mat3.js");
var vec3 = require("./vec3.js");
var vec4 = require("./vec4.js");

/**
 * @class Quaternion
 * @name quat
 */
var quat = {};

/**
 * Creates a new identity quat
 *
 * @returns {quat} a new quaternion
 */
quat.create = function() {
    var out = new glMatrix.ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Sets a quaternion to represent the shortest rotation from one
 * vector to another.
 *
 * Both vectors are assumed to be unit length.
 *
 * @param {quat} out the receiving quaternion.
 * @param {vec3} a the initial vector
 * @param {vec3} b the destination vector
 * @returns {quat} out
 */
quat.rotationTo = (function() {
    var tmpvec3   = vec3.create();
    var xUnitVec3 = vec3.fromValues(1,0,0);
    var yUnitVec3 = vec3.fromValues(0,1,0);

    return function(out, a, b) {
        var dot = vec3.dot(a, b);
        if (dot < -0.999999) {
            vec3.cross(tmpvec3, xUnitVec3, a);
            if (vec3.length(tmpvec3) < 0.000001)
                vec3.cross(tmpvec3, yUnitVec3, a);
            vec3.normalize(tmpvec3, tmpvec3);
            quat.setAxisAngle(out, tmpvec3, Math.PI);
            return out;
        } else if (dot > 0.999999) {
            out[0] = 0;
            out[1] = 0;
            out[2] = 0;
            out[3] = 1;
            return out;
        } else {
            vec3.cross(tmpvec3, a, b);
            out[0] = tmpvec3[0];
            out[1] = tmpvec3[1];
            out[2] = tmpvec3[2];
            out[3] = 1 + dot;
            return quat.normalize(out, out);
        }
    };
})();

/**
 * Sets the specified quaternion with values corresponding to the given
 * axes. Each axis is a vec3 and is expected to be unit length and
 * perpendicular to all other specified axes.
 *
 * @param {vec3} view  the vector representing the viewing direction
 * @param {vec3} right the vector representing the local "right" direction
 * @param {vec3} up    the vector representing the local "up" direction
 * @returns {quat} out
 */
quat.setAxes = (function() {
    var matr = mat3.create();

    return function(out, view, right, up) {
        matr[0] = right[0];
        matr[3] = right[1];
        matr[6] = right[2];

        matr[1] = up[0];
        matr[4] = up[1];
        matr[7] = up[2];

        matr[2] = -view[0];
        matr[5] = -view[1];
        matr[8] = -view[2];

        return quat.normalize(out, quat.fromMat3(out, matr));
    };
})();

/**
 * Creates a new quat initialized with values from an existing quaternion
 *
 * @param {quat} a quaternion to clone
 * @returns {quat} a new quaternion
 * @function
 */
quat.clone = vec4.clone;

/**
 * Creates a new quat initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} a new quaternion
 * @function
 */
quat.fromValues = vec4.fromValues;

/**
 * Copy the values from one quat to another
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the source quaternion
 * @returns {quat} out
 * @function
 */
quat.copy = vec4.copy;

/**
 * Set the components of a quat to the given values
 *
 * @param {quat} out the receiving quaternion
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {quat} out
 * @function
 */
quat.set = vec4.set;

/**
 * Set a quat to the identity quaternion
 *
 * @param {quat} out the receiving quaternion
 * @returns {quat} out
 */
quat.identity = function(out) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
};

/**
 * Sets a quat from the given angle and rotation axis,
 * then returns it.
 *
 * @param {quat} out the receiving quaternion
 * @param {vec3} axis the axis around which to rotate
 * @param {Number} rad the angle in radians
 * @returns {quat} out
 **/
quat.setAxisAngle = function(out, axis, rad) {
    rad = rad * 0.5;
    var s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
};

/**
 * Gets the rotation axis and angle for a given
 *  quaternion. If a quaternion is created with
 *  setAxisAngle, this method will return the same
 *  values as providied in the original parameter list
 *  OR functionally equivalent values.
 * Example: The quaternion formed by axis [0, 0, 1] and
 *  angle -90 is the same as the quaternion formed by
 *  [0, 0, 1] and 270. This method favors the latter.
 * @param  {vec3} out_axis  Vector receiving the axis of rotation
 * @param  {quat} q     Quaternion to be decomposed
 * @return {Number}     Angle, in radians, of the rotation
 */
quat.getAxisAngle = function(out_axis, q) {
    var rad = Math.acos(q[3]) * 2.0;
    var s = Math.sin(rad / 2.0);
    if (s != 0.0) {
        out_axis[0] = q[0] / s;
        out_axis[1] = q[1] / s;
        out_axis[2] = q[2] / s;
    } else {
        // If s is zero, return any axis (no rotation - axis does not matter)
        out_axis[0] = 1;
        out_axis[1] = 0;
        out_axis[2] = 0;
    }
    return rad;
};

/**
 * Adds two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 * @function
 */
quat.add = vec4.add;

/**
 * Multiplies two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {quat} out
 */
quat.multiply = function(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    out[0] = ax * bw + aw * bx + ay * bz - az * by;
    out[1] = ay * bw + aw * by + az * bx - ax * bz;
    out[2] = az * bw + aw * bz + ax * by - ay * bx;
    out[3] = aw * bw - ax * bx - ay * by - az * bz;
    return out;
};

/**
 * Alias for {@link quat.multiply}
 * @function
 */
quat.mul = quat.multiply;

/**
 * Scales a quat by a scalar number
 *
 * @param {quat} out the receiving vector
 * @param {quat} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {quat} out
 * @function
 */
quat.scale = vec4.scale;

/**
 * Rotates a quaternion by the given angle about the X axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateX = function (out, a, rad) {
    rad *= 0.5;

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + aw * bx;
    out[1] = ay * bw + az * bx;
    out[2] = az * bw - ay * bx;
    out[3] = aw * bw - ax * bx;
    return out;
};

/**
 * Rotates a quaternion by the given angle about the Y axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateY = function (out, a, rad) {
    rad *= 0.5;

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        by = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw - az * by;
    out[1] = ay * bw + aw * by;
    out[2] = az * bw + ax * by;
    out[3] = aw * bw - ay * by;
    return out;
};

/**
 * Rotates a quaternion by the given angle about the Z axis
 *
 * @param {quat} out quat receiving operation result
 * @param {quat} a quat to rotate
 * @param {number} rad angle (in radians) to rotate
 * @returns {quat} out
 */
quat.rotateZ = function (out, a, rad) {
    rad *= 0.5;

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bz = Math.sin(rad), bw = Math.cos(rad);

    out[0] = ax * bw + ay * bz;
    out[1] = ay * bw - ax * bz;
    out[2] = az * bw + aw * bz;
    out[3] = aw * bw - az * bz;
    return out;
};

/**
 * Calculates the W component of a quat from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate W component of
 * @returns {quat} out
 */
quat.calculateW = function (out, a) {
    var x = a[0], y = a[1], z = a[2];

    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
    return out;
};

/**
 * Calculates the dot product of two quat's
 *
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @returns {Number} dot product of a and b
 * @function
 */
quat.dot = vec4.dot;

/**
 * Performs a linear interpolation between two quat's
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 * @function
 */
quat.lerp = vec4.lerp;

/**
 * Performs a spherical linear interpolation between two quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {quat} out
 */
quat.slerp = function (out, a, b, t) {
    // benchmarks:
    //    http://jsperf.com/quaternion-slerp-implementations

    var ax = a[0], ay = a[1], az = a[2], aw = a[3],
        bx = b[0], by = b[1], bz = b[2], bw = b[3];

    var        omega, cosom, sinom, scale0, scale1;

    // calc cosine
    cosom = ax * bx + ay * by + az * bz + aw * bw;
    // adjust signs (if necessary)
    if ( cosom < 0.0 ) {
        cosom = -cosom;
        bx = - bx;
        by = - by;
        bz = - bz;
        bw = - bw;
    }
    // calculate coefficients
    if ( (1.0 - cosom) > 0.000001 ) {
        // standard case (slerp)
        omega  = Math.acos(cosom);
        sinom  = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
    } else {
        // "from" and "to" quaternions are very close
        //  ... so we can do a linear interpolation
        scale0 = 1.0 - t;
        scale1 = t;
    }
    // calculate final values
    out[0] = scale0 * ax + scale1 * bx;
    out[1] = scale0 * ay + scale1 * by;
    out[2] = scale0 * az + scale1 * bz;
    out[3] = scale0 * aw + scale1 * bw;

    return out;
};

/**
 * Performs a spherical linear interpolation with two control points
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a the first operand
 * @param {quat} b the second operand
 * @param {quat} c the third operand
 * @param {quat} d the fourth operand
 * @param {Number} t interpolation amount
 * @returns {quat} out
 */
quat.sqlerp = (function () {
  var temp1 = quat.create();
  var temp2 = quat.create();

  return function (out, a, b, c, d, t) {
    quat.slerp(temp1, a, d, t);
    quat.slerp(temp2, b, c, t);
    quat.slerp(out, temp1, temp2, 2 * t * (1 - t));

    return out;
  };
}());

/**
 * Calculates the inverse of a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate inverse of
 * @returns {quat} out
 */
quat.invert = function(out, a) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        dot = a0*a0 + a1*a1 + a2*a2 + a3*a3,
        invDot = dot ? 1.0/dot : 0;

    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

    out[0] = -a0*invDot;
    out[1] = -a1*invDot;
    out[2] = -a2*invDot;
    out[3] = a3*invDot;
    return out;
};

/**
 * Calculates the conjugate of a quat
 * If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quat to calculate conjugate of
 * @returns {quat} out
 */
quat.conjugate = function (out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = a[3];
    return out;
};

/**
 * Calculates the length of a quat
 *
 * @param {quat} a vector to calculate length of
 * @returns {Number} length of a
 * @function
 */
quat.length = vec4.length;

/**
 * Alias for {@link quat.length}
 * @function
 */
quat.len = quat.length;

/**
 * Calculates the squared length of a quat
 *
 * @param {quat} a vector to calculate squared length of
 * @returns {Number} squared length of a
 * @function
 */
quat.squaredLength = vec4.squaredLength;

/**
 * Alias for {@link quat.squaredLength}
 * @function
 */
quat.sqrLen = quat.squaredLength;

/**
 * Normalize a quat
 *
 * @param {quat} out the receiving quaternion
 * @param {quat} a quaternion to normalize
 * @returns {quat} out
 * @function
 */
quat.normalize = vec4.normalize;

/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 *
 * NOTE: The resultant quaternion is not normalized, so you should be sure
 * to renormalize the quaternion yourself where necessary.
 *
 * @param {quat} out the receiving quaternion
 * @param {mat3} m rotation matrix
 * @returns {quat} out
 * @function
 */
quat.fromMat3 = function(out, m) {
    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
    // article "Quaternion Calculus and Fast Animation".
    var fTrace = m[0] + m[4] + m[8];
    var fRoot;

    if ( fTrace > 0.0 ) {
        // |w| > 1/2, may as well choose w > 1/2
        fRoot = Math.sqrt(fTrace + 1.0);  // 2w
        out[3] = 0.5 * fRoot;
        fRoot = 0.5/fRoot;  // 1/(4w)
        out[0] = (m[5]-m[7])*fRoot;
        out[1] = (m[6]-m[2])*fRoot;
        out[2] = (m[1]-m[3])*fRoot;
    } else {
        // |w| <= 1/2
        var i = 0;
        if ( m[4] > m[0] )
          i = 1;
        if ( m[8] > m[i*3+i] )
          i = 2;
        var j = (i+1)%3;
        var k = (i+2)%3;

        fRoot = Math.sqrt(m[i*3+i]-m[j*3+j]-m[k*3+k] + 1.0);
        out[i] = 0.5 * fRoot;
        fRoot = 0.5 / fRoot;
        out[3] = (m[j*3+k] - m[k*3+j]) * fRoot;
        out[j] = (m[j*3+i] + m[i*3+j]) * fRoot;
        out[k] = (m[k*3+i] + m[i*3+k]) * fRoot;
    }

    return out;
};

/**
 * Returns a string representation of a quatenion
 *
 * @param {quat} a vector to represent as a string
 * @returns {String} string representation of the vector
 */
quat.str = function (a) {
    return 'quat(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

/**
 * Returns whether or not the quaternions have exactly the same elements in the same position (when compared with ===)
 *
 * @param {quat} a The first quaternion.
 * @param {quat} b The second quaternion.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
quat.exactEquals = vec4.exactEquals;

/**
 * Returns whether or not the quaternions have approximately the same elements in the same position.
 *
 * @param {quat} a The first vector.
 * @param {quat} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
quat.equals = vec4.equals;

module.exports = quat;

},{"./common.js":9,"./mat3.js":13,"./vec3.js":17,"./vec4.js":18}],16:[function(require,module,exports){
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix = require("./common.js");

/**
 * @class 2 Dimensional Vector
 * @name vec2
 */
var vec2 = {};

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */
vec2.create = function() {
    var out = new glMatrix.ARRAY_TYPE(2);
    out[0] = 0;
    out[1] = 0;
    return out;
};

/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {vec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */
vec2.clone = function(a) {
    var out = new glMatrix.ARRAY_TYPE(2);
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */
vec2.fromValues = function(x, y) {
    var out = new glMatrix.ARRAY_TYPE(2);
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */
vec2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
vec2.set = function(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
};

/**
 * Alias for {@link vec2.subtract}
 * @function
 */
vec2.sub = vec2.subtract;

/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
};

/**
 * Alias for {@link vec2.multiply}
 * @function
 */
vec2.mul = vec2.multiply;

/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
};

/**
 * Alias for {@link vec2.divide}
 * @function
 */
vec2.div = vec2.divide;

/**
 * Math.ceil the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to ceil
 * @returns {vec2} out
 */
vec2.ceil = function (out, a) {
    out[0] = Math.ceil(a[0]);
    out[1] = Math.ceil(a[1]);
    return out;
};

/**
 * Math.floor the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to floor
 * @returns {vec2} out
 */
vec2.floor = function (out, a) {
    out[0] = Math.floor(a[0]);
    out[1] = Math.floor(a[1]);
    return out;
};

/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    return out;
};

/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    return out;
};

/**
 * Math.round the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to round
 * @returns {vec2} out
 */
vec2.round = function (out, a) {
    out[0] = Math.round(a[0]);
    out[1] = Math.round(a[1]);
    return out;
};

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */
vec2.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
};

/**
 * Adds two vec2's after scaling the second operand by a scalar value
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec2} out
 */
vec2.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    return out;
};

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
vec2.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.distance}
 * @function
 */
vec2.dist = vec2.distance;

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec2.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */
vec2.sqrDist = vec2.squaredDistance;

/**
 * Calculates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
vec2.length = function (a) {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.length}
 * @function
 */
vec2.len = vec2.length;

/**
 * Calculates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec2.squaredLength = function (a) {
    var x = a[0],
        y = a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredLength}
 * @function
 */
vec2.sqrLen = vec2.squaredLength;

/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */
vec2.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
};

/**
 * Returns the inverse of the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to invert
 * @returns {vec2} out
 */
vec2.inverse = function(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  return out;
};

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */
vec2.normalize = function(out, a) {
    var x = a[0],
        y = a[1];
    var len = x*x + y*y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
vec2.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1];
};

/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec3} out
 */
vec2.cross = function(out, a, b) {
    var z = a[0] * b[1] - a[1] * b[0];
    out[0] = out[1] = 0;
    out[2] = z;
    return out;
};

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec2} out
 */
vec2.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
};

/**
 * Generates a random vector with the given scale
 *
 * @param {vec2} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec2} out
 */
vec2.random = function (out, scale) {
    scale = scale || 1.0;
    var r = glMatrix.RANDOM() * 2.0 * Math.PI;
    out[0] = Math.cos(r) * scale;
    out[1] = Math.sin(r) * scale;
    return out;
};

/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y;
    out[1] = m[1] * x + m[3] * y;
    return out;
};

/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2d} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2d = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
    return out;
};

/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat3} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat3 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
};

/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat4 = function(out, a, m) {
    var x = a[0], 
        y = a[1];
    out[0] = m[0] * x + m[4] * y + m[12];
    out[1] = m[1] * x + m[5] * y + m[13];
    return out;
};

/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec2.forEach = (function() {
    var vec = vec2.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 2;
        }

        if(!offset) {
            offset = 0;
        }
        
        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1];
        }
        
        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec2} a vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec2.str = function (a) {
    return 'vec2(' + a[0] + ', ' + a[1] + ')';
};

/**
 * Returns whether or not the vectors exactly have the same elements in the same position (when compared with ===)
 *
 * @param {vec2} a The first vector.
 * @param {vec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
vec2.exactEquals = function (a, b) {
    return a[0] === b[0] && a[1] === b[1];
};

/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {vec2} a The first vector.
 * @param {vec2} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
vec2.equals = function (a, b) {
    var a0 = a[0], a1 = a[1];
    var b0 = b[0], b1 = b[1];
    return (Math.abs(a0 - b0) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a1), Math.abs(b1)));
};

module.exports = vec2;

},{"./common.js":9}],17:[function(require,module,exports){
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix = require( "./common.js" );

/**
 * @class 3 Dimensional Vector
 * @name vec3
 */
var vec3 = {};

/**
 * Creates a new, empty vec3
 *
 * @returns {vec3} a new 3D vector
 */
vec3.create = function()
{
	var out = new glMatrix.ARRAY_TYPE( 3 );
	out[ 0 ] = 0;
	out[ 1 ] = 0;
	out[ 2 ] = 0;
	return out;
};

/**
 * Creates a new vec3 initialized with values from an existing vector
 *
 * @param {vec3} a vector to clone
 * @returns {vec3} a new 3D vector
 */
vec3.clone = function( a )
{
	var out = new glMatrix.ARRAY_TYPE( 3 );
	out[ 0 ] = a[ 0 ];
	out[ 1 ] = a[ 1 ];
	out[ 2 ] = a[ 2 ];
	return out;
};

/**
 * Creates a new vec3 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} a new 3D vector
 */
vec3.fromValues = function( x, y, z )
{
	var out = new glMatrix.ARRAY_TYPE( 3 );
	out[ 0 ] = x;
	out[ 1 ] = y;
	out[ 2 ] = z;
	return out;
};

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
vec3.copy = function( out, a )
{
	out[ 0 ] = a[ 0 ];
	out[ 1 ] = a[ 1 ];
	out[ 2 ] = a[ 2 ];
	return out;
};

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
vec3.set = function( out, x, y, z )
{
	out[ 0 ] = x;
	out[ 1 ] = y;
	out[ 2 ] = z;
	return out;
};

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.add = function( out, a, b )
{
	out[ 0 ] = a[ 0 ] + b[ 0 ];
	out[ 1 ] = a[ 1 ] + b[ 1 ];
	out[ 2 ] = a[ 2 ] + b[ 2 ];
	return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.subtract = function( out, a, b )
{
	out[ 0 ] = a[ 0 ] - b[ 0 ];
	out[ 1 ] = a[ 1 ] - b[ 1 ];
	out[ 2 ] = a[ 2 ] - b[ 2 ];
	return out;
};

/**
 * Alias for {@link vec3.subtract}
 * @function
 */
vec3.sub = vec3.subtract;

/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.multiply = function( out, a, b )
{
	out[ 0 ] = a[ 0 ] * b[ 0 ];
	out[ 1 ] = a[ 1 ] * b[ 1 ];
	out[ 2 ] = a[ 2 ] * b[ 2 ];
	return out;
};

/**
 * Alias for {@link vec3.multiply}
 * @function
 */
vec3.mul = vec3.multiply;

/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.divide = function( out, a, b )
{
	out[ 0 ] = a[ 0 ] / b[ 0 ];
	out[ 1 ] = a[ 1 ] / b[ 1 ];
	out[ 2 ] = a[ 2 ] / b[ 2 ];
	return out;
};

/**
 * Alias for {@link vec3.divide}
 * @function
 */
vec3.div = vec3.divide;

/**
 * Math.ceil the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to ceil
 * @returns {vec3} out
 */
vec3.ceil = function( out, a )
{
	out[ 0 ] = Math.ceil( a[ 0 ] );
	out[ 1 ] = Math.ceil( a[ 1 ] );
	out[ 2 ] = Math.ceil( a[ 2 ] );
	return out;
};

/**
 * Math.floor the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to floor
 * @returns {vec3} out
 */
vec3.floor = function( out, a )
{
	out[ 0 ] = Math.floor( a[ 0 ] );
	out[ 1 ] = Math.floor( a[ 1 ] );
	out[ 2 ] = Math.floor( a[ 2 ] );
	return out;
};

/**
 * Returns the minimum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.min = function( out, a, b )
{
	out[ 0 ] = Math.min( a[ 0 ], b[ 0 ] );
	out[ 1 ] = Math.min( a[ 1 ], b[ 1 ] );
	out[ 2 ] = Math.min( a[ 2 ], b[ 2 ] );
	return out;
};

/**
 * Returns the maximum of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.max = function( out, a, b )
{
	out[ 0 ] = Math.max( a[ 0 ], b[ 0 ] );
	out[ 1 ] = Math.max( a[ 1 ], b[ 1 ] );
	out[ 2 ] = Math.max( a[ 2 ], b[ 2 ] );
	return out;
};

/**
 * Math.round the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to round
 * @returns {vec3} out
 */
vec3.round = function( out, a )
{
	out[ 0 ] = Math.round( a[ 0 ] );
	out[ 1 ] = Math.round( a[ 1 ] );
	out[ 2 ] = Math.round( a[ 2 ] );
	return out;
};

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
vec3.scale = function( out, a, b )
{
	out[ 0 ] = a[ 0 ] * b;
	out[ 1 ] = a[ 1 ] * b;
	out[ 2 ] = a[ 2 ] * b;
	return out;
};

/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */
vec3.scaleAndAdd = function( out, a, b, scale )
{
	out[ 0 ] = a[ 0 ] + ( b[ 0 ] * scale );
	out[ 1 ] = a[ 1 ] + ( b[ 1 ] * scale );
	out[ 2 ] = a[ 2 ] + ( b[ 2 ] * scale );
	return out;
};

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
vec3.distance = function( a, b )
{
	var x = b[ 0 ] - a[ 0 ],
		y = b[ 1 ] - a[ 1 ],
		z = b[ 2 ] - a[ 2 ];
	return Math.sqrt( x * x + y * y + z * z );
};

/**
 * Alias for {@link vec3.distance}
 * @function
 */
vec3.dist = vec3.distance;

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec3.squaredDistance = function( a, b )
{
	var x = b[ 0 ] - a[ 0 ],
		y = b[ 1 ] - a[ 1 ],
		z = b[ 2 ] - a[ 2 ];
	return x * x + y * y + z * z;
};

/**
 * Alias for {@link vec3.squaredDistance}
 * @function
 */
vec3.sqrDist = vec3.squaredDistance;

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
vec3.length = function( a )
{
	var x = a[ 0 ],
		y = a[ 1 ],
		z = a[ 2 ];
	return Math.sqrt( x * x + y * y + z * z );
};

/**
 * Alias for {@link vec3.length}
 * @function
 */
vec3.len = vec3.length;

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec3.squaredLength = function( a )
{
	var x = a[ 0 ],
		y = a[ 1 ],
		z = a[ 2 ];
	return x * x + y * y + z * z;
};

/**
 * Alias for {@link vec3.squaredLength}
 * @function
 */
vec3.sqrLen = vec3.squaredLength;

/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
vec3.negate = function( out, a )
{
	out[ 0 ] = -a[ 0 ];
	out[ 1 ] = -a[ 1 ];
	out[ 2 ] = -a[ 2 ];
	return out;
};

/**
 * Returns the inverse of the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to invert
 * @returns {vec3} out
 */
vec3.inverse = function( out, a )
{
	out[ 0 ] = 1.0 / a[ 0 ];
	out[ 1 ] = 1.0 / a[ 1 ];
	out[ 2 ] = 1.0 / a[ 2 ];
	return out;
};

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
vec3.normalize = function( out, a )
{
	var x = a[ 0 ],
		y = a[ 1 ],
		z = a[ 2 ];
	var len = x * x + y * y + z * z;
	if ( len > 0 )
	{
		//TODO: evaluate use of glm_invsqrt here?
		len = 1 / Math.sqrt( len );
		out[ 0 ] = a[ 0 ] * len;
		out[ 1 ] = a[ 1 ] * len;
		out[ 2 ] = a[ 2 ] * len;
	}
	return out;
};

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
vec3.dot = function( a, b )
{
	return a[ 0 ] * b[ 0 ] + a[ 1 ] * b[ 1 ] + a[ 2 ] * b[ 2 ];
};

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
vec3.cross = function( out, a, b )
{
	var ax = a[ 0 ],
		ay = a[ 1 ],
		az = a[ 2 ],
		bx = b[ 0 ],
		by = b[ 1 ],
		bz = b[ 2 ];

	out[ 0 ] = ay * bz - az * by;
	out[ 1 ] = az * bx - ax * bz;
	out[ 2 ] = ax * by - ay * bx;
	return out;
};

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
vec3.lerp = function( out, a, b, t )
{
	var ax = a[ 0 ],
		ay = a[ 1 ],
		az = a[ 2 ];
	out[ 0 ] = ax + t * ( b[ 0 ] - ax );
	out[ 1 ] = ay + t * ( b[ 1 ] - ay );
	out[ 2 ] = az + t * ( b[ 2 ] - az );
	return out;
};

/**
 * Performs a hermite interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {vec3} c the third operand
 * @param {vec3} d the fourth operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
vec3.hermite = function( out, a, b, c, d, t )
{
	var factorTimes2 = t * t,
		factor1 = factorTimes2 * ( 2 * t - 3 ) + 1,
		factor2 = factorTimes2 * ( t - 2 ) + t,
		factor3 = factorTimes2 * ( t - 1 ),
		factor4 = factorTimes2 * ( 3 - 2 * t );

	out[ 0 ] = a[ 0 ] * factor1 + b[ 0 ] * factor2 + c[ 0 ] * factor3 + d[ 0 ] * factor4;
	out[ 1 ] = a[ 1 ] * factor1 + b[ 1 ] * factor2 + c[ 1 ] * factor3 + d[ 1 ] * factor4;
	out[ 2 ] = a[ 2 ] * factor1 + b[ 2 ] * factor2 + c[ 2 ] * factor3 + d[ 2 ] * factor4;

	return out;
};

/**
 * Performs a bezier interpolation with two control points
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {vec3} c the third operand
 * @param {vec3} d the fourth operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
vec3.bezier = function( out, a, b, c, d, t )
{
	var inverseFactor = 1 - t,
		inverseFactorTimesTwo = inverseFactor * inverseFactor,
		factorTimes2 = t * t,
		factor1 = inverseFactorTimesTwo * inverseFactor,
		factor2 = 3 * t * inverseFactorTimesTwo,
		factor3 = 3 * factorTimes2 * inverseFactor,
		factor4 = factorTimes2 * t;

	out[ 0 ] = a[ 0 ] * factor1 + b[ 0 ] * factor2 + c[ 0 ] * factor3 + d[ 0 ] * factor4;
	out[ 1 ] = a[ 1 ] * factor1 + b[ 1 ] * factor2 + c[ 1 ] * factor3 + d[ 1 ] * factor4;
	out[ 2 ] = a[ 2 ] * factor1 + b[ 2 ] * factor2 + c[ 2 ] * factor3 + d[ 2 ] * factor4;

	return out;
};

/**
 * Generates a random vector with the given scale
 *
 * @param {vec3} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec3} out
 */
vec3.random = function( out, scale )
{
	scale = scale || 1.0;

	var r = glMatrix.RANDOM() * 2.0 * Math.PI;
	var z = ( glMatrix.RANDOM() * 2.0 ) - 1.0;
	var zScale = Math.sqrt( 1.0 - z * z ) * scale;

	out[ 0 ] = Math.cos( r ) * zScale;
	out[ 1 ] = Math.sin( r ) * zScale;
	out[ 2 ] = z * scale;
	return out;
};

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
vec3.transformMat4 = function( out, a, m )
{
	var x = a[ 0 ],
		y = a[ 1 ],
		z = a[ 2 ],
		w = m[ 3 ] * x + m[ 7 ] * y + m[ 11 ] * z + m[ 15 ];
	w = w || 1.0;
	out[ 0 ] = ( m[ 0 ] * x + m[ 4 ] * y + m[ 8 ] * z + m[ 12 ] ) / w;
	out[ 1 ] = ( m[ 1 ] * x + m[ 5 ] * y + m[ 9 ] * z + m[ 13 ] ) / w;
	out[ 2 ] = ( m[ 2 ] * x + m[ 6 ] * y + m[ 10 ] * z + m[ 14 ] ) / w;
	return out;
};

/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */
vec3.transformMat3 = function( out, a, m )
{
	var x = a[ 0 ],
		y = a[ 1 ],
		z = a[ 2 ];
	out[ 0 ] = x * m[ 0 ] + y * m[ 3 ] + z * m[ 6 ];
	out[ 1 ] = x * m[ 1 ] + y * m[ 4 ] + z * m[ 7 ];
	out[ 2 ] = x * m[ 2 ] + y * m[ 5 ] + z * m[ 8 ];
	return out;
};

/**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
vec3.transformQuat = function( out, a, q )
{
	// benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

	var x = a[ 0 ],
		y = a[ 1 ],
		z = a[ 2 ],
		qx = q[ 0 ],
		qy = q[ 1 ],
		qz = q[ 2 ],
		qw = q[ 3 ],

		// calculate quat * vec
		ix = qw * x + qy * z - qz * y,
		iy = qw * y + qz * x - qx * z,
		iz = qw * z + qx * y - qy * x,
		iw = -qx * x - qy * y - qz * z;

	// calculate result * inverse quat
	out[ 0 ] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	out[ 1 ] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	out[ 2 ] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	return out;
};

/**
 * Rotate a 3D vector around the x-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
vec3.rotateX = function( out, a, b, c )
{
	var p = [],
		r = [];
	//Translate point to the origin
	p[ 0 ] = a[ 0 ] - b[ 0 ];
	p[ 1 ] = a[ 1 ] - b[ 1 ];
	p[ 2 ] = a[ 2 ] - b[ 2 ];

	//perform rotation
	r[ 0 ] = p[ 0 ];
	r[ 1 ] = p[ 1 ] * Math.cos( c ) - p[ 2 ] * Math.sin( c );
	r[ 2 ] = p[ 1 ] * Math.sin( c ) + p[ 2 ] * Math.cos( c );

	//translate to correct position
	out[ 0 ] = r[ 0 ] + b[ 0 ];
	out[ 1 ] = r[ 1 ] + b[ 1 ];
	out[ 2 ] = r[ 2 ] + b[ 2 ];

	return out;
};

/**
 * Rotate a 3D vector around the y-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
vec3.rotateY = function( out, a, b, c )
{
	var p = [],
		r = [];
	//Translate point to the origin
	p[ 0 ] = a[ 0 ] - b[ 0 ];
	p[ 1 ] = a[ 1 ] - b[ 1 ];
	p[ 2 ] = a[ 2 ] - b[ 2 ];

	//perform rotation
	r[ 0 ] = p[ 2 ] * Math.sin( c ) + p[ 0 ] * Math.cos( c );
	r[ 1 ] = p[ 1 ];
	r[ 2 ] = p[ 2 ] * Math.cos( c ) - p[ 0 ] * Math.sin( c );

	//translate to correct position
	out[ 0 ] = r[ 0 ] + b[ 0 ];
	out[ 1 ] = r[ 1 ] + b[ 1 ];
	out[ 2 ] = r[ 2 ] + b[ 2 ];

	return out;
};

/**
 * Rotate a 3D vector around the z-axis
 * @param {vec3} out The receiving vec3
 * @param {vec3} a The vec3 point to rotate
 * @param {vec3} b The origin of the rotation
 * @param {Number} c The angle of rotation
 * @returns {vec3} out
 */
vec3.rotateZ = function( out, a, b, c )
{
	var p = [],
		r = [];
	//Translate point to the origin
	p[ 0 ] = a[ 0 ] - b[ 0 ];
	p[ 1 ] = a[ 1 ] - b[ 1 ];
	p[ 2 ] = a[ 2 ] - b[ 2 ];

	//perform rotation
	r[ 0 ] = p[ 0 ] * Math.cos( c ) - p[ 1 ] * Math.sin( c );
	r[ 1 ] = p[ 0 ] * Math.sin( c ) + p[ 1 ] * Math.cos( c );
	r[ 2 ] = p[ 2 ];

	//translate to correct position
	out[ 0 ] = r[ 0 ] + b[ 0 ];
	out[ 1 ] = r[ 1 ] + b[ 1 ];
	out[ 2 ] = r[ 2 ] + b[ 2 ];

	return out;
};

/**
 * Perform some operation over an array of vec3s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec3.forEach = ( function()
{
	var vec = vec3.create();

	return function( a, stride, offset, count, fn, arg )
	{
		var i, l;
		if ( !stride )
		{
			stride = 3;
		}

		if ( !offset )
		{
			offset = 0;
		}

		if ( count )
		{
			l = Math.min( ( count * stride ) + offset, a.length );
		}
		else
		{
			l = a.length;
		}

		for ( i = offset; i < l; i += stride )
		{
			vec[ 0 ] = a[ i ];
			vec[ 1 ] = a[ i + 1 ];
			vec[ 2 ] = a[ i + 2 ];
			fn( vec, vec, arg );
			a[ i ] = vec[ 0 ];
			a[ i + 1 ] = vec[ 1 ];
			a[ i + 2 ] = vec[ 2 ];
		}

		return a;
	};
} )();

/**
 * Get the angle between two 3D vectors
 * @param {vec3} a The first operand
 * @param {vec3} b The second operand
 * @returns {Number} The angle in radians
 */
vec3.angle = function( a, b )
{

	var tempA = vec3.fromValues( a[ 0 ], a[ 1 ], a[ 2 ] );
	var tempB = vec3.fromValues( b[ 0 ], b[ 1 ], b[ 2 ] );

	vec3.normalize( tempA, tempA );
	vec3.normalize( tempB, tempB );

	var cosine = vec3.dot( tempA, tempB );

	if ( cosine > 1.0 )
	{
		return 0;
	}
	else if ( cosine < -1.0 )
	{
		return Math.PI;
	}
	else
	{
		return Math.acos( cosine );
	}
};

/**
 * Returns a string representation of a vector
 *
 * @param {vec3} a vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec3.str = function( a )
{
	return 'vec3(' + a[ 0 ] + ', ' + a[ 1 ] + ', ' + a[ 2 ] + ')';
};

/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {vec3} a The first vector.
 * @param {vec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
vec3.exactEquals = function( a, b )
{
	return a[ 0 ] === b[ 0 ] && a[ 1 ] === b[ 1 ] && a[ 2 ] === b[ 2 ];
};

/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {vec3} a The first vector.
 * @param {vec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
vec3.equals = function( a, b )
{
	var a0 = a[ 0 ],
		a1 = a[ 1 ],
		a2 = a[ 2 ];
	var b0 = b[ 0 ],
		b1 = b[ 1 ],
		b2 = b[ 2 ];
	return ( Math.abs( a0 - b0 ) <= glMatrix.EPSILON * Math.max( 1.0, Math.abs( a0 ), Math.abs( b0 ) ) &&
		Math.abs( a1 - b1 ) <= glMatrix.EPSILON * Math.max( 1.0, Math.abs( a1 ), Math.abs( b1 ) ) &&
		Math.abs( a2 - b2 ) <= glMatrix.EPSILON * Math.max( 1.0, Math.abs( a2 ), Math.abs( b2 ) ) );
};

module.exports = vec3;

},{"./common.js":9}],18:[function(require,module,exports){
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

var glMatrix = require("./common.js");

/**
 * @class 4 Dimensional Vector
 * @name vec4
 */
var vec4 = {};

/**
 * Creates a new, empty vec4
 *
 * @returns {vec4} a new 4D vector
 */
vec4.create = function() {
    var out = new glMatrix.ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    return out;
};

/**
 * Creates a new vec4 initialized with values from an existing vector
 *
 * @param {vec4} a vector to clone
 * @returns {vec4} a new 4D vector
 */
vec4.clone = function(a) {
    var out = new glMatrix.ARRAY_TYPE(4);
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Creates a new vec4 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} a new 4D vector
 */
vec4.fromValues = function(x, y, z, w) {
    var out = new glMatrix.ARRAY_TYPE(4);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Copy the values from one vec4 to another
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the source vector
 * @returns {vec4} out
 */
vec4.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    return out;
};

/**
 * Set the components of a vec4 to the given values
 *
 * @param {vec4} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @param {Number} w W component
 * @returns {vec4} out
 */
vec4.set = function(out, x, y, z, w) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
};

/**
 * Adds two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    out[3] = a[3] + b[3];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    out[3] = a[3] - b[3];
    return out;
};

/**
 * Alias for {@link vec4.subtract}
 * @function
 */
vec4.sub = vec4.subtract;

/**
 * Multiplies two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    out[3] = a[3] * b[3];
    return out;
};

/**
 * Alias for {@link vec4.multiply}
 * @function
 */
vec4.mul = vec4.multiply;

/**
 * Divides two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    out[3] = a[3] / b[3];
    return out;
};

/**
 * Alias for {@link vec4.divide}
 * @function
 */
vec4.div = vec4.divide;

/**
 * Math.ceil the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to ceil
 * @returns {vec4} out
 */
vec4.ceil = function (out, a) {
    out[0] = Math.ceil(a[0]);
    out[1] = Math.ceil(a[1]);
    out[2] = Math.ceil(a[2]);
    out[3] = Math.ceil(a[3]);
    return out;
};

/**
 * Math.floor the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to floor
 * @returns {vec4} out
 */
vec4.floor = function (out, a) {
    out[0] = Math.floor(a[0]);
    out[1] = Math.floor(a[1]);
    out[2] = Math.floor(a[2]);
    out[3] = Math.floor(a[3]);
    return out;
};

/**
 * Returns the minimum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    out[2] = Math.min(a[2], b[2]);
    out[3] = Math.min(a[3], b[3]);
    return out;
};

/**
 * Returns the maximum of two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {vec4} out
 */
vec4.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    out[2] = Math.max(a[2], b[2]);
    out[3] = Math.max(a[3], b[3]);
    return out;
};

/**
 * Math.round the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to round
 * @returns {vec4} out
 */
vec4.round = function (out, a) {
    out[0] = Math.round(a[0]);
    out[1] = Math.round(a[1]);
    out[2] = Math.round(a[2]);
    out[3] = Math.round(a[3]);
    return out;
};

/**
 * Scales a vec4 by a scalar number
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec4} out
 */
vec4.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    return out;
};

/**
 * Adds two vec4's after scaling the second operand by a scalar value
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec4} out
 */
vec4.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    out[2] = a[2] + (b[2] * scale);
    out[3] = a[3] + (b[3] * scale);
    return out;
};

/**
 * Calculates the euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} distance between a and b
 */
vec4.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Alias for {@link vec4.distance}
 * @function
 */
vec4.dist = vec4.distance;

/**
 * Calculates the squared euclidian distance between two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec4.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2],
        w = b[3] - a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Alias for {@link vec4.squaredDistance}
 * @function
 */
vec4.sqrDist = vec4.squaredDistance;

/**
 * Calculates the length of a vec4
 *
 * @param {vec4} a vector to calculate length of
 * @returns {Number} length of a
 */
vec4.length = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return Math.sqrt(x*x + y*y + z*z + w*w);
};

/**
 * Alias for {@link vec4.length}
 * @function
 */
vec4.len = vec4.length;

/**
 * Calculates the squared length of a vec4
 *
 * @param {vec4} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec4.squaredLength = function (a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    return x*x + y*y + z*z + w*w;
};

/**
 * Alias for {@link vec4.squaredLength}
 * @function
 */
vec4.sqrLen = vec4.squaredLength;

/**
 * Negates the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to negate
 * @returns {vec4} out
 */
vec4.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    out[3] = -a[3];
    return out;
};

/**
 * Returns the inverse of the components of a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to invert
 * @returns {vec4} out
 */
vec4.inverse = function(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  out[2] = 1.0 / a[2];
  out[3] = 1.0 / a[3];
  return out;
};

/**
 * Normalize a vec4
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a vector to normalize
 * @returns {vec4} out
 */
vec4.normalize = function(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    var len = x*x + y*y + z*z + w*w;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
        out[0] = x * len;
        out[1] = y * len;
        out[2] = z * len;
        out[3] = w * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec4's
 *
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @returns {Number} dot product of a and b
 */
vec4.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
};

/**
 * Performs a linear interpolation between two vec4's
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the first operand
 * @param {vec4} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec4} out
 */
vec4.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    out[3] = aw + t * (b[3] - aw);
    return out;
};

/**
 * Generates a random vector with the given scale
 *
 * @param {vec4} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec4} out
 */
vec4.random = function (out, scale) {
    scale = scale || 1.0;

    //TODO: This is a pretty awful way of doing this. Find something better.
    out[0] = glMatrix.RANDOM();
    out[1] = glMatrix.RANDOM();
    out[2] = glMatrix.RANDOM();
    out[3] = glMatrix.RANDOM();
    vec4.normalize(out, out);
    vec4.scale(out, out, scale);
    return out;
};

/**
 * Transforms the vec4 with a mat4.
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec4} out
 */
vec4.transformMat4 = function(out, a, m) {
    var x = a[0], y = a[1], z = a[2], w = a[3];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
    return out;
};

/**
 * Transforms the vec4 with a quat
 *
 * @param {vec4} out the receiving vector
 * @param {vec4} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec4} out
 */
vec4.transformQuat = function(out, a, q) {
    var x = a[0], y = a[1], z = a[2],
        qx = q[0], qy = q[1], qz = q[2], qw = q[3],

        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    out[3] = a[3];
    return out;
};

/**
 * Perform some operation over an array of vec4s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec4.forEach = (function() {
    var vec = vec4.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 4;
        }

        if(!offset) {
            offset = 0;
        }

        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1]; vec[2] = a[i+2]; vec[3] = a[i+3];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1]; a[i+2] = vec[2]; a[i+3] = vec[3];
        }

        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec4} a vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec4.str = function (a) {
    return 'vec4(' + a[0] + ', ' + a[1] + ', ' + a[2] + ', ' + a[3] + ')';
};

/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {vec4} a The first vector.
 * @param {vec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
vec4.exactEquals = function (a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
};

/**
 * Returns whether or not the vectors have approximately the same elements in the same position.
 *
 * @param {vec4} a The first vector.
 * @param {vec4} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
vec4.equals = function (a, b) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    return (Math.abs(a0 - b0) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a0), Math.abs(b0)) &&
            Math.abs(a1 - b1) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a1), Math.abs(b1)) &&
            Math.abs(a2 - b2) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a2), Math.abs(b2)) &&
            Math.abs(a3 - b3) <= glMatrix.EPSILON*Math.max(1.0, Math.abs(a3), Math.abs(b3)));
};

module.exports = vec4;

},{"./common.js":9}],19:[function(require,module,exports){
function parse_args( length, args )
{
	return args.length ? [...args,length] : [length];
}

function Matrix_Template( base, length )
{
	class Matrix extends Float32Array
	{
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		static get idenity()
		{
			return base.idenity( new this.constructor() )
		}
		static get ELEMENTS()
		{
			return length;
		}
		static get BYTE_LENGTH()
		{
			return length * Float32Array.BYTES_PER_ELEMENT;
		}
		static get BYTES()
		{
			return length * Float32Array.BYTES_PER_ELEMENT;
		}
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		static clone( m )
		{
			return new this.constructor( m );
		}
		static invert( m, out=(new this.constructor()) )
		{
			return base.invert( out, m );
		}
		static determinant( m )
		{
			return base.determinant( m );
		}
		static multiply( a,b, out=(new this.constructor()) )
		{
			return base.multiply( out, a, b );
		}
		static mul( a,b, out=(new this.constructor()) )
		{
			return base.mul( out, a, b  );
		}
		static rotate( m, radians, out=(new this.constructor()) )
		{
			return base.rotate( out, m, radians );
		}
		static scale( m, vec2, out=(new this.constructor()) )
		{
			return base.scale( out, m, vec2 );
		}
		static fromRotation( radians, out=(new this.constructor()) )
		{
			return base.fromRotation( out, radians );
		}
		static fromScaling( factor, out=(new this.constructor()) )
		{
			return base.fromScaling( out, factor );
		}
		static str( m )
		{
			return base.str( m );
		}
		static frob( m )
		{
			return base.frob( m );
		}
		static exactEquals( a, b )
		{
			return base.exactEquals( a, b );
		}
		static equals( a, b )
		{
			return base.equals( a, b );
		}
		static multiplyScalar( m, factor, out=(new this.constructor()) )
		{
			return base.multiplyScalar( out, m, factor );
		}
		static multiplyScalarAndAdd( a, b, factor, out=(new this.constructor()) )
		{
			return base.multiplyScalarAndAdd( out, a, b, factor );
		}
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		constructor( ...args )
		{
			super( ...(parse_args( length, args )) );
			base.identity( this );
		}
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		get isMatrix()
		{
			return true;
		}
		get str()
		{
			return base.str( this );
		}
		get frob()
		{
			return base.frob( this );
		}
		get clone()
		{
			return new this.constructor( this );
		}
		get determinant()
		{
			return base.determinant( this );
		}
		get inverse()
		{
			return base.invert( out, this );
		}
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		copy( other )
		{
			return base.copy( this, other );
		}
		setToIdentity()
		{
			return base.identity( this );
		}
		set( ...args )
		{
			return base.set( this, ...args );
		}
		invert()
		{
			return base.invert( this, this );
		}
		multiply( other )
		{
			return base.multiply( this, this, other );
		}
		mul( other )
		{
			return base.mul( this, this, other );
		}
		rotate( radians )
		{
			return base.rotate( this, this, radians );
		}
		scale( vec2 )
		{
			return base.scale( this, this, vec2 );
		}
		add( other )
		{
			return base.add( this, this, other );
		}
		subtract( other )
		{
			return base.subtract( this, this, other );
		}
		sub( other )
		{
			return base.subtract( this, this, other );
		}
		exactEquals( other )
		{
			return base.exactEquals( this, other );
		}
		equals( other )
		{
			return base.equals( this, other );
		}
		multiplyScalar( factor )
		{
			return base.multiplyScalar( this, this, factor );
		}
		multiplyScalarAndAdd( other, factor )
		{
			return base.multiplyScalarAndAdd( this, this, other, factor );
		}
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	}
	return Matrix;
}
module.exports = {Matrix_Template};
},{}],20:[function(require,module,exports){
const  { Vector2    } = require( "./vector2"    );
const  { Vector3    } = require( "./vector3"    );
const  { Vector4    } = require( "./vector4"    );
const  { Quaternion } = require( "./quaternion" );
const  { Matrix2    } = require( "./matrix2"    );
const  { Matrix2d   } = require( "./matrix2d"   );
const  { Matrix3    } = require( "./matrix3"    );
const  { Matrix4    } = require( "./matrix4"    );

module.exports =
{
	Vector2,
	Vector3,
	Vector4,
	Quaternion,
	Matrix2,
	Matrix2d,
	Matrix3,
	Matrix4
};


},{"./matrix2":21,"./matrix2d":22,"./matrix3":23,"./matrix4":24,"./quaternion":25,"./vector2":27,"./vector3":28,"./vector4":29}],21:[function(require,module,exports){
const { mat2            } = require( "./gl-matrix/index" );
const { Matrix_Template } = require( "./matrix.base"     );

class Matrix2 extends Matrix_Template( mat2, 4 )
{
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	static transpose( m )
	{
		return mat2.transpose( new Matrix2(), m );
	}
	static adjoint( m )
	{
		return mat2.adjoint( new Matrix2(), m );
	}
	static LDU( mLower, mDiag, mUpper, m )
	{
		return mat2.LDU( mLower, mDiag, mUpper, m );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	constructor( ...args )
	{
		super( ...args );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	get isMatrix2()
	{
		return true;
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	transpose()
	{
		return mat2.transpose( this, this );
	}
	adjoint()
	{
		return mat2.adjoint( this, this );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}
module.exports = {Matrix2};
},{"./gl-matrix/index":10,"./matrix.base":19}],22:[function(require,module,exports){
const { mat2d            } = require( "./gl-matrix/index" );
const { Matrix_Template } = require( "./matrix.base"     );

class Matrix2d extends Matrix_Template( mat2d, 6 )
{
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	static translate( m, vec2 )
	{
		return mat2d.translate( new Matrix2d, m, vec2 );
	}
	static fromTranslation( vec2 )
	{
		return mat2d.fromTranslation( new Matrix2d, vec2 );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	constructor( ...args )
	{
		super( ...args );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	get isMatrix2d()
	{
		return true;
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	translate( vec2 )
	{
		return mat2d.translate( this, this, vec2 );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}
module.exports = {Matrix2d};
},{"./gl-matrix/index":10,"./matrix.base":19}],23:[function(require,module,exports){
const { mat3            } = require( "./gl-matrix/index" );
const { Matrix_Template } = require( "./matrix.base"     );

class Matrix3 extends Matrix_Template( mat3, 9 )
{
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	static fromMat4( mat4 )
	{
		return mat3.fromMat4( new Matrix3(), mat4 );
	}
	static fromTranslation( vec2 )
	{
		return mat3.fromTranslation( new Matrix3(), vec2 );
	}
	static fromMat2d( mat2d )
	{
		return mat3.fromMat2d( new Matrix3(), mat2d );
	}
	static fromQuat( quat )
	{
		return mat3.fromQuat( new Matrix3(), quat );
	}
	static normalFromMat4( mat4 )
	{
		return mat3.normalFromMat4( new Matrix3(), mat4 );
	}
	static transpose( mat3 )
	{
		return mat3.transpose( new Matrix3(), mat3 );
	}
	static adjoint( mat3 )
	{
		return mat3.adjoint( new Matrix3(), mat3 );
	}
	static translate( mat3, vec2 )
	{
		return mat3.translate( new Matrix3(), mat3, vec2 );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	constructor( ...args )
	{
		super( ...args );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	get isMatrix3()
	{
		return true;
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	transpose()
	{
		return mat3.transpose( this, this );
	}
	adjoint()
	{
		return mat3.adjoint( this, this );
	}
	translate( vec2 )
	{
		return mat3.translate( this, this, vec2 );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}
module.exports = {Matrix3};
},{"./gl-matrix/index":10,"./matrix.base":19}],24:[function(require,module,exports){
const { mat4            } = require( "./gl-matrix/index" );
const { Matrix_Template } = require( "./matrix.base"     );
const { Vector3         } = require( "./vector3"         );

class Matrix4 extends Matrix_Template( mat4, 16 )
{
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	static perspective( fovy, aspect, near, far, out=(new Matrix4()) )
	{
		return mat4.perspective( out, fovy, aspect, near, far );
	}
	static perspectiveFromFieldOfView( fov, near, far, out=(new Matrix4()) )
	{
		return mat4.perspectiveFromFieldOfView( out, fov, near, far );
	}
	static ortho( left, right, bottom, top, near, far, out=(new Matrix4()) )
	{
		return mat4.ortho( out, left, right, bottom, top, near, far );
	}
	static frustum( left, right, bottom, top, near, far, out=(new Matrix4()) )
	{
		return mat4.frustum( out, left, right, bottom, top, near, far );
	}
	static lookAt( eye, center, up, out=(new Matrix4()) )
	{
		return mat4.lookAt( out, eye, center, up );
	}
	static fromTranslation( vec3, out=(new Matrix4()) )
	{
		return mat4.fromTranslation( out, vec3 );
	}
	static fromRotation( radians, axis, out=(new Matrix4()) )
	{
		return mat4.fromXRotation( out, radians, axis );
	}
	static fromXRotation( radians, out=(new Matrix4()) )
	{
		return mat4.fromXRotation( out, radians );
	}
	static fromYRotation( radians, out=(new Matrix4()) )
	{
		return mat4.fromYRotation( out, radians );
	}
	static fromZRotation( radians, out=(new Matrix4()) )
	{
		return mat4.fromZRotation( out, radians );
	}
	static fromRotationTranslation( q_rotation, v3_translation, out=(new Matrix4()) )
	{
		return mat4.fromRotationTranslation( out, q_rotation, v3_translation );
	}
	static fromRotationTranslationScale( q_rotation, v3_translation, v3_scaling, out=(new Matrix4()) )
	{
		return mat4.fromRotationTranslationScale( out, q_rotation,  v3_translation, v3_scaling );
	}
	static fromRotationTranslationScaleOrigin( q_rotation, v3_translation, v3_scaling, v3_origin, out=(new Matrix4()) )
	{
		return mat4.fromRotationTranslationScaleOrigin( out, q_rotation, v3_translation, v3_scaling, v3_origin, out=(new Matrix4()) );
	}
	static fromQuat( quat, out=(new Matrix4()) )
	{
		return mat4.fromQuat( out, quat );
	}
	static transpose( mat4, out=(new Matrix4()) )
	{
		return mat4.transpose( out, mat4 );
	}
	static adjoint( mat4, out=(new Matrix4()) )
	{
		return mat4.adjoint( out, mat4 );
	}
	static translate( mat4, vec3, out=(new Matrix4()) )
	{
		return mat4.translate( out, mat4, vec3 );
	}
	static rotate( mat4, radians, axis, out=(new Matrix4()) )
	{
		return mat4.rotate( out, mat4, radians, axis );
	}
	static rotateX( mat4, radians, out=(new Matrix4()) )
	{
		return mat4.rotateX( out, mat4, radians );
	}
	static rotateY( mat4, radians, out=(new Matrix4()) )
	{
		return mat4.rotateY( out, mat4, radians );
	}
	static rotateZ( mat4, radians, out=(new Matrix4()) )
	{
		return mat4.rotateZ( out, mat4, radians );
	}
	static translation( mat4, out=(new Vector3()) )
	{
		return mat4.getTranslation( out, mat4 );
	}
	static scaling( mat4, out=(new Vector3()) )
	{
		return mat4.getScaling( out, mat4 );
	}
	static rotation( mat4, out=(new Quaternion()) )
	{
		return mat4.getRotation( out, mat4 );
	}
	static decomposition( mat4, out_t=(new Vector3()), out_r=(new Quaternion()), out_s=(new Vector3()) )
	{
		return {
			translation : Matrix4.translation( this, out_t ),
			rotation    : Matrix4.rotation( this, out_r ),
			scale       : Matrix4.scaling( this, out_s )
		};
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	constructor( ...args )
	{
		super( ...args );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	get isMatrix4()
	{
		return true;
	}
	get translation()
	{
		return mat4.getTranslation( new Vector3(), this );
	}
	get scaling()
	{
		return mat4.getScaling( new Vector3(), this );
	}
	get rotation()
	{
		return mat4.getRotation( new Quaternion(), this );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	compose( r, t, s )
	{
		Matrix4.fromRotationTranslationScale( r, t, s, this );
		return this;
	}
	decompose( r=(new Quaternion()), t=(new Vector3()), s=(new Vector3()) )
	{
		Matrix4.translation( this, t );
		Matrix4.rotation( this, r );
		Matrix4.scaling( this, s );
		return this;
	}
	lookAt( eye, center, up )
	{
		return mat4.lookAt( this, eye, center, up );
	}
	transpose()
	{
		return mat4.transpose( this, this );
	}
	adjoint()
	{
		return mat4.adjoint( this, this );
	}
	translate( vec3 )
	{
		return mat4.translate( this, this, vec3 );
	}
	rotate( radians, axis )
	{
		return mat4.rotate( this, this, radians, axis );
	}
	rotateX( radians )
	{
		return mat4.rotateX( this, this, radians );
	}
	rotateY( radians )
	{
		return mat4.rotateY( this, this, radians );
	}
	rotateZ( radians )
	{
		return mat4.rotateZ( this, this, radians );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}

module.exports = {Matrix4};
},{"./gl-matrix/index":10,"./matrix.base":19,"./vector3":28}],25:[function(require,module,exports){
const { quat         } = require( "./gl-matrix/index" );
const { Vector3      } = require( "./vector3"         );
const { Vector4      } = require( "./vector4"         );
const { Matrix4      } = require( "./matrix4"         );

class Quaternion extends Vector4
{
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	static rotation( a, b )
	{
		return quat.rotationTo( new Quaternion(), a, b );
	}
	static setAxes( v3_view, v3_right, v3_up )
	{
		return quat.setAxes( new Quaternion(), v3_view, v3_right, v3_up );
	}
	static get identity()
	{
		return quat.identity( new Quaternion() );
	}
	static setToIdentity()
	{
		return quat.identity( new Quaternion() );
	}
	static setAxisAngle( v3_axis, rad )
	{
		return quat.setAxisAngle( new Quaternion(), v3_axis, rad );
	}
	static getAxisAngle( q, v3_axis = new Vector3() )
	{
		return { axis: v3_axis, radians: quat.getAxisAngle( v3_axis, q ) };
	}
	static multiply( a, b )
	{
		return quat.multiply( new Quaternion(), a, b );
	}
	static mul( a, b )
	{
		return quat.mul( new Quaternion(), a, b );
	}
	static rotateX( q, radians )
	{
		return quat.rotateX( new Quaternion(), q, radians );
	}
	static rotateY( q, radians )
	{
		return quat.rotateY( new Quaternion(), q, radians );
	}
	static rotateZ( q, radians )
	{
		return quat.rotateZ( new Quaternion(), q, radians );
	}
	static calculateW( q )
	{
		return quat.calculateW( new Quaternion(), q );
	}
	static slerp( q_a, q_b, factor )
	{
		return quat.slerp( new Quaternion(), q_a, q_b, factor );
	}
	static sqlerp( q_a, q_b, q_c, q_d, factor )
	{
		return quat.sqlerp( new Quaternion(), q_a, q_b, q_c, q_d, factor );
	}
	static invert( q )
	{
		return quat.invert( new Quaternion(), q );
	}
	static conjugate( q )
	{
		return quat.conjugate( new Quaternion(), q );
	}
	static fromMat3( mat3 )
	{
		return quat.fromMat3( new Quaternion(), mat3 );
	}
	static toMat4( quat )
	{
		return Matrix4.fromQuat( this );
	}
	static str( q )
	{
		return quat.str( q );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	constructor( ...args )
	{
		super( ...args );
		quat.identity( this );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	get isQuaternion()
	{
		return true;
	}
	get str()
	{
		return quat.str( this );
	}
	get mat4()
	{
		return Matrix4.fromQuat( this );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	rotationTo( b )
	{
		return quat.rotationTo( this, this, b );
	}
	setAxes( v3_view, v3_right, v3_up )
	{
		return quat.setAxes( this, v3_view, v3_right, v3_up );
	}
	toIdentity()
	{
		return quat.identity( this );
	}
	setAxisAngle( v3_axis, rad )
	{
		return quat.setAxisAngle( this, v3_axis, rad );
	}
	getAxisAngle( v3_axis = new Vector3() )
	{
		return { axis: v3_axis, radians: quat.getAxisAngle( v3_axis, this ) };
	}
	multiply( other )
	{
		return quat.multiply( this, this, other );
	}
	mul( other )
	{
		return quat.mul( this, this, other );
	}
	rotateX( radians )
	{
		return quat.rotateX( this, this, radians );
	}
	rotateY( radians )
	{
		return quat.rotateY( this, this, radians );
	}
	rotateZ( radians )
	{
		return quat.rotateZ( this, this, radians );
	}
	calculateW()
	{
		return quat.calculateW( this, this );
	}
	slerp( q_a, q_b, factor )
	{
		return quat.slerp( this, q_a, q_b, factor );
	}
	sqlerp( q_a, q_b, q_c, q_d, factor )
	{
		return quat.sqlerp( this, q_a, q_b, q_c, q_d, factor );
	}
	invert()
	{
		return quat.invert( this, this );
	}
	conjugate()
	{
		return quat.conjugate( this, this );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}

module.exports = {Quaternion};
},{"./gl-matrix/index":10,"./matrix4":24,"./vector3":28,"./vector4":29}],26:[function(require,module,exports){
function parse_args( length, args )
{
	return args.length ? [...args,length] : [length];
}

function Vector_Template( base, length )
{
	class Vector extends Float32Array
	{
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		static get ELEMENTS()
		{
			return length;
		}
		static get BYTE_LENGTH()
		{
			return length * Float32Array.BYTES_PER_ELEMENT;
		}
		static get BYTES()
		{
			return length * Float32Array.BYTES_PER_ELEMENT;
		}
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		static clone( a )
		{
			return new this.constructor( a );
		}
		static add( a, b, out=(new this.constructor()) )
		{
			return base.add( out, a, b );
		}
		static sub( a, b, out=(new this.constructor()) )
		{
			return base.subtract( out, a, b );
		}
		static subtract( a, b, out=(new this.constructor()) )
		{
			return base.subtract( out, a, b );
		}
		static mul( a, b, out=(new this.constructor()) )
		{
			return base.multiply( out, a, b );
		}
		static multiply( a, b, out=(new this.constructor()) )
		{
			return base.multiply( out, a, b );
		}
		static div( a, b, out=(new this.constructor()) )
		{
			return base.divide( out, a, b );
		}
		static divide( a, b, out=(new this.constructor()) )
		{
			return base.divide( out, a, b );
		}
		static ceil( a, out=(new this.constructor()) )
		{
			return base.ciel( out, a );
		}
		static floor( a, out=(new this.constructor()) )
		{
			return base.floor( out, a );
		}
		static round( a, out=(new this.constructor()) )
		{
			return base.round( out, a );
		}
		static min( a, b, out=(new this.constructor()) )
		{
			return base.min( out, a, b );
		}
		static max( a, b, out=(new this.constructor()) )
		{
			return base.max( out, a, b );
		}
		static each( array, stride, offset, count, fn, arg )
		{
			return base.each( array, stride, offset, count, fn, arg );
		}
		static scale( a, factor, out=(new this.constructor()) )
		{
			return base.scale( out, a, factor );
		}
		static scaleAndAdd( a, b, factor, out=(new this.constructor()) )
		{
			return base.scaleAndAdd( out, a, b, factor );
		}
		static distance( a, b, out=(new this.constructor()) )
		{
			return base.distance( out, b );
		}
		static dist( a, b, out=(new this.constructor()) )
		{
			return base.distance( out, b );
		}
		static squaredDistance( a, b )
		{
			return base.squaredDistance( a, b );
		}
		static sqrDist( a, b )
		{
			return base.squaredDistance( b );
		}
		static length( a )
		{
			return base.length( a );
		}
		static len( a )
		{
			return base.length( a );
		}
		static squaredLength( a )
		{
			return base.squaredLength( a );
		}
		static sqrLen( a )
		{
			return base.squaredLength();
		}
		static negate( a, out=(new this.constructor()) )
		{
			return base.negate( out, a );
		}
		static inverse( out=(new this.constructor()) )
		{
			return base.inverse( out, a );
		}
		static normalize( a, out=(new this.constructor()) )
		{
			return base.normalize( out, a );
		}
		static dot( a, b )
		{
			return base.dot( a, b );
		}
		static lerp( a, b, factor )
		{
			return base.lerp( out, a, b, factor );
		}
		static random( factor = 1.0, out=(new this.constructor()) )
		{
			return base.random( out, factor );
		}
		static transformMat4( a, mat4, out=(new this.constructor()) )
		{
			return base.transformMat4( out, a, mat4 );
		}
		static toString( a )
		{
			return base.str( a );
		}
		static exactEquals( a, b )
		{
			return base.exactEquals( a, b );
		}
		static equals( a, b )
		{
			return base.equals( a, b );
		}
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		constructor( ...args )
		{
			super( ...(parse_args( length, args )) );
		}
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		get isVector()
		{
			return true;
		}
		get clone()
		{
			return new this.constructor( this );
		}
		get magnitude()
		{
			return base.length( this );
		}
		get mag()
		{
			return base.length( this );
		}
		get squaredLength()
		{
			return base.squaredLength( this );
		}
		get sqrLen()
		{
			return base.squaredLength( this );
		}
		get negation()
		{
			return base.negate( this.clone, this );
		}
		get inverse()
		{
			return base.inverse( this.clone, this );
		}
		////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		copy( other )
		{
			return base.set( this, ...other );
		}
		set( ...args )
		{
			return base.set( this, ...args );
		}
		add( other )
		{
			return base.add( this, this, other );
		}
		subtract( other )
		{
			return base.subtract( this, this, other );
		}
		sub( other )
		{
			return this.subtract( other );
		}
		multiply( other )
		{
			return base.multiply( this, this, other );
		}
		mul()
		{
			return this.multiply( other );
		}
		divide( other )
		{
			return base.divide( this, this, other );
		}
		div()
		{
			return this.divide( other );
		}
		ceil()
		{
			return base.ceil( this, this );
		}
		floor()
		{
			return base.floor( this, this );
		}
		min()
		{
			return base.min( this, other );
		}
		max()
		{
			return base.max( this, other );
		}
		round()
		{
			return base.round( this, this );
		}
		scale( factor )
		{
			return base.scale( this, this, factor );
		}
		scaleAndAdd( other, factor )
		{
			return base.scaleAndAdd( this, this, other, factor );
		}
		distance( other )
		{
			return base.distance( this, other );
		}
		dist( other )
		{
			return this.distance( other );
		}
		squaredDistance( other )
		{
			return base.squaredDistance( this, other );
		}
		sqrDist( other )
		{
			return this.squaredDistance( other );
		}
		negate()
		{
			return base.negate( this, this );
		}
		invert()
		{
			return base.inverse( this, this );
		}
		normalize()
		{
			return base.normalize( this, this );
		}
		dot( other )
		{
			return base.dot( this, other );
		}
		lerp( other, factor )
		{
			return base.lerp( this, this, other, factor );
		}
		random( factor = 1.0 )
		{
			return base.random( this, factor );
		}
		transformMat4( mat4 )
		{
			return base.transformMat4( this, this, mat4 );
		}
		toString()
		{
			return base.str( this );
		}
		get [Symbol.toStringTag]()
		{
			return base.str( this );
		}
		exactEquals( other )
		{
			return base.exactEquals( this, other );
		}
		equals( other )
		{
			return base.equals( this, other );
		}
	}
	return Vector;
}

module.exports = {Vector_Template};
},{}],27:[function(require,module,exports){
const { vec2            } = require( "./gl-matrix/index" );
const { Vector_Template } = require( "./vector.base"     );
const BaseClass = Vector_Template( vec2, 2 );

class Vector2 extends BaseClass
{
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	static cross( a, b )
	{
		return vec2.cross( new Vector2(), a, b );
	}
	static transformMat2( v, m )
	{
		return vec2.transformMat2( new Vector2(), v, m );
	}
	static transformMat2d( v, m )
	{
		return vec2.transformMat2d( new Vector2(), v, m );
	}
	static transformMat3( v, m )
	{
		return vec2.transformMat3( new Vector3(), v, m );
	}
	static fromObject( {x=0.0, y=0.0}, out=(new Vector2()) )
	{
		return vec2.set( out, x, y );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	constructor( ...args )
	{
		super( ...args );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	get isVector2()
	{
		return true;
	}
	get x()
	{
		return this[ 0 ];
	}
	get y()
	{
		return this[ 1 ];
	}
	set x( value )
	{
		this[ 0 ] = value;
	}
	set y( value )
	{
		this[ 1 ] = value;
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	setFromObject( {x=0.0,y=0.0} )
	{
		return vec2.set( this, x, y );
	}
	cross( b )
	{
		return vec2.cross( this, this, b );
	}
	transformMat2( m )
	{
		return vec2.transformMat2( this, this, m );
	}
	transformMat2d( m )
	{
		return vec2.transformMat2d( this, this, m );
	}
	transformMat3( m )
	{
		return vec2.transformMat3( this, this, m );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}


module.exports = {Vector2};
},{"./gl-matrix/index":10,"./vector.base":26}],28:[function(require,module,exports){
const { vec3            } = require( "./gl-matrix/index" );
const { Vector_Template } = require( "./vector.base"     );

class Vector3 extends Vector_Template( vec3, 3 )
{
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	static cross( a, b )
	{
		return vec3.cross( new Vector3(), a, b );
	}
	static hermite( v1, v2, v3, v4, factor )
	{
		return vec3.hermite( new Vector3(), v1, v2, v3, v4, factor );
	}
	static bezier( v1, v2, v3, v4, factor )
	{
		return vec3.bezier( new Vector3(), v1, v2, v3, v4, factor );
	}
	static transformMat3( v, m )
	{
		return vec3.transformMat3( new Vector3(), v, m );
	}
	static transformQuat( v, q )
	{
		return basetransformQuat( new Vector3(), v, q );
	}
	static rotateX( v, origin, angle )
	{
		return vec3.rotateX( new Vector3(), v, origin, angle );
	}
	static rotateY( v, origin, angle )
	{
		return vec3.rotateY( new Vector3(), v, origin, angle );
	}
	static rotateZ( v, origin, angle )
	{
		return vec3.rotateZ( new Vector3(), v, origin, angle );
	}
	static angle( a, b )
	{
		return vec3.angle( a, b );
	}
	static fromObject( {x=0.0, y=0.0, z=0.0}, out=(new Vector4()) )
	{
		return vec3.set( out, x, y, z );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	get isVector3()
	{
		return true;
	}
	get x()
	{
		return this[ 0 ];
	}
	get y()
	{
		return this[ 1 ];
	}
	get z()
	{
		return this[ 2 ];
	}
	set x( value )
	{
		this[ 0 ] = value;
	}
	set y( value )
	{
		this[ 1 ] = value;
	}
	set z( value )
	{
		this[ 2 ] = value;
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	setFromObject( {x=0.0, y=0.0, z=0.0} )
	{
		return vec3.set( this, x, y, z );
	}
	cross( b )
	{
		return vec3.cross( this, this, b );
	}
	transformMat3( m )
	{
		return vec3.transformMat3( this, this, m );
	}
	transformQuat( q )
	{
		return vec3.transformQuat( this, this, q );
	}
	rotateX( angle, origin=[0,0,0] )
	{
		return vec3.rotateX( this, this, origin, angle );
	}
	rotateY( angle, origin=[0,0,0] )
	{
		return vec3.rotateY( this, this, origin, angle );
	}
	rotateZ( angle, origin=[0,0,0] )
	{
		return vec3.rotateZ( this, this, origin, angle );
	}
	angle( other )
	{
		return vec3.angle( this, other );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}
module.exports = {Vector3};
},{"./gl-matrix/index":10,"./vector.base":26}],29:[function(require,module,exports){
const { vec4            } = require( "./gl-matrix/index" );
const { Vector_Template } = require( "./vector.base"     );

class Vector4 extends Vector_Template( vec4, 4 )
{
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	static transformQuat( vec4, quat )
	{
		return vec4.transformQuat( new Vector4(), vec4, quat );
	}
	static fromObject( {x=0.0, y=0.0, z=0.0, w=0.0}, out=(new Vector4()) )
	{
		return vec4.set( out, x, y, z, w );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	get isVector4(){ return true;       }
	get x()        { return this[ 0 ];  }
	get y()        { return this[ 1 ];  }
	get z()        { return this[ 2 ];  }
	get w()        { return this[ 3 ];  }
	set x( value ) { this[ 0 ] = value; }
	set y( value ) { this[ 1 ] = value; }
	set z( value ) { this[ 2 ] = value; }
	set w( value ) { this[ 3 ] = value; }
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	setFromObject( {x=0.0, y=0.0, z=0.0, w=0.0} )
	{
		return vec4.set( this, x, y, z, w );
	}
	transformQuat( quat )
	{
		return vec4.transformQuat( this, this, quat );
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}
module.exports = {Vector4};
},{"./gl-matrix/index":10,"./vector.base":26}],30:[function(require,module,exports){

class Timestep
{
	constructor( fps, callback )
	{
		this.fps       = fps;
		this.duration  = 1000 / fps;
		this.delta     = 0.0;
		this.timer     = null;
		this.prev_time = 0.0;
		this.curr_time = 0.0;
		this.callback  = callback;
		this.running   = null;
	}
	start()
	{
		this.running = true;
		requestAnimationFrame( this.callback );
		this.timer   = setTimeout( ()=>(this.update()), this.duration );
	}
	update()
	{
		if( !this.running ) return;

		this.prev_time = this.curr_time;
		this.curr_time = performance.now();
		this.delta    += this.curr_time - this.prev_time;

		if( this.delta >= this.duration )
		{
			this.delta = 0.0;
			requestAnimationFrame( this.callback );
			clearTimeout( this.timer );
			this.timer   = setTimeout( ()=>(this.update()), this.duration );
		}
		else
		{
			clearTimeout( this.timer );
			this.timer = setTimeout( ()=>(this.update()), (this.duration-this.delta)|0 );
		}
	}
	stop()
	{
		clearTimeout( this.timer );
		this.running = false;
	}
}

module.exports = Timestep;
},{}],31:[function(require,module,exports){

const isArray           = Array.isArray;
const isArrayBufferView = ArrayBuffer.isView;
const isArrayBuffer     = (x) => (x instanceof ArrayBuffer);
const isDataView        = (x) => (x instanceof Dataview);
const isTypedArray      = (x) => ( ArrayBuffer.isView(x) && !(x instanceof Dataview) );
const isUint8Array      = (x) => (x instanceof Uint8Array);
const isUint16Array     = (x) => (x instanceof Uint16Array);
const isUint32Array     = (x) => (x instanceof Uint32Array);
const isInt8Array       = (x) => (x instanceof Int8Array);
const isInt32Array      = (x) => (x instanceof Int16Array);
const isInt16Array      = (x) => (x instanceof Int32Array);
const isUint8CArray     = (x) => (x instanceof Uint8ClampedArray);
const isFloatArray      = (x) => (x instanceof Float32Array);
const isDoubleArray     = (x) => (x instanceof Float64Array);

function isArrayBufferViewType( x )
{
	return (
		Float32Array.isPrototypeOf(x) ||
		Uint8Array.isPrototypeOf(x)   ||
		Uint16Array.isPrototypeOf(x)  ||
		Uint32Array.isPrototypeOf(x)  ||
		Int8Array.isPrototypeOf(x)    ||
		Int16Array.isPrototypeOf(x)   ||
		Int32Array.isPrototypeOf(x)   ||
		Float32Array.isPrototypeOf(x) ||
		Float64Array.isPrototypeOf(x)
	);
}

module.exports =
{
	isArray,
	isArrayBufferViewType,
	isArrayBufferView,
	isArrayBuffer,
	isDataView,
	isTypedArray,
	isUint8Array,
	isUint16Array,
	isUint32Array,
	isInt8Array,
	isInt32Array,
	isInt16Array,
	isUint8CArray,
	isFloatArray,
	isDoubleArray
};
},{}],32:[function(require,module,exports){
require( './globals' );
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class Location
{
	constructor( program, attribute )
	{
		this.pid   = program.id;
		this.index = gl.getAttribLocation( program.id, `a_${attribute.name}` );
		if( this.index === -1 )
			throw `invalid attribute index for a_${attribute.name}`;
	}
}
class Attribute
{
	constructor( name, size, type, normalize, stride, offset )
	{
		this.locations = new WeakMap();
		this.location  = null;
		this.name      = name;
		this.size      = size;
		this.type      = type;
		this.normalize = normalize;
		this.stride    = stride;
		this.offset    = offset;
	}
	bind( program=Program.current )
	{
		if( Program.current === null )
			throw 'No Program';
		if( !(this.location = this.locations.get( program )) )
				this.locations.set( program, (this.location = new Location( program, this )) );
		return this;
	}
	enable()
	{
		this.bind();
		gl.vertexAttribPointer( this.location.index, (this.size)|0, this.type, this.normalize, (this.stride)|0, (this.offset)|0 );
		gl.enableVertexAttribArray( this.location.index );
		return this;
	}
	toString()
	{
		return `[Attribute]{ name: a_${this.name}, index:${this.location.index}, size:${this.size}, type:${this.type}, normalize:${this.normalize}, stride:${this.stride}, offset:${this.offset} }`
	}
	disable()
	{
		gl.disableVertexAttribArray( this.location.index );
		return this;
	}
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = Attribute;
},{"./globals":36}],33:[function(require,module,exports){
(function (Buffer){
require( './globals' );
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const _usage =
{
	static :
	{
		copy : WEBGL2.STATIC_COPY,
		draw : WEBGL2.STATIC_DRAW,
		read : WEBGL2.STATIC_READ
	},
	dynamic :
	{
		copy : WEBGL2.DYNAMIC_COPY,
		draw : WEBGL2.DYNAMIC_DRAW,
		read : WEBGL2.DYNAMIC_READ
	},
	stream :
	{
		copy : WEBGL2.STREAM_COPY,
		draw : WEBGL2.STREAM_DRAW,
		read : WEBGL2.STREAM_READ
	}
};

const _target =
{

	array    : WEBGL2.ARRAY_BUFFER,
	elements : WEBGL2.ELEMENT_ARRAY_BUFFER,
	copy :
	{
		read  : WEBGL2.COPY_READ_BUFFER,
		write : WEBGL2.COPY_WRITE_BUFFER
	},
	transformFeedback : WEBGL2.TRANSFORM_FEEDBACK_BUFFER,
	uniform           : WEBGL2.UNIFORM_BUFFER,
	pixel :
	{
		pack   : WEBGL2.PIXEL_PACK_BUFFER,
		unpack : WEBGL2.PIXEL_UNPACK_BUFFER
	}
};

class Buffer
{
	////////////////////////////////////////////////////////////////
	static get usage()  { return _usage;  }
	static get target() { return _target; }

	static get static()   { return _usage.static;    }
	static get dynamic()  { return _usage.dynamic;   }
	static get stream()   { return _usage.stream;    }
	static get verticies(){ return _target.array;    }
	static get indicies() { return _target.elements; }
	static get copy()     { return _target.copy;     }


	////////////////////////////////////////////////////////////////
	constructor( target=_target.array, usage=_usage.static.draw, data, offset, length )
	{
		this.target = target;
		this.usage  = usage;
		this.ref    = gl.createBuffer();
		this.bound  = false;
	}
	bind()
	{
		if( !this.bound )
		{
			gl.bindBuffer( this.target, this.ref );
			this.bound = true;
		}
		return this;
	}
	unbind()
	{
		if( this.bound )
		{
			gl.bindBuffer( this.target, null );
			this.bound = false;
		}
		return this;
	}
	delete()
	{
		gl.deleteBuffer( this.ref );
		return this;
	}
/*
	// WebGL1:
	void gl.bufferData(target, size, usage);
	void gl.bufferData(target, ArrayBuffer? srcData, usage);
	void gl.bufferData(target, ArrayBufferView srcData, usage);
	// WebGL2:
	void gl.bufferData(target, ArrayBufferView srcData, usage, srcOffset, length);
*/
	data( data )
	{
		gl.bufferData( this.target, data, this.usage );
		return this;
	}
/*
	// WebGL1:
	void gl.bufferSubData(target, offset, ArrayBuffer srcData);
	void gl.bufferSubData(target, offset, ArrayBufferView srcData);
	// WebGL2:
	void gl.bufferSubData(target, dstByteOffset, ArrayBufferView srcData, srcOffset, length);
*/
	subData( offset, data )
	{
		gl.bufferSubData( this.target, offset, data );
		return this;
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = Buffer;
}).call(this,require("buffer").Buffer)
},{"./globals":36,"buffer":2}],34:[function(require,module,exports){
require( './globals' );
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const _draw_mode =
{
	points    : WEBGL2.POINTS,
	lines     : WEBGL2.LINES,
	line      :
	{
		loop  : WEBGL2.LINE_LOOP,
		strip : WEBGL2.LINE_STRIP
	},
	triangles : WEBGL2.TRIANGLES,
	triangle  :
	{
		strip : WEBGL2.TRIANGLE_STRIP,
		fan   : WEBGL2.TRIANGLE_FAN
	}
};

const _contexts_ = new WeakMap();

class Context
{
	static get mode()
	{
		return _draw_mode;
	}
	static get current()
	{
		return window.gl;
	}
	static set current( context )
	{
		window.gl = context;
	}
	static For( cavnas )
	{
		return _contexts_.get( canvas );
	}
	////////////////////////////////////////////////////////////////
	constructor( canvas = document.createElement('canvas') )
	{
		this.canvas      = canvas;
		this.gl          = canvas.getContext("webgl2")
		_contexts_.set( canvas, this );
		this.clearbits   = 0;
	}
	makeCurrent()
	{
		Context.current = _contexts_.get( this.canvas ).gl;
		return this;
	}

	// CANVAS OPERATION ////////////////////////////////////////////
	get id()        { return this.canvas.id; }
	get element()   { return this.canvas; }
	get width()     { return this.canvas.offsetWidth; }
	get height()    { return this.canvas.offsetHeight; }
	get size()      { return [this.width, this.height]; }
	set id(v)       { canvas.id = v; }
	set width(v)
	{
		this.canvas.width = v;
		gl.viewport(0, 0, v, this.height);
	}
	set height(v)
	{
		this.canvas.height = v;
		gl.viewport(0, 0, this.width, v);
	}
	set size(v) { this.resize(...v); }
	resize( width, height )
	{
		[this.canvas.width, this.canvas.height] = [width, height];
		this.viewport(0, 0, width, height);
		return this;
	}

	// OPENGL OPERATIONS ///////////////////////////////////////////
	clearDepth( bool, depth=1 )
	{
		if( bool )
		{
			gl.enable( gl.DEPTH_TEST );
			gl.clearDepth( depth );
			this.clearbits |= gl.DEPTH_BUFFER_BIT;
			return this;
		}
		else
		{
			gl.disable( gl.DEPTH_TEST );
			this.clearbits &= ~(1 << gl.DEPTH_BUFFER_BIT);
		}
		return this;
	}
	clearColor(r,g,b,a)
	{
		this.clearbits   |= gl.COLOR_BUFFER_BIT;
		gl.clearColor(r,g,b,a);
		return this;
	}
	clear()
	{
		gl.clear( this.clearbits );
		return this;
	}
	cull( mode )
	{
		gl.enable( gl.CULL_FACE );

		return this;
	}
	blend( bool )
	{
		if( bool )
		{
			gl.enable( gl.BLEND );
		}
		else
		{
			gl.disable( gl.BLEND );
		}
		return this;
	}
	viewport( x,y, w,h )
	{
		//this.uResolution.set( [w,h] )
		gl.viewport( x,y, w,h );
		return this;
	}
	draw( mode, first, count )
	{
		gl.drawArrays( mode, first, count );
	}
	drawElements( mode, count, type, offset )
	{
		gl.drawElements( mode, count, type, offset )
	}
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = Context;

},{"./globals":36}],35:[function(require,module,exports){

require( './globals' );

const Buffer    = require( './buffer'    );
const Program   = require( './program'   );
const Shader    = require( './shader'    );
const Attribute = require( './attribute' );
const Type      = require( './type'      );
const Context   = require( './context'   );
const Uniform   = require( './uniform'   );

module.exports =
{
	Buffer,
	Program,
	Shader,
	Attribute,
	Type,
	Context,
	Uniform,
};

},{"./attribute":32,"./buffer":33,"./context":34,"./globals":36,"./program":37,"./shader":38,"./type":39,"./uniform":40}],36:[function(require,module,exports){

if( window.gl === undefined ) window.gl     = null;
if( window.GL === undefined ) window.WEBGL2 = WebGL2RenderingContext.prototype;

},{}],37:[function(require,module,exports){
require( './globals' );
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let _current_ = null;

class Program
{
	static get current()
	{
		return _current_;
	}
	////////////////////////////////////////////////////////////////

	constructor( vshader, fshader )//, uniforms )// attributes, uniforms )
	{
		this.id         = gl.createProgram();
		this.vert       = vshader;
		this.frag       = fshader;
		this.ready      = false;
		this.error      = false;
		//this.attributes = attributes;
		//this.uniforms   = uniforms;
		this.enabled    = false;

		this.uniform = {
			resolution:
			{
				id: null,
				value: null
			},
			scale:
			{
				id: null,
				value: null
			}
		};

		gl.attachShader( this.id, vshader.id );
		gl.attachShader( this.id, fshader.id );

		if( this.link() )
		{
			//this.attributes.forEach( ( a ) => ( a.bind( this ) ) );
			//this.uniforms.forEach(   ( u ) => ( u.bind( this ) ) );
		}
	}

	link()
	{
		gl.linkProgram( this.id );
		if( !this.linked )
		{
			console.log( this.info );
			return !( this.error = true );
		}
		return( this.ready = true );
	}
	enable()
	{
		if( _current_ !== this )
		{
			if( _current_ !== null ) _current_.disable();
			_current_ = this;
		}
		if( !this.enabled )
		{
			gl.useProgram( this.id );
			//this.attributes.forEach( ( a ) => ( a.bind( this ).enable() ) );
			//this.uniforms.forEach(   ( u ) => ( u.bind( this ).enable() ) );
			this.enabled = true;
		}
		return this;
	}
	disable()
	{
		if( _current_ !== null && _current_ === this )
		{
			_current_ = null;
		}
		if( this.enabled )
		{
			//this.attributes.forEach( ( a ) => ( a.disable() ) );
			//this.uniforms.forEach(   ( u ) => ( u.disable() ) );
			gl.useProgram( null );
			this.enabled = false;
		}
		return this;
	}

	get attributeCount()
	{
		return gl.getProgramParameter( this.id, gl.ACTIVE_ATTRIBUTES );
	}
	get uniformCount()
	{
		return gl.getProgramParameter( this.id, gl.ACTIVE_UNIFORMS );
	}
	get attributes()
	{
		let num = this.attributeCount;
		let r = new Array( num );

		for( let i = 0; i<num; i++)
		{
			r[i] = gl.getActiveAttrib( this.id, i );
		}
		return r;
	}
	get uniforms()
	{
		let num = this.uniformCount;
		let r = new Array( num );

		for( let i = 0; i<num; i++)
		{
			r[i] = gl.getActiveUniform( this.id, i );
		}
		return r;
	}

	get linked()
	{
		return gl.getProgramParameter( this.id, gl.LINK_STATUS );
	}
	get info()
	{
		return gl.getProgramInfoLog( this.id );
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = Program;

},{"./globals":36}],38:[function(require,module,exports){
require( './globals' );
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Shader
{
	////////////////////////////////////////////////////////////////
	static get vertex()   { return gl.VERTEX_SHADER; }
	static get fragment() { return gl.FRAGMENT_SHADER; }
	////////////////////////////////////////////////////////////////

	constructor( type, source )
	{
		this.id    = gl.createShader( type );
		this.error = false;
		this.ready = false;
		this.compile( source );
	}
	compile( source )
	{
		gl.shaderSource( this.id, source );
		gl.compileShader( this.id );

		if( !this.compiled )
		{
			this.error = true;
			console.log( this.info );
			return this;
		}
		this.ready = true;
		return this;
	}
	get compiled()
	{
		return gl.getShaderParameter( this.id, gl.COMPILE_STATUS );
	}
	get info()
	{
		return gl.getShaderInfoLog( this.id );
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = Shader;

},{"./globals":36}],39:[function(require,module,exports){
require( './globals' );
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const { Composite, Handle, Primitive, Type, View } = require( '../buffer/type' );
const Attribute = require( './attribute' );
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class GLPrimitive extends Primitive
{
	constructor( glenum, array_type, getter, setter )
	{
		super( array_type, getter, setter );
		this.glenum = glenum;
	}
	get isGLPrimitive()
	{
		return true;
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class GLView extends View
{
	constructor( glenum, type, normalize=false )
	{
		super( type );
		this.glenum    = glenum;
		this.normalize = normalize;
	}
	get isGLView()
	{
		return true;
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class GLComposite extends Composite
{
	constructor( members, normalize=false )
	{
		super( members, false );
		this._attributes = [];
		this.normalize = normalize;

		Object.defineProperty( this.handle, 'enableGlAttributes',
		{
			value : function () { this.typeinfo.enable(); }
		} );
		Object.defineProperty( this.handle, 'disableGlAttributes',
		{
			value : function () { this.typeinfo.disable(); }
		} );

		return this.handle;
	}
	enable()
	{
		this.attributes.forEach( (a)=>(a.enable()) );
	}
	disable()
	{
		this.attributes.forEach( (a)=>(a.disable()) );
	}
	get attributes()
	{
		if( this._attributes.length === 0 )
		{
			GenGLAttribute( this );
		}
		return this._attributes;
	}

	get isGLComposite()
	{
		return true;
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function GenGLAttribute( gltype, id_chain='', attribs=gltype._attributes, stride=gltype.size  )
{
	let field, type, id, len, glenum, norm, size, off;

	for( let key of gltype.keys )
	{
		field  = gltype.layout[key];
		type   = field.type;
		id     = `${id_chain}${field.key}`;
		len    = field.length;
		glenum = type.glenum;
		norm   = !!type.normalize;
		size   = type.size;
		off    = field.offset;
		if( !!field.isPrimitive )
		{
			attribs.push(new Attribute( id, len, glenum, norm, stride, off ));
			continue;
		}
		if( !!field.isView      )
		{
			attribs.push(new Attribute( id, len, glenum, norm, stride, off ));
			continue;
		}
		if( !!field.isComposite && field.isUniform )
		{
			attribs.push(new Attribute( id, len, type.uniType.glenum, norm, stride, off ));
			continue;
		}
		if( !!field.isComposite && !field.isUniform )
		{
			GenGLAttribute( type, `${id}_`, attribs, stride );
			continue;
		}
	}
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const uint8	 = new GLPrimitive( WEBGL2.UNSIGNED_BYTE,  Uint8Array,   DataView.prototype.getUint8,   DataView.prototype.setUint8   );
const uint16 = new GLPrimitive( WEBGL2.UNSIGNED_SHORT, Uint16Array,  DataView.prototype.getUint16,  DataView.prototype.setUint16  );
const uint32 = new GLPrimitive( WEBGL2.UNSIGNED_INT,   Uint32Array,  DataView.prototype.getUint32,  DataView.prototype.setUint32  );
const int8	 = new GLPrimitive( WEBGL2.BYTE,           Int8Array,    DataView.prototype.getInt8,    DataView.prototype.setInt8    );
const int16	 = new GLPrimitive( WEBGL2.SHORT,          Int16Array,   DataView.prototype.getInt16,   DataView.prototype.setInt16   );
const int32	 = new GLPrimitive( WEBGL2.INT,            Int32Array,   DataView.prototype.getInt32,   DataView.prototype.setInt32   );
const float	 = new GLPrimitive( WEBGL2.FLOAT,          Float32Array, DataView.prototype.getFloat32, DataView.prototype.setFloat32 );
const uint   = uint32;
const int    = int32;
const byte   = int8;
const ubyte  = uint8;
const ushort = uint16;
const short  = int16;

const { Vector2, Vector3, Vector4, Quaternion, Matrix2, Matrix2d, Matrix3, Matrix4 } = require( '../math/matrix');
const { RGBA } = require( '../math/color' );

const v2   = new GLView( WEBGL2.FLOAT,         Vector2  );
const v3   = new GLView( WEBGL2.FLOAT,         Vector3  );
const v4   = new GLView( WEBGL2.FLOAT,         Vector4  );
const m2   = new GLView( WEBGL2.FLOAT,         Matrix2  );
const m2d  = new GLView( WEBGL2.FLOAT,         Matrix2d );
const m3   = new GLView( WEBGL2.FLOAT,         Matrix3  );
const m4   = new GLView( WEBGL2.FLOAT,         Matrix4  );
const rgba = new GLView( WEBGL2.UNSIGNED_BYTE, RGBA     , true );

module.exports =
{
	Primitive : GLPrimitive,
	View      : GLView,
	Composite : GLComposite,

	uint8 	  : uint8,
	uint16 	  : uint16,
	uint32 	  : uint32,
	int8 	  : int8,
	int16 	  : int16,
	int32 	  : int32,
	float 	  : float,
	uint 	  : uint32,
	int 	  : int32,
	ubyte 	  : uint8,
	byte 	  : int8,

	Vector2   : v2,
	Vector3   : v3,
	Vector4   : v4,
	Matrix2   : m2,
	Matrix2d  : m2d,
	Matrix3   : m3,
	Matrix4   : m4,

	RGBA      : rgba
};

},{"../buffer/type":4,"../math/color":8,"../math/matrix":20,"./attribute":32,"./globals":36}],40:[function(require,module,exports){
const Program = require( './program' );
const base = require( '../math/matrix');

class Location
{
	constructor( program, uniform )
	{
		this.pid = program.id;
		this.id  = gl.getUniformLocation( program.id,`u_${uniform.name}` );
	}
}
function ExtendValueType( func )
{
	return class Value
	{
		constructor( name, value )
		{
			this.locations = new WeakMap();
			this.location  = null;
			this.name      = name;
			this.func      = func;
			this.value     = value;
		}
		set( value )
		{
			this.value = value;
		}
		bind( program=Program.current )
		{
			if( Program.current === null )
				throw 'No Program';
			if( !(this.location = this.locations.get( program )) )
				this.locations.set( program, (this.location = new Location( program, this )) );
			return this;
		}
		enable()
		{
			this.bind();
			this.func.call( gl, this.location.id, this.value );
			return this;
		}
		disable()
		{
			return this;
		}
	}
}
function ExtendArrayType( base, func )
{
	return class Uniform extends base
	{
		constructor( name, ...args )
		{
			super( ...args );
			this.locations = new WeakMap();
			this.location  = null;
			this.name      = name;
			this.func      = func;
		}
		bind( program=Program.current )
		{
			if( Program.current === null )
				throw 'No Program';
			if( !(this.location = this.locations.get( program )) )
				this.locations.set( program, (this.location = new Location( program, this )) );
			return this;
		}
		enable()
		{
			this.bind();
			if( this.isVector )
			{
				this.func.call( gl, this.location.id, this );
			}
			else
			{
				this.func.call( gl, this.location.id, false, this );
			}
			return this;
		}
		disable()
		{
			return this;
		}
	}
}
const Integer = ExtendValueType( WEBGL2.uniform1i );
const Float   = ExtendValueType( WEBGL2.uniform1f );

const Vector2 = ExtendArrayType( base.Vector2, WEBGL2.uniform2fv       );
const Vector3 = ExtendArrayType( base.Vector3, WEBGL2.uniform3fv       );
const Vector4 = ExtendArrayType( base.Vector4, WEBGL2.uniform4fv       );
const Matrix2 = ExtendArrayType( base.Matrix2, WEBGL2.uniformMatrix2fv );
const Matrix3 = ExtendArrayType( base.Matrix3, WEBGL2.uniformMatrix3fv );
const Matrix4 = ExtendArrayType( base.Matrix4, WEBGL2.uniformMatrix4fv );

module.exports =
{
	Integer,
	Float,
	Vector2,
	Vector3,
	Vector4,
	Matrix2,
	Matrix3,
	Matrix4,
};


/*
void gl.uniformMatrix2fv(location, transpose, data, optional srcOffset, optional srcLength);
void gl.uniformMatrix3x2fv(location, transpose, data, optional srcOffset, optional srcLength);
void gl.uniformMatrix4x2fv(location, transpose, data, optional srcOffset, optional srcLength);
void gl.uniformMatrix2x3fv(location, transpose, data, optional srcOffset, optional srcLength);
void gl.uniformMatrix3fv(location, transpose, data, optional srcOffset, optional srcLength);
void gl.uniformMatrix4x3fv(location, transpose, data, optional srcOffset, optional srcLength);
void gl.uniformMatrix2x4fv(location, transpose, data, optional srcOffset, optional srcLength);
void gl.uniformMatrix3x4fv(location, transpose, data, optional srcOffset, optional srcLength);
void gl.uniformMatrix4fv(location, transpose, data, optional srcOffset, optional srcLength);
*/

},{"../math/matrix":20,"./program":37}],"webgl":[function(require,module,exports){
module.exports = {
    util:require("./util.js"),
    Timestep:require("./timestep.js"),
    event:require("./event"),
    clock:require("./clock.js"),
    error:require("./error.js"),
    //application:require("./application.js"),
    gl:require("./webgl/gl")
}

},{"./clock.js":5,"./error.js":6,"./event":7,"./timestep.js":30,"./util.js":31,"./webgl/gl":35}]},{},[]);
