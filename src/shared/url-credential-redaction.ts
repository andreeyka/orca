// Why: strip `user:password@` on any scheme, but a lone `user@` only on HTTP(S) — SSH's git@host user-info is required, so stripping breaks the URL.
const URL_USERPASS_PATTERN = /[^\s/@:?#]+:[^\s/?#]+@/y
const HTTPS_TOKEN_URL_PATTERN = /(https?:\/\/)[^\s/@:?#]+@/gi

/** Removes URL credentials, leaving `scheme://host`. */
export function stripCredentialsFromMessage(message: string): string {
  return replaceUrlCredentials(message, '')
}

/** Replaces URL credentials with `marker@`, so the text still shows credentials were present. */
export function redactUrlCredentials(text: string, marker: string): string {
  return replaceUrlCredentials(text, `${marker}@`)
}

function replaceUrlCredentials(message: string, replacement: string): string {
  const spans: string[] = []
  let retainedStart = 0
  // Search fixed delimiters first so long scheme-like words cannot cause quadratic retries.
  for (
    let separator = message.indexOf('://');
    separator !== -1;
    separator = message.indexOf('://', separator + 3)
  ) {
    if (!hasUrlSchemeBefore(message, separator)) {
      continue
    }
    const authorityStart = separator + 3
    URL_USERPASS_PATTERN.lastIndex = authorityStart
    const credentials = URL_USERPASS_PATTERN.exec(message)
    if (credentials) {
      spans.push(message.slice(retainedStart, authorityStart), replacement)
      retainedStart = authorityStart + credentials[0].length
    }
  }
  const withoutPasswords =
    retainedStart === 0 ? message : spans.join('') + message.slice(retainedStart)
  return withoutPasswords.replace(
    HTTPS_TOKEN_URL_PATTERN,
    (_userinfo, scheme: string) => scheme + replacement
  )
}

function hasUrlSchemeBefore(message: string, separator: number): boolean {
  for (let index = separator - 1; index >= 0; index--) {
    const code = message.charCodeAt(index)
    if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      return true
    }
    if ((code < 48 || code > 57) && code !== 43 && code !== 45 && code !== 46) {
      return false
    }
  }
  return false
}
