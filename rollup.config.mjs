import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
    {
        // 生成未压缩的 JS 文件
        input: 'src/kunpoecs.ts',
        external: ['cc', 'fairygui-cc'],
        output: [
            {
                file: 'dist/kunpoecs.mjs',
                format: 'esm',
                name: 'kunpoecs'
            },
            {
                file: 'dist/kunpoecs.cjs',
                format: 'cjs',
                name: 'kunpoecs'
            }
        ],
        plugins: [
            typescript({
                tsconfig: './tsconfig.json',
                importHelpers: false,
                compilerOptions: {
                    target: "es6",
                    module: "es6",
                    experimentalDecorators: true, // 启用ES装饰器。
                    strict: true,
                    strictNullChecks: false,
                    moduleResolution: "Node",
                    skipLibCheck: true,
                    esModuleInterop: true,
                }
            })
        ]
    },
    {
        // 生成压缩的 JS 文件
        input: 'src/kunpoecs.ts',
        external: ['cc', 'fairygui-cc'],
        output: [
            {
                file: 'dist/kunpoecs.min.mjs',
                format: 'esm',
                name: 'kunpoecs'
            },
            {
                file: 'dist/kunpoecs.min.cjs',
                format: 'cjs',
                name: 'kunpoecs'
            }
        ],
        plugins: [
            typescript({
                tsconfig: './tsconfig.json',
                importHelpers: false,
                compilerOptions: {
                    target: "es6",
                    module: "es6",
                    experimentalDecorators: true, // 启用ES装饰器。
                    strict: true,
                    strictNullChecks: false,
                    moduleResolution: "Node",
                    skipLibCheck: true,
                    esModuleInterop: true,
                }
            }),
            terser()
        ]
    },
    {
        // 生成声明文件的配置
        input: 'src/kunpoecs.ts',
        output: {
            file: 'dist/kunpoecs.d.ts',
            format: 'es'
        },
        plugins: [dts({
            compilerOptions: {
                stripInternal: true
            }
        })]
    }
]; 