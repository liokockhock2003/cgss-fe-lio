export const localSaveJson = (key, json) => {
  localStorage.setItem(key, JSON.stringify(json))
}

export const localGetJson = (key) => {
  const jsonStr = localStorage.getItem(key)

  try {
    return JSON.parse(jsonStr)
  } catch (e) {
    return null
  }
}

export const localDelete = (key) => {
  localStorage.removeItem(key)
}
