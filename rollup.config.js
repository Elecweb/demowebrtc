import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import css from 'rollup-plugin-css-only';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import commonjs from 'rollup-plugin-commonjs';
export default {
    entry: 'src/main.js',
    format:'iife',
    dest: 'dest/bundle.js',
    plugins:[
        resolve({
            browser: true,
        }),
        commonjs({
            include: 'node_modules/**',
            sourceMap: false,
          
        }),
        css({ output: 'dest/bundle.css' }),
        babel({
            exclude:['node_modules/**']
        }),
        // serve({
        //     port:4200,
        //     contentBase:''
        // }),
        // livereload({
        //     watch:''
        // })
    ]
}