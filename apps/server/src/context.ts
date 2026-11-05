import type { Context as ApiContext } from "@hornet/api/context";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

import { db } from "./services";

export async function createContext(_opts: CreateExpressContextOptions): Promise<ApiContext> {
  return {
    db,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
