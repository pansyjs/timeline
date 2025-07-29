import * as path from 'node:path';
import { defineConfig } from '@rslib/core';
import { pluginReact } from '@rsbuild/plugin-react';;

export default defineConfig({
  source: {
    entry: {
      index: [
        './src/**',
        '!src/**/*.less',
        '!src/**/*.test.ts',
      ],
    },
    tsconfigPath: './tsconfig.build.json',
  },
  output: {
    target: 'web',
    copy: [
      { from: '**/*.less', context: path.join(__dirname, 'src') }
    ],
  },
  lib: [
    {
      bundle: false,
      format: 'cjs',
      redirect: {
        style: {
          extension: false,
        },
      },
    },
    {
      bundle: false,
      dts: true,
      format: 'esm',
      redirect: {
        style: {
          extension: false,
        },
      },
    },
  ],
  plugins: [
    pluginReact(),
    // pluginLess(),
  ],
});
