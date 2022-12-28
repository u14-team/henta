import jsonPlugin from '@rollup/plugin-json';
import ts from 'rollup-plugin-ts';

import { tmpdir } from 'os';
import { builtinModules } from 'module';
import { join as pathJoin, resolve } from 'path';

const MODULES = [
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

const cacheRoot = pathJoin(tmpdir(), '.rpt2_cache');

const getModulePath = path => (
	resolve(pathJoin('.', 'packages', path))
);

// eslint-disable-next-line import/no-default-export
export default async () => (
	Promise.all(
		MODULES
			.map(getModulePath)
			.map(async (modulePath) => {
        console.log(modulePath);
				const modulePkg = await import(
					pathJoin(modulePath, 'package.json'),
          {
            assert: { type: 'json' }
          }
				) ;

				const src = pathJoin(modulePath, 'src');
				const lib = pathJoin(modulePath, 'lib');

				return {
					input: pathJoin(src, 'index.ts'),
					plugins: [
						jsonPlugin(),
            ts({
              tsconfig: './tsconfig.json',
              transpileOnly: true,
              browserslist: false,
              tsconfig: {
								outDir: lib,
								rootDir: src,
								include: [src]
              }
            }),
						/*typescriptPlugin({
							cacheRoot,

							useTsconfigDeclarationDir: false,

							tsconfigOverride: {
							}
						}),*/
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
						...MODULES.map(moduleName => `@henta/${moduleName}`),
						...coreModules
					],
					output: [
						{
							file: pathJoin(lib, 'index.js'),
							format: 'cjs',
							exports: 'named'
						},
						{
							file: pathJoin(lib, 'index.mjs'),
							format: 'esm'
						}
					]
				};
			})
	)
);