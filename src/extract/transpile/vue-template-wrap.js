const _get = require("lodash/get");
const tryRequire = require("semver-try-require");
const { supportedTranspilers } = require("../../../src/meta.js");

const vueTemplateCompiler = tryRequire(
  "vue-template-compiler",
  supportedTranspilers["vue-template-compiler"]
);

module.exports = {
  isAvailable: () => vueTemplateCompiler !== false,

  transpile: (pSource) => {
    var templateString = _get(vueTemplateCompiler.parseComponent(pSource), "template.content", "");
    var scriptString = _get(vueTemplateCompiler.parseComponent(pSource), "script.content", "");
    var matches = [...templateString.matchAll(/<[a-zA-Z-]{1,}\b/g)];
    var htmlTagsArray = [
      "a",
      "address",
      "area",
      "article",
      "aside",
      "audio",
      "b",
      "base",
      "bdi",
      "bdo",
      "blockquote",
      "body",
      "br",
      "button",
      "canvas",
      "caption",
      "cite",
      "code",
      "col",
      "colgroup",
      "data",
      "datalist",
      "dd",
      "del",
      "details",
      "dfn",
      "dialog",
      "div",
      "dl",
      "dt",
      "em",
      "embed",
      "fieldset",
      "figure",
      "footer",
      "form",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "head",
      "header",
      "hgroup",
      "hr",
      "html",
      "i",
      "iframe",
      "img",
      "input",
      "ins",
      "kbd",
      "keygen",
      "label",
      "legend",
      "li",
      "link",
      "main",
      "map",
      "mark",
      "menu",
      "menuitem",
      "meta",
      "meter",
      "nav",
      "noscript",
      "object",
      "ol",
      "optgroup",
      "option",
      "output",
      "p",
      "param",
      "pre",
      "progress",
      "q",
      "rb",
      "rp",
      "rt",
      "rtc",
      "ruby",
      "s",
      "samp",
      "script",
      "section",
      "select",
      "small",
      "source",
      "span",
      "strong",
      "style",
      "sub",
      "summary",
      "sup",
      "table",
      "tbody",
      "td",
      "template",
      "textarea",
      "tfoot",
      "th",
      "thead",
      "time",
      "title",
      "tr",
      "track",
      "u",
      "ul",
      "var",
      "video",
      "wbr",
    ];
    var svgTagsArray = [
      "g",
      "path",
      "desc",
      "svg",
      "circle",
      "polyline",
      "polygon",
      "line",
      "stop",
      "defs",
      "linearGradient",
      "ellipse",
      "text",
      "tspan",
      "use",
      "mask",
    ];
    var vueTagsArray = [
      "vuex",
      "template",
      "slot",
      "transition",
      "vpopover",
      "keepalive",
      "routerlink",
      "routerview",
      "transitiongroup",

    ]
        
    var total = "";
    matches.forEach((m) => {
      x = ('' + m).replace("<", "");
      x = ('' + x).replaceAll("-", "");
      scriptStringToLower = (''+scriptString).toLowerCase();

      if(!scriptStringToLower.includes(x.toLowerCase())) {
        if(!htmlTagsArray.includes(x)) {
          if(!svgTagsArray.includes(x)) {
            if(!vueTagsArray.includes(x)) {
              total += `import ${x} from 'globalThis.${x}'\n`
            }
          }
        }
      } 
    });
    total += scriptString;
    console.error(total)
    return total;
  },
  getTemplate: (pSource) =>
    _get(vueTemplateCompiler.parseComponent(pSource), "template.content", ""),
};
