import { useMemo } from "react";

export function generateJsonSchema({
  run,
  jsonString,
}: {
  jsonString: string;
  run: (root: string, input: string, options: string) => string;
}) {
  return JSON.stringify(
    JSON.parse(
      run("Root", jsonString, JSON.stringify({ output_mode: "json_schema" }))
    )
  );
}

export function useGenerateJsonSchema(
  ...args: Parameters<typeof generateJsonSchema>
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => generateJsonSchema(...args), []);
}
