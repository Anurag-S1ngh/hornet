import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  doublePrecision,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { evaluatorVersionsTable } from "./evaluators";
import { evaluatorResultStatusEnum } from "./enums";
import { evaluationTasksTable } from "./execution";

export const evaluatorResultsTable = pgTable(
  "evaluator_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => evaluationTasksTable.id, { onDelete: "cascade" }),
    evaluatorVersionId: uuid("evaluator_version_id")
      .notNull()
      .references(() => evaluatorVersionsTable.id, { onDelete: "restrict" }),
    status: evaluatorResultStatusEnum("status").notNull().default("succeeded"),
    score: doublePrecision("score"),
    passed: boolean("passed"),
    reason: text("reason"),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    error: jsonb("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("evaluator_results_task_evaluator_unique").on(
      table.taskId,
      table.evaluatorVersionId,
    ),
    index("evaluator_results_task_idx").on(table.taskId),
    index("evaluator_results_evaluator_status_idx").on(table.evaluatorVersionId, table.status),
    check(
      "evaluator_results_score_range",
      sql`${table.score} is null or (${table.score} >= 0 and ${table.score} <= 1)`,
    ),
  ],
);
