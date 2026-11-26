import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { FullConfig } from '@playwright/test';
import { resolveCatalogueProfile } from '../fixtures/catalogue-api';
import { startCatalogueRunner } from '../helpers/catalogue-runner';

export default async function globalSetup(config: FullConfig) {
  const profile = resolveCatalogueProfile(config.metadata.catalogueProfile);
  const runner = await startCatalogueRunner({ profile });
  try {
    process.env.HOTLAP_CATALOGUE_RUNNER_DIR = runner.runtimeDir;
    const lifecycleFile = path.join(runner.runtimeDir, 'playwright-lifecycle.json');
    await writeFile(lifecycleFile, JSON.stringify({ ready: true, profile, baseURL: runner.baseURL, runtimeDir: runner.runtimeDir }));
    console.log(`Isolated catalogue ready; diagnostics: ${runner.runtimeDir}`);
    return async () => {
      // A diagnostic write must never prevent owned-process cleanup.
      const errors: unknown[] = [];
      try { await writeFile(lifecycleFile, JSON.stringify({ profile, teardownInvoked: true })); } catch (error) { errors.push(error); }
      try { await runner.stop(); } catch (error) { errors.push(error); }
      try { await writeFile(lifecycleFile, JSON.stringify({ profile, teardownInvoked: true, stopAwaited: true, cleanupPassed: errors.length === 0 })); } catch (error) { errors.push(error); }
      if (errors.length) throw new AggregateError(errors, `Catalogue teardown failed (${runner.runtimeDir})`);
      console.log(`Isolated catalogue teardown completed: ${runner.runtimeDir}`);
    };
  } catch (error) {
    try { await runner.stop(); } catch (cleanupError) {
      throw new AggregateError([error, cleanupError], 'Catalogue setup metadata and cleanup failed');
    }
    throw error;
  }
}
