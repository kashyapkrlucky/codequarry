import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "./mdx-components";

/**
 * Renders stored MDX source on the server. JavaScript expressions, imports
 * and exports are stripped (blockJS), and only allow-listed components render.
 */
export async function MdxContent({ source }: { source: string }) {
  return (
    <div className="cq-prose">
      <MDXRemote
        source={source}
        components={mdxComponents}
        options={{
          blockJS: true,
          blockDangerousJS: true,
          parseFrontmatter: false,
          mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug], format: "mdx" },
        }}
      />
    </div>
  );
}
