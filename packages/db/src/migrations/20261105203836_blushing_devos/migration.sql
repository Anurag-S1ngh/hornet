CREATE TYPE "evaluator_kind" AS ENUM('exact_match', 'contains', 'json_schema', 'llm_judge');--> statement-breakpoint
CREATE TYPE "evaluator_result_status" AS ENUM('succeeded', 'failed', 'skipped');--> statement-breakpoint
CREATE TYPE "experiment_status" AS ENUM('draft', 'queued', 'running', 'cancelling', 'cancelled', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "task_status" AS ENUM('pending', 'queued', 'running', 'evaluating', 'succeeded', 'failed', 'cancelled', 'skipped');--> statement-breakpoint
CREATE TYPE "workspace_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TABLE "agent_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"agent_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"config" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agent_versions_version_positive" CHECK ("version" > 0)
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_lowercase" CHECK ("email" = lower("email"))
);
--> statement-breakpoint
CREATE TABLE "dataset_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"dataset_version_id" uuid NOT NULL,
	"external_id" text NOT NULL,
	"input" jsonb NOT NULL,
	"expected" jsonb,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dataset_items_position_non_negative" CHECK ("position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "dataset_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"dataset_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"content_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dataset_versions_version_positive" CHECK ("version" > 0)
);
--> statement-breakpoint
CREATE TABLE "datasets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluator_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"evaluator_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"kind" "evaluator_kind" NOT NULL,
	"config" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "evaluator_versions_version_positive" CHECK ("version" > 0)
);
--> statement-breakpoint
CREATE TABLE "evaluators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluation_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"experiment_id" uuid NOT NULL,
	"dataset_item_id" uuid NOT NULL,
	"status" "task_status" DEFAULT 'pending'::"task_status" NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"output" jsonb,
	"usage" jsonb,
	"error" jsonb,
	CONSTRAINT "evaluation_tasks_attempt_count_non_negative" CHECK ("attempt_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "experiment_evaluators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"experiment_id" uuid NOT NULL,
	"evaluator_version_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"threshold" double precision DEFAULT 0.5 NOT NULL,
	CONSTRAINT "experiment_evaluators_threshold_range" CHECK ("threshold" >= 0 and "threshold" <= 1)
);
--> statement-breakpoint
CREATE TABLE "experiments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"status" "experiment_status" DEFAULT 'draft'::"experiment_status" NOT NULL,
	"dataset_version_id" uuid NOT NULL,
	"agent_version_id" uuid NOT NULL,
	"concurrency_limit" integer DEFAULT 10 NOT NULL,
	"timeout_ms" integer DEFAULT 30000 NOT NULL,
	"max_retries" integer DEFAULT 2 NOT NULL,
	"created_by" uuid,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "experiments_concurrency_positive" CHECK ("concurrency_limit" > 0),
	CONSTRAINT "experiments_timeout_positive" CHECK ("timeout_ms" > 0),
	CONSTRAINT "experiments_max_retries_non_negative" CHECK ("max_retries" >= 0)
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"key_prefix" text NOT NULL,
	"key_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspace_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evaluator_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"task_id" uuid NOT NULL,
	"evaluator_version_id" uuid NOT NULL,
	"status" "evaluator_result_status" DEFAULT 'succeeded'::"evaluator_result_status" NOT NULL,
	"score" double precision,
	"passed" boolean,
	"reason" text,
	"metadata" jsonb DEFAULT '{}' NOT NULL,
	"error" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "evaluator_results_score_range" CHECK ("score" is null or ("score" >= 0 and "score" <= 1))
);
--> statement-breakpoint
CREATE TABLE "workspace_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"workspace_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "workspace_role" DEFAULT 'member'::"workspace_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"description" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "agent_versions_agent_version_unique" ON "agent_versions" ("agent_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "agents_project_name_unique" ON "agents" ("project_id","name");--> statement-breakpoint
CREATE INDEX "agents_project_idx" ON "agents" ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_hash_unique" ON "sessions" ("token_hash");--> statement-breakpoint
CREATE INDEX "sessions_user_expires_idx" ON "sessions" ("user_id","expires_at");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "dataset_items_version_external_id_unique" ON "dataset_items" ("dataset_version_id","external_id");--> statement-breakpoint
CREATE INDEX "dataset_items_version_position_idx" ON "dataset_items" ("dataset_version_id","position");--> statement-breakpoint
CREATE INDEX "dataset_items_metadata_idx" ON "dataset_items" USING gin ("metadata");--> statement-breakpoint
CREATE UNIQUE INDEX "dataset_versions_dataset_version_unique" ON "dataset_versions" ("dataset_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "datasets_project_name_unique" ON "datasets" ("project_id","name");--> statement-breakpoint
CREATE INDEX "datasets_project_idx" ON "datasets" ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "evaluator_versions_evaluator_version_unique" ON "evaluator_versions" ("evaluator_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "evaluators_project_name_unique" ON "evaluators" ("project_id","name");--> statement-breakpoint
CREATE INDEX "evaluators_project_idx" ON "evaluators" ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "evaluation_tasks_experiment_item_unique" ON "evaluation_tasks" ("experiment_id","dataset_item_id");--> statement-breakpoint
CREATE INDEX "evaluation_tasks_experiment_status_idx" ON "evaluation_tasks" ("experiment_id","status");--> statement-breakpoint
CREATE INDEX "evaluation_tasks_status_started_idx" ON "evaluation_tasks" ("status","started_at");--> statement-breakpoint
CREATE INDEX "evaluation_tasks_dataset_item_idx" ON "evaluation_tasks" ("dataset_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "experiment_evaluators_experiment_evaluator_unique" ON "experiment_evaluators" ("experiment_id","evaluator_version_id");--> statement-breakpoint
CREATE UNIQUE INDEX "experiment_evaluators_experiment_position_unique" ON "experiment_evaluators" ("experiment_id","position");--> statement-breakpoint
CREATE INDEX "experiment_evaluators_evaluator_version_idx" ON "experiment_evaluators" ("evaluator_version_id");--> statement-breakpoint
CREATE INDEX "experiments_project_created_idx" ON "experiments" ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "experiments_status_idx" ON "experiments" ("status");--> statement-breakpoint
CREATE INDEX "experiments_dataset_version_idx" ON "experiments" ("dataset_version_id");--> statement-breakpoint
CREATE INDEX "experiments_agent_version_idx" ON "experiments" ("agent_version_id");--> statement-breakpoint
CREATE UNIQUE INDEX "api_keys_key_hash_unique" ON "api_keys" ("key_hash");--> statement-breakpoint
CREATE INDEX "api_keys_project_idx" ON "api_keys" ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_workspace_name_unique" ON "projects" ("workspace_id","name");--> statement-breakpoint
CREATE INDEX "projects_workspace_idx" ON "projects" ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "evaluator_results_task_evaluator_unique" ON "evaluator_results" ("task_id","evaluator_version_id");--> statement-breakpoint
CREATE INDEX "evaluator_results_task_idx" ON "evaluator_results" ("task_id");--> statement-breakpoint
CREATE INDEX "evaluator_results_evaluator_status_idx" ON "evaluator_results" ("evaluator_version_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_members_workspace_user_unique" ON "workspace_members" ("workspace_id","user_id");--> statement-breakpoint
CREATE INDEX "workspace_members_user_idx" ON "workspace_members" ("user_id");--> statement-breakpoint
CREATE INDEX "workspaces_created_by_idx" ON "workspaces" ("created_by");--> statement-breakpoint
ALTER TABLE "agent_versions" ADD CONSTRAINT "agent_versions_agent_id_agents_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "dataset_items" ADD CONSTRAINT "dataset_items_dataset_version_id_dataset_versions_id_fkey" FOREIGN KEY ("dataset_version_id") REFERENCES "dataset_versions"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "dataset_versions" ADD CONSTRAINT "dataset_versions_dataset_id_datasets_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "datasets"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "datasets" ADD CONSTRAINT "datasets_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "evaluator_versions" ADD CONSTRAINT "evaluator_versions_evaluator_id_evaluators_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "evaluators"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "evaluators" ADD CONSTRAINT "evaluators_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "evaluation_tasks" ADD CONSTRAINT "evaluation_tasks_experiment_id_experiments_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "experiments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "evaluation_tasks" ADD CONSTRAINT "evaluation_tasks_dataset_item_id_dataset_items_id_fkey" FOREIGN KEY ("dataset_item_id") REFERENCES "dataset_items"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "experiment_evaluators" ADD CONSTRAINT "experiment_evaluators_experiment_id_experiments_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "experiments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "experiment_evaluators" ADD CONSTRAINT "experiment_evaluators_N1ilezmDvYW9_fkey" FOREIGN KEY ("evaluator_version_id") REFERENCES "evaluator_versions"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_dataset_version_id_dataset_versions_id_fkey" FOREIGN KEY ("dataset_version_id") REFERENCES "dataset_versions"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_agent_version_id_agent_versions_id_fkey" FOREIGN KEY ("agent_version_id") REFERENCES "agent_versions"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "evaluator_results" ADD CONSTRAINT "evaluator_results_task_id_evaluation_tasks_id_fkey" FOREIGN KEY ("task_id") REFERENCES "evaluation_tasks"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "evaluator_results" ADD CONSTRAINT "evaluator_results_E8ZIxU8DR8gL_fkey" FOREIGN KEY ("evaluator_version_id") REFERENCES "evaluator_versions"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspaces_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL;