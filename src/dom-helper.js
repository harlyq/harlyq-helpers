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
