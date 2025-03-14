/// <reference types="vike-server/config" />
export { config as default }

import { pages as plugin } from './plugins'
import type { Config } from 'vike/types'

const config = {
  name: 'vike-cloudflare',
  require: {
    vike: '>=0.4.224'
  },
  vite: {
    plugins: [...plugin()]
  },
  extends: ['import:vike-server/config'],
  prerender: {
    value: null,
    disableAutoRun: true
  },
  server: {
    entry: 'virtual:vike-cloudflare:auto-entry',
    // We're using rollup's noExternal instead
    standalone: false,
    runtime: 'workerd'
  }
} satisfies Config
