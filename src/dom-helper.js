export function hasAncestor(node, ancestor) {
  let parent = node
  while (parent && ancestor !== parent) {
    parent = parent.parentNode
  }
  return !!parent
}

export function findMatchingAncestor(node, selector) {
  let parent = node
  while (parent && 'matches' in parent && !parent.matches(selector)) {
    parent = parent.parentNode
  }
  return parent && 'matches' in parent ? parent : undefined
}

export function getDebugName(el) {
  return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length > 0 ? '.' + Array.from( el.classList ).join('.') : '')
}

// for large DOMs with few changes, checking the mutations is faster than querySelectorAll()
export function applyNodeMutations(elements, mutations, selector) {
  for (let mutation of mutations) {
    for (let addedEl of mutation.addedNodes) {
      if (addedEl.matches(selector)) {
        elements.push(addedEl)
      }
    }

    for (let removedEl of mutation.removedNodes) {
      if (removedEl.matches(selector)) {
        elements.splice(elements.indexOf(removedEl), 1)
      }
    }
  }
}
