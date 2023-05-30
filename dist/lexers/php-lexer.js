'use strict';import _classCallCheck from "@babel/runtime/helpers/classCallCheck";import _createClass from "@babel/runtime/helpers/createClass";import _inherits from "@babel/runtime/helpers/inherits";import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";import _typeof from "@babel/runtime/helpers/typeof";function _createForOfIteratorHelper(o, allowArrayLike) {var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];if (!it) {if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {if (it) o = it;var i = 0;var F = function F() {};return { s: F, n: function n() {if (i >= o.length) return { done: true };return { done: false, value: o[i++] };}, e: function e(_e) {throw _e;}, f: F };}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}var normalCompletion = true,didErr = false,err;return { s: function s() {it = it.call(o);}, n: function n() {var step = it.next();normalCompletion = step.done;return step;}, e: function e(_e2) {didErr = true;err = _e2;}, f: function f() {try {if (!normalCompletion && it["return"] != null) it["return"]();} finally {if (didErr) throw err;}} };}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];return arr2;}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}

import path from 'path';
import Engine from 'php-parser';
import BaseLexer from './base-lexer.js';

var parser = new Engine();

function objectHas(obj, key) {
  if (!obj || _typeof(obj) !== 'object') return false;
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Parse a PHP file. Adapted from wp-pot.
 * @see https://github.com/wp-pot/wp-pot/blob/master/src/parsers/php-parser.js
 */var
PhpLexer = /*#__PURE__*/function (_BaseLexer) {_inherits(PhpLexer, _BaseLexer);var _super = _createSuper(PhpLexer);
  function PhpLexer() {var _this;var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, PhpLexer);
    _this = _super.call(this, options);

    _this.functions = options.functions || ['I18n::t', 'I18n::e'];
    _this.options = options;
    _this.translations = [];
    _this.comments = {};return _this;
  }_createClass(PhpLexer, [{ key: "extract", value:

    function extract(content, filename) {
      try {
        var ast = parser.parseCode(content, filename);
        this.parseCodeTree(ast, filename);
      } catch (e) {
        this.emit('warning', "Error parsing \"".concat(filename, "\": ").concat(e.message));
      }

      return this.translations;
    }

    /**
     * Parse the AST code tree
    *
    * @param {object} ast
    * @param {string} filename
    */ }, { key: "parseCodeTree", value:
    function parseCodeTree(ast, filename) {
      if (!ast) {
        return;
      }

      if (ast.comments) {var _iterator = _createForOfIteratorHelper(
            ast.comments),_step;try {for (_iterator.s(); !(_step = _iterator.n()).done;) {var comment = _step.value;
            this.parseComment(comment);
          }} catch (err) {_iterator.e(err);} finally {_iterator.f();}
      }

      if (Array.isArray(ast)) {var _iterator2 = _createForOfIteratorHelper(
            ast),_step2;try {for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {var child = _step2.value;
            this.parseCodeTree(child, filename);
          }} catch (err) {_iterator2.e(err);} finally {_iterator2.f();}
        return;
      }

      var methodName = this.validFunctionCall(ast);

      if (methodName) {
        if (this.validArgs(ast.arguments)) {var _args$1$ns;
          var args = this.parseArguments(ast.arguments);
          var namespace = (_args$1$ns = args[1].ns) !== null && _args$1$ns !== void 0 ? _args$1$ns : this.options.defaultNamespace;
          var translationCall = {
            args: args,
            filename: filename,
            method: methodName,
            namespace: namespace,
            key: args[0]
          };

          if (args[1]["default"]) {
            translationCall['defaultValue'] = args[1]["default"];
          }

          this.translations.push(translationCall);
          //this.addTranslation(translationCall);
        }
      } else {
        // List can not be in alphabetic order, otherwise it will not be ordered by occurence in code.
        var childrenContainingCalls = [
        'arguments',
        'alternate',
        'body',
        'catches',
        'children',
        'expr',
        'expression',
        'expressions',
        'trueExpr',
        'falseExpr',
        'items',
        'key',
        'left',
        'right',
        'value',
        'what'];


        for (var _i = 0, _childrenContainingCa = childrenContainingCalls; _i < _childrenContainingCa.length; _i++) {var _child = _childrenContainingCa[_i];
          if (ast[_child]) {
            this.parseCodeTree(ast[_child], filename);
          }
        }
      }
    }

    /**
     * Parse comment AST
     *
     * @param  {object} commentAst
     */ }, { key: "parseComment", value:
    function parseComment(commentAst) {
      var commentRegexp;
      if (commentAst.kind === 'commentblock') {
        commentRegexp = new RegExp("(?:\\/\\*)?[\\s*]*".concat(this.options.commentKeyword, "(.*)\\s*(?:\\*\\/)$"), 'im');
      } else {
        commentRegexp = new RegExp("^\\/\\/\\s*".concat(this.options.commentKeyword, "(.*)$"), 'im');
      }
      var commentParts = commentRegexp.exec(commentAst.value);

      if (commentParts) {
        var lineNumber = commentAst.loc.end.line;
        if (commentAst.loc.end.column === 0) {
          lineNumber--;
        }

        this.comments[lineNumber] = commentParts[1];
      }
    }

    /**
     * Check if ast is a valid function call
     *
     * @param {object} ast
     *
     * @return {string|null}
     */ }, { key: "validFunctionCall", value:
    function validFunctionCall(ast) {
      if (ast.kind === 'call') {
        var methodName = ast.what.name;

        if (ast.what.kind === 'propertylookup' && ast.what.what.kind === 'variable') {
          methodName = ['$', ast.what.what.name, '->', ast.what.offset.name].join('');
        } else if (ast.what.kind === 'name' && ast.what.resolution === 'fqn') {
          methodName = ast.what.name.replace(/^\\/, '');
        } else if (ast.what.kind === 'staticlookup' && ast.what.what.resolution === 'uqn') {
          methodName = [ast.what.what.name, '::', ast.what.offset.name].join('');
        }

        if (this.functions.indexOf(methodName) !== -1) {
          return methodName;
        }
      }

      return null;
    }

    /**
     * Parse arguments in a function call
     *
     * @param {Array} args
     *
     * @return {Array}
     */ }, { key: "parseArguments", value:
    function parseArguments(args) {
      var argsArray = [];var _iterator3 = _createForOfIteratorHelper(
          args),_step3;try {for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {var arg = _step3.value;
          if (arg.kind === 'propertylookup') {
            argsArray.push("$".concat(arg.what.name, "->").concat(arg.offset.name));
          } else if (arg.kind === 'staticlookup') {
            argsArray.push("$".concat(arg.what.name, "::").concat(arg.offset.name));
          } else if (arg.kind === 'variable') {
            argsArray.push("$".concat(arg.name));
          } else if (arg.kind === 'name' && arg.resolution === 'uqn') {
            argsArray.push(arg.name);
          } else if (arg.kind === 'array') {
            argsArray.push(this.getNameValue(arg.items));
          } else {
            argsArray.push(arg.value);
          }
        }} catch (err) {_iterator3.e(err);} finally {_iterator3.f();}

      if (!argsArray[1]) {
        argsArray[1] = [];
      }

      return argsArray;
    } }, { key: "validArgs", value:

    function validArgs(args) {
      if (args[0] && args[0].kind !== 'string') {
        return false;
      }

      if (args[1] && args[1].kind !== 'array') {
        return false;
      }

      return true;
    } }, { key: "getNameValue", value:

    function getNameValue(items) {
      var options = [];
      items.forEach(function (item) {
        if (item.key.kind === 'string' && item.value.kind === 'string') {
          options[item.key.value] = item.value.value;
        }
      });
      return options;
    } }, { key: "getComment", value:

    function getComment(lineNumber) {
      var linesWithComment = Object.keys(this.comments);
      if (!linesWithComment) {
        return null;
      }

      if (linesWithComment[0] > lineNumber) {
        return null;
      }

      var comment;
      if (lineNumber - linesWithComment[0] > 2) {
        delete this.comments[linesWithComment[0]];
        comment = this.getComment(lineNumber);
      } else {
        comment = this.comments[linesWithComment[0]];
        delete this.comments[linesWithComment[0]];
      }

      if (comment) {
        comment = comment.replace(/\s+$/, '');
      }

      return comment;
    }

    /**
     * Add translation call to array
     *
     * @param {object} translationCall
     */ }, { key: "addTranslation", value:
    function addTranslation(translationCall) {
      if (translationCall.args) {
        var translationObject = this.generateTranslationObject(translationCall);

        if (!this.translations[translationObject.key]) {
          this.translations[translationObject.key] = translationObject.value;
        }
      }
    }

    /**
     * Generate an object for a translation
     *
     * @param {object} translationCall
     * @return {object}
     */ }, { key: "generateTranslationObject", value:
    function generateTranslationObject(translationCall) {
      var translationObject = {
        key: translationCall.args[0],
        value: null
      };

      if (objectHas(this.functions.contextPosition, translationCall.method)) {
        var contextKey = this.getContextPos(translationCall.method);
        translationObject.value = translationCall.args[contextKey];
      }

      return translationObject;
    }

    /**
     * Get context argument position
     *
     * @param {string} method
     *
     * @return {number}
     */ }, { key: "getContextPos", value:
    function getContextPos(method) {
      return this.functions.contextPosition[method] - 1;
    } }]);return PhpLexer;}(BaseLexer);export { PhpLexer as default };
//# sourceMappingURL=php-lexer.js.map