import { z } from "zod";

export const eventScopeValues = [
  "upcoming",
  "past",
] as const;

export const eventQuerySchema = z.object({
  scope: z
    .enum(eventScopeValues)
    .default("upcoming"),
});

export type EventQuery = z.infer<
  typeof eventQuerySchema
>;
