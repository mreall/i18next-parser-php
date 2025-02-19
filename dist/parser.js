import _defineProperty from "@babel/runtime/helpers/defineProperty";import _classCallCheck from "@babel/runtime/helpers/classCallCheck";import _createClass from "@babel/runtime/helpers/createClass";import _inherits from "@babel/runtime/helpers/inherits";import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";function _createForOfIteratorHelper(o, allowArrayLike) {var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];if (!it) {if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {if (it) o = it;var i = 0;var F = function F() {};return { s: F, n: function n() {if (i >= o.length) return { done: true };return { done: false, value: o[i++] };}, e: function e(_e) {throw _e;}, f: F };}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}var normalCompletion = true,didErr = false,err;return { s: function s() {it = it.call(o);}, n: function n() {var step = it.next();normalCompletion = step.done;return step;}, e: function e(_e2) {didErr = true;err = _e2;}, f: function f() {try {if (!normalCompletion && it["return"] != null) it["return"]();} finally {if (didErr) throw err;}} };}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];return arr2;}function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);enumerableOnly && (symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;})), keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = null != arguments[i] ? arguments[i] : {};i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {_defineProperty(target, key, source[key]);}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}return target;}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}import path from 'path';
import EventEmitter from 'events';
import HandlebarsLexer from './lexers/handlebars-lexer.js';
import HTMLLexer from './lexers/html-lexer.js';
import JavascriptLexer from './lexers/javascript-lexer.js';
import JsxLexer from './lexers/jsx-lexer.js';
import VueLexer from './lexers/vue-lexer.js';
import PhpLexer from './lexers/php-lexer.js';

var lexers = {
  hbs: ['HandlebarsLexer'],
  handlebars: ['HandlebarsLexer'],

  htm: ['HTMLLexer'],
  html: ['HTMLLexer'],

  mjs: ['JavascriptLexer'],
  js: ['JavascriptLexer'],
  ts: ['JavascriptLexer'],
  jsx: ['JsxLexer'],
  tsx: ['JsxLexer'],

  vue: ['VueLexer'],

  php: ['PhpLexer'],

  "default": ['JavascriptLexer']
};

var lexersMap = {
  HandlebarsLexer: HandlebarsLexer,
  HTMLLexer: HTMLLexer,
  JavascriptLexer: JavascriptLexer,
  JsxLexer: JsxLexer,
  VueLexer: VueLexer,
  PhpLexer: PhpLexer
};var

Parser = /*#__PURE__*/function (_EventEmitter) {_inherits(Parser, _EventEmitter);var _super = _createSuper(Parser);
  function Parser() {var _this;var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, Parser);
    _this = _super.call(this, options);
    _this.options = options;
    _this.lexers = _objectSpread(_objectSpread({}, lexers), options.lexers);return _this;
  }_createClass(Parser, [{ key: "parse", value:

    function parse(content, filename) {var _this2 = this;
      var keys = [];
      var extension = path.extname(filename).substr(1);
      var lexers = this.lexers[extension] || this.lexers["default"];var _iterator = _createForOfIteratorHelper(

          lexers),_step;try {for (_iterator.s(); !(_step = _iterator.n()).done;) {var lexerConfig = _step.value;
          var lexerName = void 0;
          var lexerOptions = void 0;

          if (
          typeof lexerConfig === 'string' ||
          typeof lexerConfig === 'function')
          {
            lexerName = lexerConfig;
            lexerOptions = {};
          } else {
            lexerName = lexerConfig.lexer;
            lexerOptions = lexerConfig;
          }

          var Lexer = void 0;
          if (typeof lexerName === 'function') {
            Lexer = lexerName;
          } else {
            if (!lexersMap[lexerName]) {
              this.emit('error', new Error("Lexer '".concat(lexerName, "' does not exist")));
            }

            Lexer = lexersMap[lexerName];
          }

          var lexer = new Lexer(lexerOptions);
          lexer.on('warning', function (warning) {return _this2.emit('warning', warning);});
          keys = keys.concat(lexer.extract(content, filename));
        }} catch (err) {_iterator.e(err);} finally {_iterator.f();}

      return keys;
    } }]);return Parser;}(EventEmitter);export { Parser as default };
//# sourceMappingURL=parser.js.map