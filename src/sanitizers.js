const extract = (keys) => {
  const subExtract = (obj) =>
    Array.isArray(obj)
      ? obj.map(subExtract)
      : keys.reduce((sanitized, key) => ({ ...sanitized, [key]: obj[key] }), {})

  return subExtract
}

export const sanitizeUser = extract(["id", "firstName", "lastName"])

export const sanitizePage = extract([
  "id",
  "title",
  "content",
  "slug",
  "status",
])

export const sanitizeNavMenu = extract(["id", "name", "hierarchy"])
