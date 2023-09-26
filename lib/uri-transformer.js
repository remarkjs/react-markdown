const protocols = ['http', 'https', 'mailto', 'tel']

/**
 * Make a URL safe.
 *
 * @param {string} value
 *   URL.
 * @returns {string}
 *   Safe URL.
 */
export function uriTransformer(value) {
  const url = (value || '').trim()
  const first = url.charAt(0)

  if (first === '#' || first === '/') {
    return url
  }

  const colon = url.indexOf(':')
  if (colon === -1) {
    return url
  }

  let index = -1

  while (++index < protocols.length) {
    const protocol = protocols[index]

    if (
      colon === protocol.length &&
      url.slice(0, protocol.length).toLowerCase() === protocol
    ) {
      return url
    }
  }

  index = url.indexOf('?')
  if (index !== -1 && colon > index) {
    return url
  }

  index = url.indexOf('#')
  if (index !== -1 && colon > index) {
    return url
  }

  // To do: is there an alternative?
  // eslint-disable-next-line no-script-url
  return 'javascript:void(0)'
}
