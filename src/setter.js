const EMPTY_FUNCTION = () => {}

/** @type {<A extends any>(x: A) => A} */
const LINEAR_FUNCTION = x => x

// missing values are problematic because interpolating forward from the start
// we ignore new *to* values until we reach the end, but reversing from
// the end will keep those *to* values
// TODO should we consider nested objects?
function interpolateObject(out, from, to, r) {
  if (r <= 0) {
    for (let k in from) {
      out[k] = from[k]
    }
  } else if (r >= 1) {
    for (let k in to) {
      out[k] = to[k]
    }
  } else {
    for (let k in from) {
      const a = from[k]
      const b = to[k]
      if (typeof a === "number" && typeof b === "number") {
        out[k] = (b - a)*r + a
      }
    }
  }
  return out
}

function copyValues(dst, src, template) {
  template = typeof template === 'undefined' ? src : template

  for (let k in template) {
    if (src.hasOwnProperty(k)) {
      dst[k] = src[k]
    }
  }
  return dst
}

/** @typedef {{object: Object, elapsed: number, startValue: Object, duration: number, endValue: Object; easingFn: (x:number) => number}} Setter */
/** @typedef {{object: Object, value: Object, duration?: number, easingFn?: (x:number) => number}} SetterConfig */

/** @type {<SC extends SetterConfig>(config: SC) => Setter} */
export function createSetter(config) {
  const setter = {
    elapsed: 0,
    startValue: {},
    duration: typeof config.duration === 'number' ? config.duration : 0,
    endValue: config.value,
    easingFn: typeof config.easingFn === 'function' ? config.easingFn : LINEAR_FUNCTION,
    object: config.object,
  }

  if (setter.duration > 0) {
    copyValues(setter.startValue, config.object, config.value)
  }

  return setter
}

/** @type {<S extends Setter>(setter: S, deltaTime: number) => boolean} */
export function updateSetter(setter, deltaTime) {
  if (setter.duration <= 0) {
    interpolateObject(setter.object, undefined, setter.endValue, 1)
    return true

  } else {
    if ( (deltaTime > 0 && setter.elapsed < setter.duration) || (deltaTime < 0 && setter.elapsed > 0) ){
      setter.elapsed += deltaTime
    }

    const r = setter.easingFn(setter.elapsed/setter.duration)
    interpolateObject(setter.object, setter.startValue, setter.endValue, r)
    return r >= 1
  }
}

// /** @type {<T extends Object>(object: T, value: any, duration: number, easingFn: (number) => number) => (deltaTime: number) => boolean} */
// export function createSetter(object, value, duration = 0, easingFn = LINEAR_FUNCTION) {
//   if (duration <= 0) {
//     return function setterNowFn() {
//       interpolateObject(object, undefined, value, 1)
//       return true
//     }
//   }

//   let elapsed = 0
//   const startValue = {}

//   for (let k in value) {
//     if (object.hasOwnProperty(k)) {
//       startValue[k] = object[k]
//     }
//   }

//   return function setterFn(deltaTime) {
//     if ( (deltaTime > 0 && elapsed < duration) || (deltaTime < 0 && elapsed > 0) ){
//       elapsed += deltaTime
//     }
//     const r = easingFn(elapsed/duration)
//     interpolateObject(object, startValue, value, r)
//     return r >= 1
//   }
// }

/** @typedef {{object: Object, values: Object[], direction?: string, duration?: number, easingFn?: (x:number) => number; loops?: number, onLoop?: (number) => void, onComplete?: (number) => void, recalculateValuesEachLoop?: boolean}} KeyframesConfig */
/** @typedef {{direction: string, duration: number, easingFn?: (x:number) => number; elapsed: number, isForward: boolean, loopValues: Object[], loops: number, loopCount: number, object: Object, onComplete: (x:number) => void, onLoop: (x:number) => void, recalculateValuesEachLoop: boolean, values: Object[]}} Keyframes */

/** @type {(config: KeyframesConfig) => Keyframes} */
export function createKeyframes(config) {
  const loopValues = []

  for (let i = 0; i < config.values.length; i++) {
    const value = config.values[i]
    loopValues[i] = typeof value === "undefined" ? Object.assign({}, config.object) : value
  }

  const keyframes = {
    direction: config.direction || 'forward',
    duration: typeof config.duration === 'number' ? config.duration : 1,
    elapsed: 0,
    isForward: typeof config.direction !== 'string' || config.direction === 'forward' || config.direction === 'alternate',
    loopCount: 0,
    loopValues,
    loops: typeof config.loops === 'number' ? config.loops : -1,
    object: config.object,
    onComplete: typeof config.onComplete === 'function' ? config.onComplete : EMPTY_FUNCTION,
    onLoop: typeof config.onLoop === 'function' ? config.onLoop : EMPTY_FUNCTION,
    recalculateValuesEachLoop: !!config.recalculateValuesEachLoop,
    values: config.values,
    easingFn: typeof config.easingFn === 'function' ? config.easingFn : LINEAR_FUNCTION,
  }

  // preserves getters
  Object.defineProperty(keyframes, "values", Object.getOwnPropertyDescriptor(config, "values"))

  return keyframes
}

/** @type {(keyframes: Keyframes, dt: number) => boolean} */
export function updateKeyframes(keyframes, dt) {
  let isComplete = keyframes.loops >= 0 && keyframes.loopCount >= keyframes.loops

  if (!isComplete) {
    keyframes.elapsed += keyframes.isForward ? dt : -dt

    // large *dt*s can cause multiple loops
    while (Math.abs(dt) > 0 && ( keyframes.isForward ? keyframes.elapsed >= keyframes.duration : keyframes.elapsed <= 0) ) {
      keyframes.loopCount++

      isComplete = keyframes.loops >= 0 && keyframes.loopCount >= keyframes.loops
      if (!isComplete) {
        if (keyframes.recalculateValuesEachLoop) {
          // map on oldValue because we know it will have no undefined entries
          keyframes.loopValues = keyframes.loopValues.map((oldValue,i) => {
            const newValue = keyframes.values[i]
            typeof newValue !== "undefined" ? newValue : oldValue
          })
        }

        // if we are looping, then any excess time goes into the next loop
        if (keyframes.direction === "alternate") {
          keyframes.elapsed -= keyframes.isForward ? keyframes.elapsed - keyframes.duration : keyframes.elapsed
          keyframes.isForward = !keyframes.isForward
        } else if (keyframes.direction === 'forward') {
          keyframes.elapsed -= keyframes.duration
        } else {
          keyframes.elapsed += keyframes.duration
        }

        keyframes.onLoop(keyframes.loopCount)
      } else {
        keyframes.onComplete(keyframes.loopCount)
        break // only send onComplete once
      }
    }

    const loopValues = keyframes.loopValues
    const n = loopValues.length
    const r = keyframes.easingFn( Math.min( 1, Math.max( 0, keyframes.elapsed / keyframes.duration ) ) )
    const k = r*(n - 1)
    const index = Math.min(n - 2, Math.floor(k))
    const ratio = k - index
    interpolateObject(keyframes.object, loopValues[index], loopValues[index + 1], ratio)
  }
  
  return isComplete
}
