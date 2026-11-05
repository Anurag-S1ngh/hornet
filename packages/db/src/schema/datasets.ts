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

import { projectsTable } from "./projects";

export const datasetsTable = pgTable(
  "datasets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("datasets_project_name_unique").on(table.projectId, table.name),
    index("datasets_project_idx").on(table.projectId),
  ],
);

export const datasetVersionsTable = pgTable(
  "dataset_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    datasetId: uuid("dataset_id")
      .notNull()
      .references(() => datasetsTable.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    contentHash: text("content_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("dataset_versions_dataset_version_unique").on(table.datasetId, table.version),
    check("dataset_versions_version_positive", sql`${table.version} > 0`),
  ],
);

export const datasetItemsTable = pgTable(
  "dataset_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    datasetVersionId: uuid("dataset_version_id")
      .notNull()
      .references(() => datasetVersionsTable.id, { onDelete: "cascade" }),
    externalId: text("external_id").notNull(),
    input: jsonb("input").notNull(),
    expected: jsonb("expected"),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("dataset_items_version_external_id_unique").on(
      table.datasetVersionId,
      table.externalId,
    ),
    index("dataset_items_version_position_idx").on(table.datasetVersionId, table.position),
    index("dataset_items_metadata_idx").using("gin", table.metadata),
    check("dataset_items_position_non_negative", sql`${table.position} >= 0`),
  ],
);
