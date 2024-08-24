import type { MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { createChatWithJsonFetch } from "~/lib/chatWithJson";
import { useGenerateJsonSchema } from "~/lib/generateJsonSchema";
import { Message, useChat } from "ai/react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils/style.ts";
import { Markdown } from "~/components/ui/markdown";

export const meta: MetaFunction = () => {
  return [
    { title: "Chat with JSON" },
    {
      name: "description",
      content: "Chat with json",
    },
  ];
};

type JsonContent =
  | {
    type: "error";
    error: string;
  }
  | null
  | { type: "success"; content: string };

export async function clientLoader() {
  const { run } = await import("json_typegen_wasm");
  const openaiApiKey = localStorage.getItem("openaiApiKey") ?? null;

  return { run, openaiApiKey };
}

export default function Index() {
  const [jsonContent, setJsonContent] = useState<JsonContent>(null);

  async function onUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.currentTarget.files;

    if (!files || files.length === 0) {
      setJsonContent({ type: "error", error: "No file selected" });
      return;
    }

    const file = files[0];

    const content = await file.text();

    try {
      JSON.parse(content);
      setJsonContent({ type: "success", content: content });
    } catch (error) {
      if (error instanceof Error) {
        setJsonContent({
          type: "error",
          error: "Invalid json. Recheck the file",
        });
      }
    }
  }

  if (jsonContent === null || jsonContent.type === "error") {
    return (
      <div className="grid place-items-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Chat with JSON</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-y-3">
            <Label htmlFor="file">Upload JSON file</Label>
            <Input
              type="file"
              name="file"
              id="file"
              onChange={onUploadFile}
              accept=".json"
            />
            <p className="text-error">{jsonContent?.error}</p>
          </CardContent>
        </Card>
      </div>
    );
  } else {
    return <ChatWithJson json={jsonContent.content} />;
  }
}

function ChatWithJson({ json }: { json: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { run } = useLoaderData() as any;
  const { openaiApiKey } = useLoaderData<typeof clientLoader>();

  const schema = useGenerateJsonSchema({ jsonString: json, run });

  const { handleSubmit, handleInputChange, messages, input } = useChat({
    maxToolRoundtrips: 5,
    fetch: createChatWithJsonFetch({ json: json, openaiApiKey, schema }),
  });

  return (
    <div className="px-[10%] py-[5%]">
      <div>
        <MessageList messages={messages} />
        {/* <pre>{JSON.stringify(messages, null, 2)}</pre> */}
      </div>

      <div className="mt-24">
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="prompt"
            id="prompt"
            placeholder="Chat with JSON"
            value={input}
            onChange={handleInputChange}
          />
        </form>
      </div>
    </div>
  );
}

const ChatIcons: Record<Message["role"], string> = {
  user: "👤",
  assistant: "🤖",
  system: "🖥️",
  tool: "🔧",
  function: "➿",
  data: "📊",
};

function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="flex flex-col gap-y-4">
      {messages.map((message) => {
        return (
          <div key={message.id} className="flex gap-x-2 items-start">
            <Avatar>
              <AvatarFallback>{ChatIcons[message.role]}</AvatarFallback>
            </Avatar>
            <div>
              {message.content ? <Markdown content={message.content} /> : null}
              {message.toolInvocations?.map((toolInvocation) => {
                if (!("result" in toolInvocation)) {
                  return (
                    <p key={toolInvocation.toolCallId}>
                      Calling {toolInvocation.toolName}...
                    </p>
                  );
                }

                return (
                  <div
                    key={toolInvocation.toolCallId}
                    className={cn(message.content ? "mt-2" : undefined)}
                  >
                    <ToolInvocation
                      toolName={toolInvocation.toolName}
                      toolResult={toolInvocation.result}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const HumanReadableTool: Record<
  string,
  { label: string; resultDescription: string }
> = {
  js_executator: {
    label: "Javascript executor",
    resultDescription: "Result of executing the Javascript:",
  },
};

function ToolInvocation({
  toolName,
  toolResult,
}: {
  toolName: string;
  toolResult: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-96 border">
      <Button
        type="button"
        onClick={() => setIsOpen((s) => !s)}
        variant="ghost"
        className="w-full justify-start"
      >
        {HumanReadableTool[toolName]?.label || toolName}
      </Button>

      {isOpen ? (
        <div className={"p-2 flex flex-col gap-y-2"}>
          <p className="font-bold text-muted-foreground">
            {HumanReadableTool[toolName]?.resultDescription || "Result:"}
          </p>
          <pre>{JSON.stringify(toolResult, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  );
}
