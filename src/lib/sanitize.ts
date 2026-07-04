import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "h2", "h3", "h4",
  "p", "br", "strong", "em", "s", "u",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "hr",
  "a",
  "img",
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "target", "rel"],
  img: ["src", "alt", "width", "height"],
  code: ["class"],
  pre: ["class"],
};

export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["https", "http", "data"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    },
  });
}
