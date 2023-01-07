import jsonPlugin from '@rollup/plugin-json';
import ts from 'rollup-plugin-ts';

import { tmpdir } from 'os';
import { builtinModules } from 'module';
import path from 'path';

function getModulePath (moduleName) {
	return path.resolve('packages', moduleName);
}

async function getModuleOptions(moduleName) {
  const modulePath = getModulePath(moduleName);
  const modulePkg = await import(
    path.join(modulePath, 'package.json'),
    { assert: { type: 'json' } }
  );

  const src = path.join(modulePath, 'src');
  const lib = path.join(modulePath, 'lib');

  console.log(src)
  return {
    input: path.join(src, 'index.ts'),
    plugins: [
      jsonPlugin(),
      ts({
        tsconfig: './tsconfig.json',
        // transpileOnly: true,
        browserslist: false,
        tsconfig: {
          outDir: lib,
          // rootDir: modulePath,
          target: 'ES6'
          // include: [src]
        }
      }),
      // https://rollupjs.org/guide/en/#renderdynamicimport
      {
        name: 'retain-import-expression',
        resolveDynamicImport(specifier) {
          if (specifier === 'node-fetch') return false;
          return null;
        },
        renderDynamicImport({ targetModuleId }) {
          if (targetModuleId === 'node-fetch') {
            return {
              left: 'import(',
              right: ')'
            };
          }

          return undefined;
        }
      }
    ],
    external: [
      ...Object.keys(modulePkg.dependencies || {}),
      ...Object.keys(modulePkg.peerDependencies || {}),
      // TODO: To make better
      ...modules.map(moduleName => `@henta/${moduleName}`),
      ...coreModules
    ],
    output: [
      {
        file: path.join(lib, 'index.mjs'),
        format: 'esm'
      }
    ]
  };
}

const modules = [
	'attachment-history',
	'botcmd',
	'core',
	'input',
	// 'installer',
	'platform-discord',
	'platform-tg',
  'platform-vk'
];

const coreModules = builtinModules.filter(name => (
	!/(^_|\/)/.test(name)
));

export default async () => (
	Promise.all(modules.map((module) => getModuleOptions(module)))
);
