import { defineRelations } from "drizzle-orm";

import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  usersTable: {
    sessions: r.many.sessionsTable({
      from: r.usersTable.id,
      to: r.sessionsTable.userId,
    }),
    workspaceMemberships: r.many.workspaceMembersTable({
      from: r.usersTable.id,
      to: r.workspaceMembersTable.userId,
    }),
    createdWorkspaces: r.many.workspacesTable({
      from: r.usersTable.id,
      to: r.workspacesTable.createdBy,
    }),
    createdProjects: r.many.projectsTable({
      from: r.usersTable.id,
      to: r.projectsTable.createdBy,
    }),
    createdExperiments: r.many.experimentsTable({
      from: r.usersTable.id,
      to: r.experimentsTable.createdBy,
    }),
  },
  sessionsTable: {
    user: r.one.usersTable({
      from: r.sessionsTable.userId,
      to: r.usersTable.id,
      optional: false,
    }),
  },
  workspacesTable: {
    creator: r.one.usersTable({
      from: r.workspacesTable.createdBy,
      to: r.usersTable.id,
      optional: true,
    }),
    members: r.many.workspaceMembersTable({
      from: r.workspacesTable.id,
      to: r.workspaceMembersTable.workspaceId,
    }),
    projects: r.many.projectsTable({
      from: r.workspacesTable.id,
      to: r.projectsTable.workspaceId,
    }),
  },
  workspaceMembersTable: {
    workspace: r.one.workspacesTable({
      from: r.workspaceMembersTable.workspaceId,
      to: r.workspacesTable.id,
      optional: false,
    }),
    user: r.one.usersTable({
      from: r.workspaceMembersTable.userId,
      to: r.usersTable.id,
      optional: false,
    }),
  },
  projectsTable: {
    workspace: r.one.workspacesTable({
      from: r.projectsTable.workspaceId,
      to: r.workspacesTable.id,
      optional: false,
    }),
    creator: r.one.usersTable({
      from: r.projectsTable.createdBy,
      to: r.usersTable.id,
      optional: true,
    }),
    apiKeys: r.many.apiKeysTable({
      from: r.projectsTable.id,
      to: r.apiKeysTable.projectId,
    }),
    datasets: r.many.datasetsTable({
      from: r.projectsTable.id,
      to: r.datasetsTable.projectId,
    }),
    agents: r.many.agentsTable({
      from: r.projectsTable.id,
      to: r.agentsTable.projectId,
    }),
    evaluators: r.many.evaluatorsTable({
      from: r.projectsTable.id,
      to: r.evaluatorsTable.projectId,
    }),
    experiments: r.many.experimentsTable({
      from: r.projectsTable.id,
      to: r.experimentsTable.projectId,
    }),
  },
  apiKeysTable: {
    project: r.one.projectsTable({
      from: r.apiKeysTable.projectId,
      to: r.projectsTable.id,
      optional: false,
    }),
  },
  datasetsTable: {
    project: r.one.projectsTable({
      from: r.datasetsTable.projectId,
      to: r.projectsTable.id,
      optional: false,
    }),
    versions: r.many.datasetVersionsTable({
      from: r.datasetsTable.id,
      to: r.datasetVersionsTable.datasetId,
    }),
  },
  datasetVersionsTable: {
    dataset: r.one.datasetsTable({
      from: r.datasetVersionsTable.datasetId,
      to: r.datasetsTable.id,
      optional: false,
    }),
    items: r.many.datasetItemsTable({
      from: r.datasetVersionsTable.id,
      to: r.datasetItemsTable.datasetVersionId,
    }),
    experiments: r.many.experimentsTable({
      from: r.datasetVersionsTable.id,
      to: r.experimentsTable.datasetVersionId,
    }),
  },
  datasetItemsTable: {
    datasetVersion: r.one.datasetVersionsTable({
      from: r.datasetItemsTable.datasetVersionId,
      to: r.datasetVersionsTable.id,
      optional: false,
    }),
    tasks: r.many.evaluationTasksTable({
      from: r.datasetItemsTable.id,
      to: r.evaluationTasksTable.datasetItemId,
    }),
  },
  agentsTable: {
    project: r.one.projectsTable({
      from: r.agentsTable.projectId,
      to: r.projectsTable.id,
      optional: false,
    }),
    versions: r.many.agentVersionsTable({
      from: r.agentsTable.id,
      to: r.agentVersionsTable.agentId,
    }),
  },
  agentVersionsTable: {
    agent: r.one.agentsTable({
      from: r.agentVersionsTable.agentId,
      to: r.agentsTable.id,
      optional: false,
    }),
    experiments: r.many.experimentsTable({
      from: r.agentVersionsTable.id,
      to: r.experimentsTable.agentVersionId,
    }),
  },
  evaluatorsTable: {
    project: r.one.projectsTable({
      from: r.evaluatorsTable.projectId,
      to: r.projectsTable.id,
      optional: false,
    }),
    versions: r.many.evaluatorVersionsTable({
      from: r.evaluatorsTable.id,
      to: r.evaluatorVersionsTable.evaluatorId,
    }),
  },
  evaluatorVersionsTable: {
    evaluator: r.one.evaluatorsTable({
      from: r.evaluatorVersionsTable.evaluatorId,
      to: r.evaluatorsTable.id,
      optional: false,
    }),
    experimentEvaluators: r.many.experimentEvaluatorsTable({
      from: r.evaluatorVersionsTable.id,
      to: r.experimentEvaluatorsTable.evaluatorVersionId,
    }),
    results: r.many.evaluatorResultsTable({
      from: r.evaluatorVersionsTable.id,
      to: r.evaluatorResultsTable.evaluatorVersionId,
    }),
  },
  experimentsTable: {
    project: r.one.projectsTable({
      from: r.experimentsTable.projectId,
      to: r.projectsTable.id,
      optional: false,
    }),
    creator: r.one.usersTable({
      from: r.experimentsTable.createdBy,
      to: r.usersTable.id,
      optional: true,
    }),
    datasetVersion: r.one.datasetVersionsTable({
      from: r.experimentsTable.datasetVersionId,
      to: r.datasetVersionsTable.id,
      optional: false,
    }),
    agentVersion: r.one.agentVersionsTable({
      from: r.experimentsTable.agentVersionId,
      to: r.agentVersionsTable.id,
      optional: false,
    }),
    evaluators: r.many.experimentEvaluatorsTable({
      from: r.experimentsTable.id,
      to: r.experimentEvaluatorsTable.experimentId,
    }),
    tasks: r.many.evaluationTasksTable({
      from: r.experimentsTable.id,
      to: r.evaluationTasksTable.experimentId,
    }),
  },
  experimentEvaluatorsTable: {
    experiment: r.one.experimentsTable({
      from: r.experimentEvaluatorsTable.experimentId,
      to: r.experimentsTable.id,
      optional: false,
    }),
    evaluatorVersion: r.one.evaluatorVersionsTable({
      from: r.experimentEvaluatorsTable.evaluatorVersionId,
      to: r.evaluatorVersionsTable.id,
      optional: false,
    }),
  },
  evaluationTasksTable: {
    experiment: r.one.experimentsTable({
      from: r.evaluationTasksTable.experimentId,
      to: r.experimentsTable.id,
      optional: false,
    }),
    datasetItem: r.one.datasetItemsTable({
      from: r.evaluationTasksTable.datasetItemId,
      to: r.datasetItemsTable.id,
      optional: false,
    }),
    evaluatorResults: r.many.evaluatorResultsTable({
      from: r.evaluationTasksTable.id,
      to: r.evaluatorResultsTable.taskId,
    }),
  },
  evaluatorResultsTable: {
    task: r.one.evaluationTasksTable({
      from: r.evaluatorResultsTable.taskId,
      to: r.evaluationTasksTable.id,
      optional: false,
    }),
    evaluatorVersion: r.one.evaluatorVersionsTable({
      from: r.evaluatorResultsTable.evaluatorVersionId,
      to: r.evaluatorVersionsTable.id,
      optional: false,
    }),
  },
}));
