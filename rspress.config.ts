import * as path from 'node:path';
import { pluginPreview } from '@rspress/plugin-preview';
import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'TimeLine',
  icon: '/rspress-icon.png',
  logo: {
    light: '/rspress-light-logo.png',
    dark: '/rspress-dark-logo.png',
  },
  route: {
    cleanUrls: true,
  },
  plugins: [
    pluginPreview({}),
  ],
  themeConfig: {
    lastUpdated: true,
    hideNavbar: 'auto',
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/pansyjs/timeline',
      },
    ],
  },
  builderConfig: {
    resolve: {
      alias: {
        '@pansy/timeline': './src',
      },
    },
  },
});
