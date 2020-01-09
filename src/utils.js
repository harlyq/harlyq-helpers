/** @type {(v: number, min: number, max: number) => number} */
export function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v
}

/** @type {(str: string) => string } */
export function toLowerCase(str) { return str.toLowerCase() }

/** @type {(str: string) => string } */
export function toUpperCase(str) { return str.toUpperCase() }

/** @type {(v: number, m: number) => number} */
export function euclideanModulo(v, m) {
  return ( ( v % m ) + m ) % m  
}

/** @type {(a: number, b: number, step: number) => number[]} */
export function range(a, b = undefined, step = undefined) {
  if (b === undefined) {
    if (a === 0) { 
      return [] 
    }
    b = a - 1
    a = 0
  }
  if (step === undefined) {
    step = Math.sign(b - a) || 1
  }
  return Array.from( {length: Math.floor((b - a)/step + 1)}, (_,i) => i*step + a )
}

/** @type {<T extends any[]>(list: T, i: number) => T} */
export function unorderedRemoveAt(list, i) {
  const n = list.length
  if (i < n) {
    list[i] = list[n - 1]
    list.length = n - 1
  }
  return list
}

/** @type { <T>(list: T[], fn: (v: T) => boolean ) => number } */
export function count(list, fn) {
  let num = 0
  
  for (let i = 0; i < list.length; i++) {
    if (fn(list[i])) {
      num++
    }
  }
  return num
}

/** @type {<T>(newList: T[], oldList: T[], addFn?: (v: T) => void, removeFn?: (v: T) => void, keepFn?: (v: T) => void) => T[] } */
export function exchangeList(newList, oldList, addFn = undefined, removeFn = undefined, keepFn = undefined) {
  if (typeof removeFn === "function") {
    for (let oldItem of oldList) {
      if (!newList.includes(oldItem)) {
        removeFn(oldItem)
      }
    }
  }

  const hasAddFn = typeof addFn === "function"
  const hasKeepFn = typeof keepFn === "function"

  if (hasAddFn || hasKeepFn) {
    for (let newItem of newList) {
      if (!oldList.includes(newItem)) {
        if (hasAddFn) {
          addFn(newItem)
        }
      } else if (hasKeepFn) {
        keepFn(newItem)
      }
    }
  }

  return newList
}

/** @type {<T>(list: T[], condition: (v: T, i: number, list: T[]) => boolean) => T[]} */
export function filterInPlace(list, condition) {
  let j = 0
  for (let i = 0; i < list.length; i++) {
    const v = list[i]
    if ( condition(v, i, list) ) {
      list[j++] = v
    }
  }
  list.length = j
  return list
}


/** @type { (maxBlocks: number) => { allocate: (requestedSize: number) => number | undefined, release: (index: number) => boolean, maxUsed: () => number } } */
export function blocks(maxBlocks) {
  const freeBlocks = [ { index: 0, size: maxBlocks } ] // list of available blocks, sorted by increasing index
  const usedBlocks = []

  function allocate(requestedSize) {
    // search from the end of the free block list so we prefer to re-use
    // previously allocated blocks, rather than the larger initial block
    for (let j = freeBlocks.length - 1; j >= 0; j--) {
      const block = freeBlocks[j]
      const remainder = block.size - requestedSize

      if (remainder >= 0) {
        // new block is the beginning of the free block
        let newBlock

        if (remainder > 0) {
          newBlock = { index: block.index, size: requestedSize }
          block.index += requestedSize
          block.size = remainder
        } else {
          newBlock = block
          freeBlocks.splice(j, 1)
        }

        usedBlocks.push(newBlock)
        return newBlock.index
      }
    }

    return undefined
  }

  function release(index) {
    for (let i = 0; i < usedBlocks.length; i++) {
      const block = usedBlocks[i]
      if (block.index === index) {
        const freedCount = block.size
        usedBlocks.splice(i, 1)
        insertFreeBlock(block)
        return freedCount
      }
    }
    return 0
  }

  function maxUsed() {
    return usedBlocks.reduce((highest, block) => Math.max(highest, block.index + block.size), 0)
  }

  function insertFreeBlock(mergeBlock) {
    let freed = false

    for (let j = 0; !freed && j < freeBlocks.length; j++) {
      const otherBlock = freeBlocks[j]
      if (otherBlock.index == mergeBlock.index + mergeBlock.size) {
        // otherBlock immediately after mergeBlock
        otherBlock.index = mergeBlock.index
        otherBlock.size += mergeBlock.size
        freed = true

      } else if (otherBlock.index + otherBlock.size === mergeBlock.index) {
        // otherBlock immediately before mergeBlock
        otherBlock.size += mergeBlock.size

        // if the mergeBlock also joins to the next block, then merge 
        // otherBlock, mergeBlock and nextBlock
        const nextBlock = freeBlocks[j + 1]
        if (nextBlock && nextBlock.index === otherBlock.index + otherBlock.size) {
          otherBlock.size += nextBlock.size
          freeBlocks.splice(j + 1, 1) // remove nextBlock
        }
        freed = true

      } else if (otherBlock.index > mergeBlock.index) {
        // otherBlock is after merge block, but not joined
        freeBlocks.splice(j, 0, mergeBlock)
        freed = true

      }
    }

    if (!freed) {
      // add the block to the end of the list
      freeBlocks.push(mergeBlock)
    }
  }

  return {
    allocate,
    release,
    maxUsed,
  }
}

export function shuffle(xs) {
  let ys = xs.slice()

  for (let i = ys.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i)
      const temp = ys[i]
      ys[i] = ys[j]
      ys[j] = temp
  }

  return ys
}
