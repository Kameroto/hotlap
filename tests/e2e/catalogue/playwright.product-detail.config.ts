import { defineConfig } from '@playwright/test';
import catalogueConfig from './playwright.catalogue.config';

export default defineConfig({
  ...catalogueConfig,
  metadata: { ...catalogueConfig.metadata, catalogueProfile: 'product-detail' },
  testMatch: 'product-detail.detail.ts',
});
