import { sql } from "drizzle-orm";
import {
  check,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { agentVersionsTable } from "./agents";
import { usersTable } from "./auth";
import { datasetVersionsTable } from "./datasets";
import { experimentStatusEnum } from "./enums";
import { evaluatorVersionsTable } from "./evaluators";
import { projectsTable } from "./projects";

export const experimentsTable = pgTable(
  "experiments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    status: experimentStatusEnum("status").notNull().default("draft"),
    datasetVersionId: uuid("dataset_version_id")
      .notNull()
      .references(() => datasetVersionsTable.id, { onDelete: "restrict" }),
    agentVersionId: uuid("agent_version_id")
      .notNull()
      .references(() => agentVersionsTable.id, { onDelete: "restrict" }),
    concurrencyLimit: integer("concurrency_limit").notNull().default(10),
    timeoutMs: integer("timeout_ms").notNull().default(30000),
    maxRetries: integer("max_retries").notNull().default(2),
    createdBy: uuid("created_by").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("experiments_project_created_idx").on(table.projectId, table.createdAt),
    index("experiments_status_idx").on(table.status),
    index("experiments_dataset_version_idx").on(table.datasetVersionId),
    index("experiments_agent_version_idx").on(table.agentVersionId),
    check("experiments_concurrency_positive", sql`${table.concurrencyLimit} > 0`),
    check("experiments_timeout_positive", sql`${table.timeoutMs} > 0`),
    check("experiments_max_retries_non_negative", sql`${table.maxRetries} >= 0`),
  ],
);

export const experimentEvaluatorsTable = pgTable(
  "experiment_evaluators",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    experimentId: uuid("experiment_id")
      .notNull()
      .references(() => experimentsTable.id, { onDelete: "cascade" }),
    evaluatorVersionId: uuid("evaluator_version_id")
      .notNull()
      .references(() => evaluatorVersionsTable.id, { onDelete: "restrict" }),
    position: integer("position").notNull(),
    threshold: doublePrecision("threshold").notNull().default(0.5),
  },
  (table) => [
    uniqueIndex("experiment_evaluators_experiment_evaluator_unique").on(
      table.experimentId,
      table.evaluatorVersionId,
    ),
    uniqueIndex("experiment_evaluators_experiment_position_unique").on(
      table.experimentId,
      table.position,
    ),
    index("experiment_evaluators_evaluator_version_idx").on(table.evaluatorVersionId),
    check(
      "experiment_evaluators_threshold_range",
      sql`${table.threshold} >= 0 and ${table.threshold} <= 1`,
    ),
  ],
);
