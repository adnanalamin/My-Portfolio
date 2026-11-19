import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

const rootDir = import.meta.dirname;

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      // Copies static multi-page HTML, css/, js/, assets/, and src/assets into dist/
      // so root-relative paths resolve cleanly in production builds.
      {
        name: 'copy-static-multipage-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(rootDir, 'dist');
          if (!fs.existsSync(distDir)) {
            return;
          }

          for (const dir of ['css', 'js', 'assets']) {
            const srcPath = path.resolve(rootDir, dir);
            const destPath = path.resolve(distDir, dir);
            if (fs.existsSync(srcPath)) {
              fs.cpSync(srcPath, destPath, {recursive: true, force: true});
            }
          }

          for (const entry of fs.readdirSync(rootDir)) {
            if (
              (entry.endsWith('.html') && entry !== 'index.html') ||
              entry === 'robots.txt' ||
              entry === 'sitemap.xml' ||
              entry === 'site.webmanifest' ||
              entry === 'sw.js'
            ) {
              fs.copyFileSync(
                path.resolve(rootDir, entry),
                path.resolve(distDir, entry),
              );
            }
          }

          const srcAssets = path.resolve(rootDir, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
