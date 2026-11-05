import { createDb } from "@hornet/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
