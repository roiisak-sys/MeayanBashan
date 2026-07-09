import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://maayanbashan.co.il',
  integrations: [sitemap()],
});
