import RMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Rhighlight from "rehype-highlight";
import { CopyButton } from "./copyButton";
import { cn } from "~/lib/utils/style.ts";

export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose prose-zinc dark:prose-invert max-w-full">
      <RMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[Rhighlight]}
        components={{
          code({ children, className, ...props }) {
            const isInline = !className;

            if (isInline) {
              return <code {...props}>{children}</code>;
            }

            return (
              <div className="relative mt-2">
                <CopyButton content={children} />

                <code {...props} className={cn(className, "rounded-md")}>
                  {children}
                </code>
              </div>
            );
          },
        }}
      >
        {content}
      </RMarkdown>
    </div>
  );
}
