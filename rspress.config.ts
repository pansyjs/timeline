import * as path from 'node:path';
import { pluginPreview } from '@rspress/plugin-preview';
import { defineConfig } from 'rspress/config';

export default defineConfig({
  base: '/timeline/',
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
        '@pansy/react-timeline': './src',
        'dayjs/plugin/isoweek': './node_modules/dayjs/plugin/isoWeek.js',
        'dayjs/plugin/weekday': './node_modules/dayjs/plugin/weekday.js',
        'dayjs': './node_modules/dayjs',
      },
    },
  },
});
