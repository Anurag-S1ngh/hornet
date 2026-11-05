import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { evaluatorKindEnum } from "./enums";
import { projectsTable } from "./projects";

export const evaluatorsTable = pgTable(
  "evaluators",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("evaluators_project_name_unique").on(table.projectId, table.name),
    index("evaluators_project_idx").on(table.projectId),
  ],
);

export const evaluatorVersionsTable = pgTable(
  "evaluator_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    evaluatorId: uuid("evaluator_id")
      .notNull()
      .references(() => evaluatorsTable.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    kind: evaluatorKindEnum("kind").notNull(),
    config: jsonb("config").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("evaluator_versions_evaluator_version_unique").on(table.evaluatorId, table.version),
    check("evaluator_versions_version_positive", sql`${table.version} > 0`),
  ],
);
