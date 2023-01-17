import fs from 'node:fs/promises'
import {fileURLToPath} from 'node:url'
import {transform, transformSync} from 'esbuild'

const {load, getFormat, transformSource} = createLoader()

export {load, getFormat, transformSource}

/**
 * A tiny JSX loader.
 */
export function createLoader() {
  return {load, getFormat, transformSource}

  // Node version 17.
  /**
   * @param {string} href
   * @param {unknown} context
   * @param {Function} defaultLoad
   */
  async function load(href, context, defaultLoad) {
    const url = new URL(href)

    if (!url.pathname.endsWith('.jsx')) {
      return defaultLoad(href, context, defaultLoad)
    }

    const {code, warnings} = await transform(String(await fs.readFile(url)), {
      sourcefile: fileURLToPath(url),
      sourcemap: 'both',
      loader: 'jsx',
      target: 'esnext',
      format: 'esm'
    })

    if (warnings && warnings.length > 0) {
      for (const warning of warnings) {
        console.log(warning.location)
        console.log(warning.text)
      }
    }

    return {format: 'module', source: code, shortCircuit: true}
  }

  // Pre version 17.
  /**
   * @param {string} href
   * @param {unknown} context
   * @param {Function} defaultGetFormat
   */
  function getFormat(href, context, defaultGetFormat) {
    const url = new URL(href)

    return url.pathname.endsWith('.jsx')
      ? {format: 'module'}
      : defaultGetFormat(href, context, defaultGetFormat)
  }

  /**
   * @param {Buffer} value
   * @param {{url: string, [x: string]: unknown}} context
   * @param {Function} defaultTransformSource
   */
  async function transformSource(value, context, defaultTransformSource) {
    const url = new URL(context.url)

    if (!url.pathname.endsWith('.jsx')) {
      return defaultTransformSource(value, context, defaultTransformSource)
    }

    const {code, warnings} = transformSync(String(value), {
      sourcefile: fileURLToPath(url),
      sourcemap: 'both',
      loader: 'jsx',
      target: 'esnext',
      format: context.format === 'module' ? 'esm' : 'cjs'
    })

    if (warnings && warnings.length > 0) {
      for (const warning of warnings) {
        console.log(warning.location)
        console.log(warning.text)
      }
    }

    return {source: code}
  }
}
