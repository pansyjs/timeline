import { defineConfig } from '@rslib/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginLess } from '@rsbuild/plugin-less';;

export default defineConfig({
  source: {
    entry: {
      index: [
        './src/**',
        '!./src/**/*.test.ts',
      ],
    },
    tsconfigPath: './tsconfig.build.json',
  },
  lib: [
    {
      bundle: false,
      format: 'cjs',
    },
    {
      bundle: false,
      dts: true,
      format: 'esm',
    },
  ],
  output: {
    target: 'web',
  },
  plugins: [
    pluginReact(),
    pluginLess(),
  ],
});
