import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import { defineConfig, loadEnv, type PluginOption, splitVendorChunkPlugin } from 'vite'
import svgrPlugin from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  mode === 'development' && console.log({ ...env, TZ: process.env.TZ })

  return {
    define: { 'process.env.TZ': JSON.stringify('UTC') },
    plugins: [
      react(),
      svgrPlugin(),
      tsconfigPaths({ root: './' }),
      tailwindcss(),
      AutoImport({
        include: [/\.[tj]sx?$/ /* .ts, .tsx, .js, .jsx */],
        resolvers: [IconsResolver({ prefix: 'Icon', extension: 'jsx', customCollections: ['custom'] })],
        imports: ['react'],
        viteOptimizeDeps: true,
        eslintrc: {
          enabled: true,
          filepath: './.eslintrc-auto-import.json',
          globalsPropValue: true,
        },
      }),
      Icons({
        compiler: 'jsx',
        jsx: 'react',
        customCollections: {
          custom: {
            'empty-state': `<!--https://iconduck.com/icons/118776/stock-out-->
              <svg fill="none" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg">
                <g clip-rule="evenodd" fill="currentColor" fill-rule="evenodd">
                  <path
                    d="m18.7071 4.69719c.3905-.39052 1.0237-.39052 1.4142 0l8.4853 8.48531c.3905.3905.3905 1.0237 0 1.4142-.3906.3905-1.0237.3905-1.4142 0l-8.4853-8.4853c-.3905-.39052-.3905-1.02369 0-1.41421z"/>
                  <path
                    d="m28.7071 4.7068c.3905.39053.3905 1.02369 0 1.41422l-8.4853 8.48528c-.3905.3905-1.0237.3905-1.4142 0s-.3905-1.0237 0-1.4142l8.4853-8.4853c.3905-.39052 1.0237-.39052 1.4142 0z"/>
                  <path
                    d="m24.3162 15.0513c-.2052-.0684-.4271-.0684-.6324 0l-14.81529 4.9376c-.22248.0741-.40551.2213-.52604.4096l-3.94442 5.0628c-.19955.2562-.26232.5932-.16835.904s.33299.5567.64102.6593l3.32253 1.1073.0027 8.6315c.00041 1.291.82662 2.4369 2.05135 2.8451l13.3818 4.4606c.1184.0473.2447.0715.3718.0714.1284.0005.256-.0237.3756-.0715l13.3812-4.4604c1.225-.4083 2.0512-1.5546 2.0513-2.8458l.0006-8.63 3.325-1.1082c.3081-.1026.5471-.3485.6411-.6593.0939-.3108.0312-.6478-.1684-.904l-3.9956-5.1286c-.119-.1567-.2843-.2785-.4802-.3438zm-14.77279 7.0599 12.80259 4.2668-2.6982 3.4633-12.8026-4.2668zm14.45909 2.7091 11.6501-3.8827-11.6526-3.8835-11.65 3.8826zm-13.8065 11.9425-.0025-7.9642 9.4925 3.1636c.402.134.8447.0001 1.1051-.3341l2.2092-2.8357-.0002 12.9589-12.1204-4.0401c-.4082-.1361-.6836-.5181-.6837-.9484zm27.6135-7.9635-9.4902 3.1629c-.4019.134-.8446.0001-1.105-.3341l-2.213-2.8405.0036 12.9638 12.1203-4.0401c.4084-.1361.6838-.5182.6838-.9486zm-9.4519 1.042-2.6993-3.4646 12.8026-4.2668 2.6993 3.4646z"/>
                </g>
              </svg>`,
          },
        },
      }),
      splitVendorChunkPlugin(),
      visualizer({
        filename: 'build/stats.html',
        template: 'treemap',
      }) as PluginOption,
      {
        name: 'cf-analytics',
        apply: 'build',
        transformIndexHtml(html) {
          return [
            {
              tag: 'script',
              children: `
               (function() {
                  var cfScript = document.createElement('script');
                  cfScript.defer = true;
                  cfScript.src = 'https://static.cloudflareinsights.com/beacon.min.js';
                  var tenant = location.hostname.split('.')[0]
                  var token = {mycronsteel: "6b9aabe11f91401fb4d8e1793f7a04ba",  demo: "6265bc721e584f08b328f7614b3ce51d"}[tenant]
                  cfScript.setAttribute('data-cf-beacon', '{"token": "' + token + '"}');
                  if (token) document.body.appendChild(cfScript);
                })();
              `,
              injectTo: 'body',
            },
          ]
        },
      },
    ],
    preprocessorOptions: {
      sass: {
        api: 'modern-compiler',
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: {
      // error on preview mode
      // rollupOptions: {
      //   output: {
      //     manualChunks: (id) => {
      //       if (id.includes('@coreui')) return '@coreui'
      //       if (id.includes('ag-grid')) return 'ag-grid'
      //     },
      //   },
      // },
      outDir: 'build',
      cssCodeSplit: true,
    },
    server: {
      // open: true, // docker error if this enabled
      port: 3000,

      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://[::1]:4000/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
