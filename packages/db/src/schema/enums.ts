import { pgEnum } from "drizzle-orm/pg-core";

export const workspaceRoleEnum = pgEnum("workspace_role", ["owner", "admin", "member"]);

export const evaluatorKindEnum = pgEnum("evaluator_kind", [
  "exact_match",
  "contains",
  "json_schema",
  "llm_judge",
]);

export const experimentStatusEnum = pgEnum("experiment_status", [
  "draft",
  "queued",
  "running",
  "cancelling",
  "cancelled",
  "completed",
  "failed",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "queued",
  "running",
  "evaluating",
  "succeeded",
  "failed",
  "cancelled",
  "skipped",
]);

export const evaluatorResultStatusEnum = pgEnum("evaluator_result_status", [
  "succeeded",
  "failed",
  "skipped",
]);
