import { createProcessor } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import {
  ALLOWED_COMPONENTS,
  ALLOWED_HTML_ELEMENTS,
  CALLOUT_TYPES,
  isAllowedAttribute,
  isSafeUrl,
} from "./policy";

interface MdastNode {
  type: string;
  name?: string | null;
  url?: string;
  attributes?: Array<{ type: string; name?: string; value?: unknown }>;
  children?: MdastNode[];
  position?: { start: { line: number } };
}

const allowedComponents = new Set<string>(ALLOWED_COMPONENTS);

/**
 * Parses MDX and enforces the content policy. Returns a list of human-readable
 * problems; an empty list means the document is safe to store and render.
 */
export function validateMdxSource(source: string): string[] {
  const problems: string[] = [];
  let tree: MdastNode;
  try {
    const processor = createProcessor({ remarkPlugins: [remarkGfm] });
    tree = processor.parse(source) as unknown as MdastNode;
  } catch (error) {
    return [`MDX syntax error: ${(error as Error).message}`];
  }

  const at = (node: MdastNode) => `line ${node.position?.start.line ?? "?"}`;

  const visit = (node: MdastNode) => {
    switch (node.type) {
      case "mdxjsEsm":
        problems.push(`${at(node)}: import/export statements are not allowed`);
        break;
      case "mdxFlowExpression":
      case "mdxTextExpression":
        problems.push(
          `${at(node)}: JavaScript expressions ({...}) are not allowed — wrap literal braces in backticks`,
        );
        break;
      case "mdxJsxFlowElement":
      case "mdxJsxTextElement": {
        const name = node.name ?? "";
        const isComponent = /^[A-Z]/.test(name);
        if (!name) problems.push(`${at(node)}: JSX fragments are not allowed`);
        else if (isComponent && !allowedComponents.has(name))
          problems.push(`${at(node)}: component <${name}> is not in the allow-list`);
        else if (!isComponent && !ALLOWED_HTML_ELEMENTS.has(name))
          problems.push(`${at(node)}: HTML element <${name}> is not allowed`);

        for (const attr of node.attributes ?? []) {
          if (attr.type !== "mdxJsxAttribute" || !attr.name) {
            problems.push(`${at(node)}: spread attributes are not allowed on <${name}>`);
            continue;
          }
          if (attr.value !== null && typeof attr.value === "object") {
            problems.push(`${at(node)}: attribute expressions are not allowed (${attr.name})`);
          }
          if (!isAllowedAttribute(attr.name)) {
            problems.push(`${at(node)}: attribute "${attr.name}" is not allowed on <${name}>`);
          }
          if ((attr.name === "href" || attr.name === "src") && typeof attr.value === "string" && !isSafeUrl(attr.value)) {
            problems.push(`${at(node)}: unsafe URL in ${attr.name}`);
          }
          if (name === "Callout" && attr.name === "type" && !CALLOUT_TYPES.includes(attr.value as never)) {
            problems.push(`${at(node)}: Callout type must be one of ${CALLOUT_TYPES.join(", ")}`);
          }
        }
        break;
      }
      case "link":
      case "image":
        if (node.url && !isSafeUrl(node.url)) problems.push(`${at(node)}: unsafe URL "${node.url}"`);
        break;
      case "heading":
        break;
    }
    node.children?.forEach(visit);
  };

  visit(tree);
  return problems;
}
