const STORAGE_KEY = 'scorely_tokens'

export function getStoredTokens() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function storeToken(token, org = '') {
  const tokens = getStoredTokens()
  const existing = tokens.findIndex((t) => t.token === token)
  if (existing >= 0) {
    tokens[existing].org = org
  } else {
    tokens.unshift({ token, org, date: new Date().toISOString() })
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens.slice(0, 20)))
}

export function removeToken(token) {
  const tokens = getStoredTokens().filter((t) => t.token !== token)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
}

export function clearAllTokens() {
  localStorage.removeItem(STORAGE_KEY)
}
