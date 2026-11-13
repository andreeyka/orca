import { describe, expect, it } from 'vitest'
import { redactUrlCredentials, stripCredentialsFromMessage } from './url-credential-redaction'

describe('stripCredentialsFromMessage', () => {
  it.each([
    ['https://user:secret@host/repo', 'https://host/repo'],
    ['custom+git.1://user:sec:ret@host/repo', 'custom+git.1://host/repo'],
    ['SSH://git:secret@host/repo', 'SSH://host/repo'],
    ['HTTPS://token@host/repo', 'HTTPS://host/repo'],
    ['http://token@host/repo', 'http://host/repo'],
    ['ssh://git@host/repo', 'ssh://git@host/repo'],
    ['git@host:repo', 'git@host:repo'],
    ['123://user:secret@host', '123://user:secret@host'],
    ['123git+1://user:secret@host', '123git+1://host'],
    ['https://user:secret/path@host', 'https://user:secret/path@host'],
    ['https://user:secret\u00a0tail@host', 'https://user:secret\u00a0tail@host'],
    ['https://user:secret@token@host', 'https://host'],
    ['https://user:pa@ss:word@host/repo', 'https://host/repo'],
    ['ssh://user:pa@ss:word@host/repo', 'ssh://host/repo'],
    ['https://user:pa@ss:word@host?query=@other', 'https://host?query=@other'],
    ['https://user:pa@ss:word@host#fragment=@other', 'https://host#fragment=@other'],
    ['https://user:pa@ss:word@host/path@other', 'https://host/path@other'],
    ['https://user:secret?query=@host', 'https://user:secret?query=@host'],
    ['https://user:secret#fragment=@host', 'https://user:secret#fragment=@host'],
    [
      '界 https://user:secret@host/😀 ssh://git@host https://token@other',
      '界 https://host/😀 ssh://git@host https://other'
    ]
  ])('preserves URL structure when redacting %s', (input, expected) => {
    expect(stripCredentialsFromMessage(input)).toBe(expected)
  })
})

describe('redactUrlCredentials', () => {
  it.each([
    ['socks5://alice:s3cret@proxy:1080', 'socks5://[redacted]@proxy:1080'],
    ['https://token@host/repo', 'https://[redacted]@host/repo'],
    ['ssh://git@host/repo', 'ssh://git@host/repo'],
    ['https://[redacted]@host', 'https://[redacted]@host']
  ])('marks credentials in %s', (input, expected) => {
    expect(redactUrlCredentials(input, '[redacted]')).toBe(expected)
  })
})
