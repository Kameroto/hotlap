import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const app = await buildApp();

async function stopServer(
  signal: NodeJS.Signals,
): Promise<void> {
  app.log.info(
    {
      signal,
    },
    "Shutdown signal received",
  );

  try {
    await app.close();
    await prisma.$disconnect();

    app.log.info(
      "HotLap API stopped successfully",
    );

    process.exit(0);
  } catch (error) {
    app.log.error(
      {
        error,
      },
      "Failed to stop HotLap API cleanly",
    );

    process.exit(1);
  }
}

process.once("SIGINT", () => {
  void stopServer("SIGINT");
});

process.once("SIGTERM", () => {
  void stopServer("SIGTERM");
});

try {
  await app.listen({
    host: env.HOST,
    port: env.PORT,
  });

  app.log.info(
    {
      url: `http://localhost:${env.PORT}`,
      environment: env.NODE_ENV,
      webOrigin: env.WEB_ORIGIN,
    },
    "HotLap API started",
  );
} catch (error) {
  app.log.fatal(
    {
      error,
    },
    "HotLap API failed to start",
  );

  await prisma.$disconnect();

  process.exit(1);
}