import _classCallCheck from "@babel/runtime/helpers/classCallCheck";import _createClass from "@babel/runtime/helpers/createClass";import _inherits from "@babel/runtime/helpers/inherits";import _possibleConstructorReturn from "@babel/runtime/helpers/possibleConstructorReturn";import _getPrototypeOf from "@babel/runtime/helpers/getPrototypeOf";function _createSuper(Derived) {var hasNativeReflectConstruct = _isNativeReflectConstruct();return function _createSuperInternal() {var Super = _getPrototypeOf(Derived),result;if (hasNativeReflectConstruct) {var NewTarget = _getPrototypeOf(this).constructor;result = Reflect.construct(Super, arguments, NewTarget);} else {result = Super.apply(this, arguments);}return _possibleConstructorReturn(this, result);};}function _isNativeReflectConstruct() {if (typeof Reflect === "undefined" || !Reflect.construct) return false;if (Reflect.construct.sham) return false;if (typeof Proxy === "function") return true;try {Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));return true;} catch (e) {return false;}}import JavascriptLexer from './javascript-lexer.js';
import ts from 'typescript';
import { unescape } from '../helpers.js';var

JsxLexer = /*#__PURE__*/function (_JavascriptLexer) {_inherits(JsxLexer, _JavascriptLexer);var _super = _createSuper(JsxLexer);
  function JsxLexer() {var _this;var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, JsxLexer);
    _this = _super.call(this, options);

    _this.componentFunctions = options.componentFunctions || ['Trans'];
    _this.transSupportBasicHtmlNodes =
    options.transSupportBasicHtmlNodes || false;
    _this.transKeepBasicHtmlNodesFor = options.transKeepBasicHtmlNodesFor || [
    'br',
    'strong',
    'i',
    'p'];

    _this.omitAttributes = [_this.attr, 'ns', 'defaults'];return _this;
  }_createClass(JsxLexer, [{ key: "extract", value:

    function extract(content) {var _this2 = this;var filename = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '__default.jsx';
      var keys = [];

      var parseCommentNode = this.createCommentNodeParser();

      var parseTree = function parseTree(node) {
        var entry;

        parseCommentNode(keys, node, content);

        switch (node.kind) {
          case ts.SyntaxKind.CallExpression:
            entry = _this2.expressionExtractor.call(_this2, node);
            break;
          case ts.SyntaxKind.TaggedTemplateExpression:
            entry = _this2.taggedTemplateExpressionExtractor.call(_this2, node);
            break;
          case ts.SyntaxKind.JsxElement:
            entry = _this2.jsxExtractor.call(_this2, node, content);
            break;
          case ts.SyntaxKind.JsxSelfClosingElement:
            entry = _this2.jsxExtractor.call(_this2, node, content);
            break;
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

      var keysWithNamespace = this.setNamespaces(keys);
      var keysWithPrefixes = this.setKeyPrefixes(keysWithNamespace);

      return keysWithPrefixes;
    } }, { key: "jsxExtractor", value:

    function jsxExtractor(node, sourceText) {var _this3 = this;
      var tagNode = node.openingElement || node;

      var getPropValue = function getPropValue(node, attributeName) {var _attribute$initialize;
        var attribute = node.attributes.properties.find(
          function (attr) {return attr.name !== undefined && attr.name.text === attributeName;}
        );
        if (!attribute) {
          return undefined;
        }

        if (((_attribute$initialize = attribute.initializer.expression) === null || _attribute$initialize === void 0 ? void 0 : _attribute$initialize.kind) === ts.SyntaxKind.Identifier) {
          _this3.emit(
            'warning', "Namespace is not a string literal: ".concat(
              attribute.initializer.expression.text)
          );
          return undefined;
        }

        return attribute.initializer.expression ?
        attribute.initializer.expression.text :
        attribute.initializer.text;
      };

      var getKey = function getKey(node) {return getPropValue(node, _this3.attr);};

      if (this.componentFunctions.includes(tagNode.tagName.text)) {
        var entry = {};
        entry.key = getKey(tagNode);

        var namespace = getPropValue(tagNode, 'ns');
        if (namespace) {
          entry.namespace = namespace;
        }

        tagNode.attributes.properties.forEach(function (property) {
          if (property.kind === ts.SyntaxKind.JsxSpreadAttribute) {
            _this3.emit(
              'warning', "Component attribute is a JSX spread attribute : ".concat(
                property.expression.text)
            );
            return;
          }

          if (_this3.omitAttributes.includes(property.name.text)) {
            return;
          }

          if (property.initializer) {
            if (property.initializer.expression) {
              if (
              property.initializer.expression.kind === ts.SyntaxKind.TrueKeyword)
              {
                entry[property.name.text] = true;
              } else if (
              property.initializer.expression.kind ===
              ts.SyntaxKind.FalseKeyword)
              {
                entry[property.name.text] = false;
              } else {
                entry[
                property.name.text] = "{".concat(
                  property.initializer.expression.text, "}");
              }
            } else {
              entry[property.name.text] = property.initializer.text;
            }
          } else entry[property.name.text] = true;
        });

        var defaultsProp = getPropValue(tagNode, 'defaults');
        var defaultValue =
        defaultsProp || this.nodeToString.call(this, node, sourceText);

        if (entry.shouldUnescape === true) {
          defaultValue = unescape(defaultValue);
        }

        if (defaultValue !== '') {
          entry.defaultValue = defaultValue;

          if (!entry.key) {
            entry.key = entry.defaultValue;
          }
        }

        return entry.key ? entry : null;
      } else if (tagNode.tagName.text === 'Interpolate') {
        var _entry = {};
        _entry.key = getKey(tagNode);
        return _entry.key ? _entry : null;
      } else if (tagNode.tagName.text === 'Translation') {
        var _namespace = getPropValue(tagNode, 'ns');
        if (_namespace) {
          this.defaultNamespace = _namespace;
        }
      }
    } }, { key: "nodeToString", value:

    function nodeToString(node, sourceText) {var _this4 = this;
      var children = this.parseChildren.call(this, node.children, sourceText);

      var elemsToString = function elemsToString(children) {return (
          children.
          map(function (child, index) {
            switch (child.type) {
              case 'js':
              case 'text':
                return child.content;
              case 'tag':
                var useTagName =
                child.isBasic &&
                _this4.transSupportBasicHtmlNodes &&
                _this4.transKeepBasicHtmlNodesFor.includes(child.name);
                var elementName = useTagName ? child.name : index;
                var childrenString = elemsToString(child.children);
                return childrenString || !(useTagName && child.selfClosing) ? "<".concat(
                  elementName, ">").concat(childrenString, "</").concat(elementName, ">") : "<".concat(
                  elementName, " />");
              default:
                throw new Error('Unknown parsed content: ' + child.type);
            }
          }).
          join(''));};

      return elemsToString(children);
    } }, { key: "parseChildren", value:

    function parseChildren() {var _this5 = this;var children = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];var sourceText = arguments.length > 1 ? arguments[1] : undefined;
      return children.
      map(function (child) {
        if (child.kind === ts.SyntaxKind.JsxText) {
          return {
            type: 'text',
            content: child.text.
            replace(/(^(\n|\r)\s*)|((\n|\r)\s*$)/g, '').
            replace(/(\n|\r)\s*/g, ' ')
          };
        } else if (
        child.kind === ts.SyntaxKind.JsxElement ||
        child.kind === ts.SyntaxKind.JsxSelfClosingElement)
        {
          var element = child.openingElement || child;
          var name = element.tagName.escapedText;
          var isBasic = !element.attributes.properties.length;
          return {
            type: 'tag',
            children: _this5.parseChildren(child.children, sourceText),
            name: name,
            isBasic: isBasic,
            selfClosing: child.kind === ts.SyntaxKind.JsxSelfClosingElement
          };
        } else if (child.kind === ts.SyntaxKind.JsxExpression) {
          // strip empty expressions
          if (!child.expression) {
            return {
              type: 'text',
              content: ''
            };
          }

          // simplify trivial expressions, like TypeScript typecasts
          if (child.expression.kind === ts.SyntaxKind.AsExpression) {
            child = child.expression;
          }

          if (child.expression.kind === ts.SyntaxKind.StringLiteral) {
            return {
              type: 'text',
              content: child.expression.text
            };
          }

          // strip properties from ObjectExpressions
          // annoying (and who knows how many other exceptions we'll need to write) but necessary
          else if (
          child.expression.kind === ts.SyntaxKind.ObjectLiteralExpression)
          {
            // i18next-react only accepts two props, any random single prop, and a format prop
            // for our purposes, format prop is always ignored

            var nonFormatProperties = child.expression.properties.filter(
              function (prop) {return prop.name.text !== 'format';}
            );

            // more than one property throw a warning in i18next-react, but still works as a key
            if (nonFormatProperties.length > 1) {
              _this5.emit(
                'warning', "The passed in object contained more than one variable - the object should look like {{ value, format }} where format is optional."

              );

              return {
                type: 'text',
                content: ''
              };
            }

            return {
              type: 'js',
              content: "{{".concat(nonFormatProperties[0].name.text, "}}")
            };
          }

          // slice on the expression so that we ignore comments around it
          return {
            type: 'js',
            content: "{".concat(sourceText.slice(
              child.expression.pos,
              child.expression.end
            ), "}")
          };
        } else {
          throw new Error('Unknown ast element when parsing jsx: ' + child.kind);
        }
      }).
      filter(function (child) {return child.type !== 'text' || child.content;});
    } }]);return JsxLexer;}(JavascriptLexer);export { JsxLexer as default };
//# sourceMappingURL=jsx-lexer.js.map