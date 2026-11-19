import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { startCatalogueRunner } from '../helpers/catalogue-runner';

export default async function globalSetup() {
  const runner = await startCatalogueRunner();
  try {
    process.env.HOTLAP_CATALOGUE_RUNNER_DIR = runner.runtimeDir;
    const lifecycleFile = path.join(runner.runtimeDir, 'playwright-lifecycle.json');
    await writeFile(lifecycleFile, JSON.stringify({ ready: true, baseURL: runner.baseURL, runtimeDir: runner.runtimeDir }));
    console.log(`Isolated catalogue ready; diagnostics: ${runner.runtimeDir}`);
    return async () => {
      // A diagnostic write must never prevent owned-process cleanup.
      const errors: unknown[] = [];
      try { await writeFile(lifecycleFile, JSON.stringify({ teardownInvoked: true })); } catch (error) { errors.push(error); }
      try { await runner.stop(); } catch (error) { errors.push(error); }
      try { await writeFile(lifecycleFile, JSON.stringify({ teardownInvoked: true, stopAwaited: true, cleanupPassed: errors.length === 0 })); } catch (error) { errors.push(error); }
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
