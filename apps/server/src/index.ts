import { appRouter } from "@hornet/api/routers/index";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import { initLogger } from "evlog";
import { evlog } from "evlog/express";
import { createFsDrain } from "evlog/fs";
import express from "express";

import { createContext } from "./context";
import { ENV } from "./env.server";

initLogger({
  env: { service: "hornet-server" },
});

const app = express();

app.use(evlog({ drain: process.env.NODE_ENV === "production" ? undefined : createFsDrain() }));

app.use(
  cors({
    origin: ENV.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
  }),
);

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
