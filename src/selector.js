// Breaks a selector string into {type, id, classes, attrs}
/** @type { (str: string) => {type: string, id: string, classes: string[], attrs: {[key: string]: string}} } */
export function parse(str) {
  let results = {type: "", id: "", classes: [], attrs: {}}
  let token = "type"
  let tokenStart = 0
  let lastAttr = ""

  /** @type {(newToken: string, i: number) => void} */
  function setToken(newToken, i) {
    let tokenValue = str.slice(tokenStart, i)

    if (i > tokenStart) {
      switch (token) {
        case "type":
          results.type = tokenValue
          break
        case "id":
          results.id = tokenValue
          break
        case "class":
          results.classes.push(tokenValue)
          break
        case "attr":
          lastAttr = tokenValue
          break
        case "value":
          if (lastAttr) {
            results.attrs[lastAttr] = tokenValue
          }
          break
        case "none":
        case "end":
          break
      }
    }

    token = newToken
    tokenStart = i + 1 // ignore the token character
  }

  for (let i = 0, n = str.length; i < n; i++) {
    const c = str[i]
    switch (c) {
      case "\\": i++; break // escape the next character
      case "#": if (token !== "attr" && token !== "value") setToken("id", i); break
      case ".": if (token !== "attr" && token !== "value") setToken("class", i); break
      case "[": if (token !== "attr" && token !== "value") setToken("attr", i); break
      case "]": if (token === "attr" || token === "value") setToken("none", i); break
      case "=": if (token === "attr") setToken("value", i); break
    }
  }
  setToken("end", str.length)

  return results
}
