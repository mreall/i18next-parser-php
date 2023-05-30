'use strict';

import path from 'path';
import Engine from 'php-parser';
import BaseLexer from './base-lexer.js'

const parser = new Engine;

function objectHas(obj, key) {
  if (!obj || typeof obj !== 'object') return false;
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * Parse a PHP file. Adapted from wp-pot.
 * @see https://github.com/wp-pot/wp-pot/blob/master/src/parsers/php-parser.js
 */
export default class PhpLexer extends BaseLexer {
  constructor(options = {}) {
    super(options);

    this.functions = options.functions || ['I18n::t', 'I18n::e'];
    this.options = options;
    this.translations = [];
    this.comments = {};
  }

  extract(content, filename) {
    try {
      const ast = parser.parseCode(content, filename);
      this.parseCodeTree(ast, filename);
    } catch (e) {
      this.emit('warning', `Error parsing "${filename}": ${e.message}`);
    }

    return this.translations;
  }

  /**
   * Parse the AST code tree
  *
  * @param {object} ast
  * @param {string} filename
  */
  parseCodeTree(ast, filename) {
    if (!ast) {
      return;
    }

    if (ast.comments) {
      for (const comment of ast.comments) {
        this.parseComment(comment);
      }
    }

    if (Array.isArray(ast)) {
      for (const child of ast) {
        this.parseCodeTree(child, filename);
      }
      return;
    }

    const methodName = this.validFunctionCall(ast);

    if (methodName) {
      if (this.validArgs(ast.arguments)) {
        const args = this.parseArguments(ast.arguments);
        const namespace = args[1].ns ?? this.options.defaultNamespace;
        const translationCall = {
          args,
          filename,
          method: methodName,
          namespace,
          key: args[0]
        };

        if (args[1].default) {
          translationCall['defaultValue'] = args[1].default;
        }

        this.translations.push(translationCall);
        //this.addTranslation(translationCall);
      }
    } else {
      // List can not be in alphabetic order, otherwise it will not be ordered by occurence in code.
      const childrenContainingCalls = [
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
        'what'
      ];

      for (const child of childrenContainingCalls) {
        if (ast[child]) {
          this.parseCodeTree(ast[child], filename);
        }
      }
    }
  }

  /**
   * Parse comment AST
   *
   * @param  {object} commentAst
   */
  parseComment(commentAst) {
    let commentRegexp;
    if (commentAst.kind === 'commentblock') {
      commentRegexp = new RegExp(`(?:\\/\\*)?[\\s*]*${this.options.commentKeyword}(.*)\\s*(?:\\*\\/)$`, 'im');
    } else {
      commentRegexp = new RegExp(`^\\/\\/\\s*${this.options.commentKeyword}(.*)$`, 'im');
    }
    const commentParts = commentRegexp.exec(commentAst.value);

    if (commentParts) {
      let lineNumber = commentAst.loc.end.line;
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
   */
  validFunctionCall(ast) {
    if (ast.kind === 'call') {
      let methodName = ast.what.name;

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
   */
  parseArguments(args) {
    const argsArray = [];
    for (const arg of args) {
      if (arg.kind === 'propertylookup') {
        argsArray.push(`$${arg.what.name}->${arg.offset.name}`);
      } else if (arg.kind === 'staticlookup') {
        argsArray.push(`$${arg.what.name}::${arg.offset.name}`);
      } else if (arg.kind === 'variable') {
        argsArray.push(`$${arg.name}`);
      } else if (arg.kind === 'name' && arg.resolution === 'uqn') {
        argsArray.push(arg.name);
      } else if (arg.kind === 'array') {
        argsArray.push(this.getNameValue(arg.items));
      } else {
        argsArray.push(arg.value);
      }
    }

    if (!argsArray[1]) {
      argsArray[1] = [];
    }

    return argsArray;
  }

  validArgs(args) {
    if (args[0] && args[0].kind !== 'string') {
      return false;
    }

    if (args[1] && args[1].kind !== 'array') {
      return false;
    }

    return true;
  }

  getNameValue(items) {
    const options = [];
    items.forEach(item => {
      if (item.key.kind === 'string' && item.value.kind === 'string') {
        options[item.key.value] = item.value.value;
      }
    });
    return options;
  }

  getComment(lineNumber) {
    const linesWithComment = Object.keys(this.comments);
    if (!linesWithComment) {
      return null;
    }

    if (linesWithComment[0] > lineNumber) {
      return null;
    }

    let comment;
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
   */
  addTranslation(translationCall) {
    if (translationCall.args) {
      const translationObject = this.generateTranslationObject(translationCall);

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
   */
  generateTranslationObject(translationCall) {
    const translationObject = {
      key: translationCall.args[0],
      value: null
    }

    if (objectHas(this.functions.contextPosition, translationCall.method)) {
      const contextKey = this.getContextPos(translationCall.method);
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
   */
  getContextPos(method) {
    return this.functions.contextPosition[method] - 1;
  }
}
