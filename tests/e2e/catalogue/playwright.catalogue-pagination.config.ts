import { defineConfig } from '@playwright/test';
import catalogueConfig from './playwright.catalogue.config';

export default defineConfig({
  ...catalogueConfig,
  metadata: { ...catalogueConfig.metadata, catalogueProfile: 'pagination' },
  testMatch: 'catalogue-pagination.pagination.ts',
});
