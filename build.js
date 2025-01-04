import { build } from 'esbuild';
import { copy } from 'esbuild-plugin-copy';

build({
  entryPoints: ['client/index.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
  outfile: './build/index.js',
  plugins: [
    copy({
      resolveFrom: 'cwd',
      assets: {
        from: ['./client/assets/**/*'],
        to: ['./build'],
      },
    }),
  ],
  logLevel: 'info',
});
