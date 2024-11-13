import Prism from 'prismjs';

// HTTP grammar definition
Prism.languages.http = {
  'request-line': {
    pattern: /^(?:GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|CONNECT|TRACE)(?:\s+)(?:https?:\/\/[^\s]*|\/[^\s]*)(?:\s+)HTTP\/[\d.]+/m,
    inside: {
      // HTTP Verb
      'property': {
        pattern: /^[A-Z]+\b/,
        alias: 'important'
      },
      // Path component
      'path': {
        pattern: /https?:\/\/[^\s]*|\/[^\s]*/,
        inside: {
          'url': /https?:\/\/[^\s]*/,
          'pathname': /\/[^\s]*/
        }
      },
      // HTTP version
      'http-version': {
        pattern: /HTTP\/[\d.]+$/,
        alias: 'keyword'
      }
    }
  },
  'response-status': {
    pattern: /^HTTP\/[\d.]+ \d+ .+/m,
    inside: {
      'http-version': {
        pattern: /^HTTP\/[\d.]+/,
        alias: 'keyword'
      },
      'status-code': {
        pattern: /\d+/,
        alias: 'number'
      },
      'reason-phrase': {
        pattern: /[^0-9\s].+$/,
        alias: 'string'
      }
    }
  },
  'header-name': {
    pattern: /^[\w-]+:(?=.)/m,
    alias: 'variable'
  },
  'header-value': {
    pattern: /:.+/m,
    inside: {
      'punctuation': /^:/,
      'string': {
        pattern: /.+/,
        alias: 'value'
      }
    }
  },
  'body': {
    pattern: /(\n\n)[\s\S]+$/,
    lookbehind: true,
    inside: {
      'json': {
        pattern: /^{[\s\S]*}$/,
        inside: Prism.languages.javascript
      },
      'xml': {
        pattern: /^<[\s\S]*>$/,
        inside: Prism.languages.markup
      }
    }
  }
};

// Custom theme colors
const style = document.createElement('style');
style.textContent = `
  .token.comment { color: #6A9955 !important; }
  .token.property { color: #569CD6 !important; }
  .token.important { color: #569CD6 !important; }
  .token.url, .token.pathname { color: #CE9178 !important; }
  .token.http-version { color: #4EC9B0 !important; }
  .token.variable { color: #9CDCFE !important; }
  .token.string { color: #CE9178 !important; }
  .token.number { color: #B5CEA8 !important; }
  .token.keyword { color: #C586C0 !important; }
  .token.punctuation { color: #808080 !important; }
  .token.value { color: #CE9178 !important; }
  .token.json { color: #9CDCFE !important; }
  .token.xml { color: #9CDCFE !important; }
  
  code[class*="language-"] {
    color: #D4D4D4 !important;
    text-shadow: none !important;
    background: transparent !important;
  }
  
  pre[class*="language-"] {
    color: #D4D4D4 !important;
    text-shadow: none !important;
    background: transparent !important;
  }
`;

document.head.appendChild(style);

export default Prism;
