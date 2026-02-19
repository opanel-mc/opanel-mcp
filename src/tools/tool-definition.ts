import * as z from "zod";

export interface ToolDef<I extends z.ZodRawShape = z.ZodRawShape, O extends z.ZodRawShape = z.ZodRawShape> {
  name: string
  description: string
  input: I
  output: O
  handler: (input: z.input<z.ZodObject<I>>) => Promise<z.output<z.ZodObject<O>>>
}

export function defineTool<I extends z.ZodRawShape = z.ZodRawShape, O extends z.ZodRawShape = z.ZodRawShape>(
  tool: ToolDef<I, O>
): ToolDef<I, O> {
  return tool;
}
