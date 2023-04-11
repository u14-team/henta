import jsonPlugin from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';

import { builtinModules } from 'module';
import path from 'path';

function getModulePath(moduleName) {
  return path.resolve('packages', moduleName);
}

async function getModuleOptions(moduleName) {
  const modulePath = getModulePath(moduleName);
  const modulePkg = await import(path.join(modulePath, 'package.json'), {
    assert: { type: 'json' },
  });

  const src = path.join(modulePath, 'src');
  const lib = path.join(modulePath, 'lib');

  return {
    input: path.join(src, 'index.ts'),
    plugins: [
      jsonPlugin(),
      typescript({
        outDir: lib,
        rootDir: src,
      }),
    ],
    output: [
      {
        file: path.join(lib, 'index.mjs'),
        format: 'esm',
        sourcemap: true,
      },
    ],
  };
}

const modules = [
  // 'attachment-history',
  // 'botcmd',
  'core',
  'bot',
  // 'input',
  // 'installer',
  //'navigation',
  //'platform-discord',
  'platform-tg',
  //'platform-vk',
];

const coreModules = builtinModules.filter((name) => !/(^_|\/)/.test(name));

export default async () =>
  Promise.all(modules.map((module) => getModuleOptions(module)));
