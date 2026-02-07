import * as esbuild from 'esbuild';
import process from 'node:process';

esbuild.build({
  entryPoints: ['src/app.ts'],
  bundle: true,
  platform: 'node',
  outfile: 'build/app.js',
  format: 'esm',
  external: ['express', 'mongoose', 'jsonwebtoken', 'cors', 'dotenv', 'cookie-parser', 'socket.io', 'uuid', 'nodemailer', 'node:*'],
  sourcemap: true,
  minify: true,
}).catch((e) => {
  console.error(e);
  process.exit(1)
});