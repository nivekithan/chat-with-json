import type { MetaFunction } from "@remix-run/cloudflare";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

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
  | { type: "success"; content: unknown };
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
      const json = JSON.parse(content);
      setJsonContent({ type: "success", content: json });
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
    return <pre>{JSON.stringify(jsonContent.content, null, 2)}</pre>;
  }
}
