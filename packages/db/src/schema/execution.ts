import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { datasetItemsTable } from "./datasets";
import { taskStatusEnum } from "./enums";
import { experimentsTable } from "./experiments";

export const evaluationTasksTable = pgTable(
  "evaluation_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    experimentId: uuid("experiment_id")
      .notNull()
      .references(() => experimentsTable.id, { onDelete: "cascade" }),
    datasetItemId: uuid("dataset_item_id")
      .notNull()
      .references(() => datasetItemsTable.id, { onDelete: "restrict" }),
    status: taskStatusEnum("status").notNull().default("pending"),
    attemptCount: integer("attempt_count").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    output: jsonb("output"),
    usage: jsonb("usage"),
    error: jsonb("error"),
  },
  (table) => [
    uniqueIndex("evaluation_tasks_experiment_item_unique").on(
      table.experimentId,
      table.datasetItemId,
    ),
    index("evaluation_tasks_experiment_status_idx").on(table.experimentId, table.status),
    index("evaluation_tasks_status_started_idx").on(table.status, table.startedAt),
    index("evaluation_tasks_dataset_item_idx").on(table.datasetItemId),
    check("evaluation_tasks_attempt_count_non_negative", sql`${table.attemptCount} >= 0`),
  ],
);
