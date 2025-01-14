import _typeof from "@babel/runtime/helpers/typeof";import _defineProperty from "@babel/runtime/helpers/defineProperty";import _toConsumableArray from "@babel/runtime/helpers/toConsumableArray";import _classCallCheck from "@babel/runtime/helpers/classCallCheck";import _createClass from "@babel/runtime/helpers/createClass";import _inherits from "@babel/runtime/helpers/inherits";import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";function _createForOfIteratorHelper(o, allowArrayLike) {var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];if (!it) {if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {if (it) o = it;var i = 0;var F = function F() {};return { s: F, n: function n() {if (i >= o.length) return { done: true };return { done: false, value: o[i++] };}, e: function e(_e) {throw _e;}, f: F };}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}var normalCompletion = true,didErr = false,err;return { s: function s() {it = it.call(o);}, n: function n() {var step = it.next();normalCompletion = step.done;return step;}, e: function e(_e2) {didErr = true;err = _e2;}, f: function f() {try {if (!normalCompletion && it["return"] != null) it["return"]();} finally {if (didErr) throw err;}} };}function _unsupportedIterableToArray(o, minLen) {if (!o) return;if (typeof o === "string") return _arrayLikeToArray(o, minLen);var n = Object.prototype.toString.call(o).slice(8, -1);if (n === "Object" && o.constructor) n = o.constructor.name;if (n === "Map" || n === "Set") return Array.from(o);if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);}function _arrayLikeToArray(arr, len) {if (len == null || len > arr.length) len = arr.length;for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];return arr2;}function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);enumerableOnly && (symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;})), keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = null != arguments[i] ? arguments[i] : {};i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {_defineProperty(target, key, source[key]);}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}return target;}function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}import BaseLexer from './base-lexer.js';
import ts from 'typescript';var

JavascriptLexer = /*#__PURE__*/function (_BaseLexer) {_inherits(JavascriptLexer, _BaseLexer);var _super = _createSuper(JavascriptLexer);
  function JavascriptLexer() {var _this;var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, JavascriptLexer);
    _this = _super.call(this, options);

    _this.callPattern = '(?<=^|\\s|\\.)' + _this.functionPattern() + '\\(.*\\)';
    _this.functions = options.functions || ['t'];
    _this.namespaceFunctions = options.namespaceFunctions || [
    'useTranslation',
    'withTranslation'];

    _this.attr = options.attr || 'i18nKey';
    _this.parseGenerics = options.parseGenerics || false;
    _this.typeMap = options.typeMap || {};return _this;
  }_createClass(JavascriptLexer, [{ key: "createCommentNodeParser", value:

    function createCommentNodeParser() {var _this2 = this;
      var visitedComments = new Set();

      return function (keys, node, content) {
        ts.forEachLeadingCommentRange(
          content,
          node.getFullStart(),
          function (pos, end, kind) {
            var commentId = "".concat(pos, "_").concat(end);
            if (
            (kind === ts.SyntaxKind.MultiLineCommentTrivia ||
            kind === ts.SyntaxKind.SingleLineCommentTrivia) &&
            !visitedComments.has(commentId))
            {
              visitedComments.add(commentId);
              var text = content.slice(pos, end);
              var commentKeys = _this2.commentExtractor.call(_this2, text);
              if (commentKeys) {
                keys.push.apply(keys, _toConsumableArray(commentKeys));
              }
            }
          }
        );
      };
    } }, { key: "setNamespaces", value:

    function setNamespaces(keys) {var _this3 = this;
      if (this.defaultNamespace) {
        return keys.map(function (entry) {return _objectSpread(_objectSpread({},
          entry), {}, {
            namespace: entry.namespace || _this3.defaultNamespace });}
        );
      }

      return keys;
    } }, { key: "setKeyPrefixes", value:

    function setKeyPrefixes(keys) {var _this4 = this;
      if (this.keyPrefix) {
        return keys.map(function (key) {return _objectSpread(_objectSpread({},
          key), {}, {
            keyPrefix: _this4.keyPrefix });}
        );
      }

      return keys;
    } }, { key: "extract", value:

    function extract(content) {var _this5 = this;var filename = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '__default.js';
      var keys = [];

      var parseCommentNode = this.createCommentNodeParser();

      var parseTree = function parseTree(node) {
        var entry;

        parseCommentNode(keys, node, content);

        if (
        node.kind === ts.SyntaxKind.ArrowFunction ||
        node.kind === ts.SyntaxKind.FunctionDeclaration)
        {
          _this5.functionParamExtractor.call(_this5, node);
        }

        if (node.kind === ts.SyntaxKind.TaggedTemplateExpression) {
          entry = _this5.taggedTemplateExpressionExtractor.call(_this5, node);
        }

        if (node.kind === ts.SyntaxKind.CallExpression) {
          entry = _this5.expressionExtractor.call(_this5, node);
        }

        if (entry) {
          keys.push(entry);
        }

        node.forEachChild(parseTree);
      };

      var sourceFile = ts.createSourceFile(
        filename,
        content,
        ts.ScriptTarget.Latest
      );
      parseTree(sourceFile);

      return this.setNamespaces(keys);
    }

    /** @param {ts.FunctionLikeDeclaration} node */ }, { key: "functionParamExtractor", value:
    function functionParamExtractor(node) {var _this6 = this;
      var tFunctionParam =
      node.parameters &&
      node.parameters.find(
        function (param) {return (
            param.name &&
            param.name.kind === ts.SyntaxKind.Identifier &&
            _this6.functions.includes(param.name.text));}
      );

      if (
      tFunctionParam &&
      tFunctionParam.type &&
      tFunctionParam.type.typeName &&
      tFunctionParam.type.typeName.text === 'TFunction')
      {
        var typeArguments = tFunctionParam.type.typeArguments;
        if (
        typeArguments &&
        typeArguments.length &&
        typeArguments[0].kind === ts.SyntaxKind.LiteralType)
        {
          this.defaultNamespace = typeArguments[0].literal.text;
        }
      }
    } }, { key: "taggedTemplateExpressionExtractor", value:

    function taggedTemplateExpressionExtractor(node) {
      var entry = {};

      var tag = node.tag,template = node.template;

      var isTranslationFunction =
      tag.text && this.functions.includes(tag.text) ||
      tag.name && this.functions.includes(tag.name.text);

      if (!isTranslationFunction) return null;

      if (template.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
        entry.key = template.text;
      } else if (template.kind === ts.SyntaxKind.TemplateExpression) {
        this.emit(
          'warning',
          'A key that is a template string must not have any interpolations.'
        );
        return null;
      }

      return entry;
    } }, { key: "expressionExtractor", value:

    function expressionExtractor(node) {var _this7 = this;
      var entry = {};

      if (
      this.namespaceFunctions.includes(node.expression.escapedText) &&
      node.arguments.length)
      {
        var _node$arguments$ = node.arguments[0],text = _node$arguments$.text,elements = _node$arguments$.elements;

        // useTranslation
        if (text) {
          this.defaultNamespace = text;
          var optionsArgument = node.arguments[1];

          if (
          optionsArgument &&
          optionsArgument.kind === ts.SyntaxKind.ObjectLiteralExpression)
          {
            var _node = optionsArgument.properties.find(
              function (p) {return p.name.escapedText === 'keyPrefix';}
            );
            if (_node != null) {
              var keyPrefixValue = _node.initializer.text;
              this.keyPrefix = keyPrefixValue;
            }
          }
          // withTranslation
        } else if (elements && elements.length) {
          this.defaultNamespace = elements[0].text;
        }
      }

      var isTranslationFunction =
      node.expression.text && this.functions.includes(node.expression.text) ||
      node.expression.name &&
      this.functions.includes(node.expression.name.text);

      if (isTranslationFunction) {
        var keyArgument = node.arguments.shift();

        if (!keyArgument) {
          return null;
        }

        if (
        keyArgument.kind === ts.SyntaxKind.StringLiteral ||
        keyArgument.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral)
        {
          entry.key = keyArgument.text;
        } else if (keyArgument.kind === ts.SyntaxKind.BinaryExpression) {
          var concatenatedString = this.concatenateString(keyArgument);
          if (!concatenatedString) {
            this.emit(
              'warning', "Key is not a string literal: ".concat(
                keyArgument.text)
            );
            return null;
          }
          entry.key = concatenatedString;
        } else {
          this.emit(
            'warning',
            keyArgument.kind === ts.SyntaxKind.Identifier ? "Key is not a string literal: ".concat(
              keyArgument.text) :
            'Key is not a string literal'
          );
          return null;
        }

        if (this.parseGenerics && node.typeArguments) {
          var typeArgument = node.typeArguments.shift();

          var parseTypeArgument = function parseTypeArgument(typeArg) {
            if (!typeArg) {
              return;
            }
            if (typeArg.kind === ts.SyntaxKind.TypeLiteral) {var _iterator = _createForOfIteratorHelper(
                  typeArg.members),_step;try {for (_iterator.s(); !(_step = _iterator.n()).done;) {var member = _step.value;
                  entry[member.name.text] = '';
                }} catch (err) {_iterator.e(err);} finally {_iterator.f();}
            } else if (
            typeArg.kind === ts.SyntaxKind.TypeReference &&
            typeArg.typeName.kind === ts.SyntaxKind.Identifier)
            {
              var typeName = typeArg.typeName.text;
              if (typeName in _this7.typeMap) {
                Object.assign(entry, _this7.typeMap[typeName]);
              }
            } else if (Array.isArray(typeArg.types)) {
              typeArgument.types.forEach(function (tp) {return parseTypeArgument(tp);});
            }
          };

          parseTypeArgument(typeArgument);
        }

        var _optionsArgument = node.arguments.shift();

        // Second argument could be a (concatenated) string default value
        if (
        _optionsArgument && (
        _optionsArgument.kind === ts.SyntaxKind.StringLiteral ||
        _optionsArgument.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral))
        {
          entry.defaultValue = _optionsArgument.text;
          _optionsArgument = node.arguments.shift();
        } else if (
        _optionsArgument &&
        _optionsArgument.kind === ts.SyntaxKind.BinaryExpression)
        {
          var _concatenatedString = this.concatenateString(_optionsArgument);
          if (!_concatenatedString) {
            this.emit(
              'warning', "Default value is not a string literal: ".concat(
                _optionsArgument.text)
            );
            return null;
          }
          entry.defaultValue = _concatenatedString;
          _optionsArgument = node.arguments.shift();
        }

        if (
        _optionsArgument &&
        _optionsArgument.kind === ts.SyntaxKind.ObjectLiteralExpression)
        {var _iterator2 = _createForOfIteratorHelper(
              _optionsArgument.properties),_step2;try {for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {var p = _step2.value;
              if (p.kind === ts.SyntaxKind.SpreadAssignment) {
                this.emit(
                  'warning', "Options argument is a spread operator : ".concat(
                    p.expression.text)
                );
              } else if (p.initializer) {
                if (p.initializer.kind === ts.SyntaxKind.TrueKeyword) {
                  entry[p.name.text] = true;
                } else if (p.initializer.kind === ts.SyntaxKind.FalseKeyword) {
                  entry[p.name.text] = false;
                } else {
                  entry[p.name.text] = p.initializer.text || '';
                }
              } else {
                entry[p.name.text] = '';
              }
            }} catch (err) {_iterator2.e(err);} finally {_iterator2.f();}
        }

        if (entry.ns) {
          if (typeof entry.ns === 'string') {
            entry.namespace = entry.ns;
          } else if (_typeof(entry.ns) === 'object' && entry.ns.length) {
            entry.namespace = entry.ns[0];
          }
        }

        return entry;
      }

      return null;
    } }, { key: "commentExtractor", value:

    function commentExtractor(commentText) {var _this8 = this;
      var regexp = new RegExp(this.callPattern, 'g');
      var expressions = commentText.match(regexp);

      if (!expressions) {
        return null;
      }

      var keys = [];
      expressions.forEach(function (expression) {
        var expressionKeys = _this8.extract(expression);
        if (expressionKeys) {
          keys.push.apply(keys, _toConsumableArray(expressionKeys));
        }
      });
      return keys;
    } }, { key: "concatenateString", value:

    function concatenateString(binaryExpression) {var string = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      if (binaryExpression.operatorToken.kind !== ts.SyntaxKind.PlusToken) {
        return;
      }

      if (binaryExpression.left.kind === ts.SyntaxKind.BinaryExpression) {
        string += this.concatenateString(binaryExpression.left, string);
      } else if (binaryExpression.left.kind === ts.SyntaxKind.StringLiteral) {
        string += binaryExpression.left.text;
      } else {
        return;
      }

      if (binaryExpression.right.kind === ts.SyntaxKind.BinaryExpression) {
        string += this.concatenateString(binaryExpression.right, string);
      } else if (binaryExpression.right.kind === ts.SyntaxKind.StringLiteral) {
        string += binaryExpression.right.text;
      } else {
        return;
      }

      return string;
    } }]);return JavascriptLexer;}(BaseLexer);export { JavascriptLexer as default };
//# sourceMappingURL=javascript-lexer.js.map