/** @type {(a: number, b: number, t: number) => number} */
export function lerp(a, b, t) {
  if (t === 0) return a
  return a + (b - a)*t
}

/** @type {<TA extends {[key: string]: number}>(a: TA, b: {[key: string]: number}, t: number) => TA} */
export function lerpObject(a, b, t) {
  let out = Object.assign({}, a); // copy values from a in case the keys do not exist in b
  if (t === 0) return out

  for (let k in b) {
    // @ts-ignore
    out[k] = typeof a[k] !== "undefined" ? lerp(a[k], b[k], t) : b[k];
  }
  return out
}

/** @type {<TA extends number[] | Float32Array, TB extends number[] | Float32Array>(a: TA, b: TB, t: number) => number[]} */
export function lerpArray(a, b, t) {
  let out = Array.from(a);
  if (t === 0) return out
  
  for (let i = 0; i < b.length; i++) {
    out[i] = typeof a[i] !== "undefined" ? lerp(a[i], b[i], t) : b[i];
  }
  return out
}

export function lerpKeys(keys, r, easingFn = Linear) {
  const n = keys.length

  if (r <= 0 || n <= 1) {
    return [0,0]
  } else if (r >= 1) {
    return [n-2,1]
  }

  const k = r*(n - 1)
  const i = ~~k
  const t = easingFn(k - i)
  return [i,t]
}

// remix of https://github.com/tweenjs/tween.js/blob/master/src/Tween.js

export function Linear(k) {
  return k
}

export const Quadratic = {
  In: function (k) {
    return k * k
  },
  Out: function (k) {
    return k * (2 - k)
  },
  InOut: function (k) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k
    }
    return - 0.5 * (--k * (k - 2) - 1)
  }
}
  
export const Cubic = {
  In: function (k) {
    return k * k * k
  },
  Out: function (k) {
    return --k * k * k + 1
  },
  InOut: function (k) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k * k
    }
    return 0.5 * ((k -= 2) * k * k + 2)
  }
}
  
export const Quartic = {
  In: function (k) {
    return k * k * k * k
  },
  Out: function (k) {
    return 1 - (--k * k * k * k)
  },
  InOut: function (k) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k * k * k
    }
    return - 0.5 * ((k -= 2) * k * k * k - 2)
  }
}
  
export const Quintic = {
  In: function (k) {
    return k * k * k * k * k
  },
  Out: function (k) {
    return --k * k * k * k * k + 1
  },
  InOut: function (k) {
    if ((k *= 2) < 1) {
      return 0.5 * k * k * k * k * k
    }
    return 0.5 * ((k -= 2) * k * k * k * k + 2)
  }
}

export const Sinusoidal = {
  In: function (k) {
    return 1 - Math.cos(k * Math.PI / 2)
  },
  Out: function (k) {
    return Math.sin(k * Math.PI / 2)
  },
  InOut: function (k) {
    return 0.5 * (1 - Math.cos(Math.PI * k))
  }
}

export const Exponential = {
  In: function (k) {
    return k === 0 ? 0 : Math.pow(1024, k - 1)
  },
  Out: function (k) {
    return k === 1 ? 1 : 1 - Math.pow(2, - 10 * k)
  },
  InOut: function (k) {
    if (k === 0) {
      return 0
    }
    if (k === 1) {
      return 1
    }
    if ((k *= 2) < 1) {
      return 0.5 * Math.pow(1024, k - 1)
    }
    return 0.5 * (- Math.pow(2, - 10 * (k - 1)) + 2)
  }
}

export const Circular = {
  In: function (k) {
    return 1 - Math.sqrt(1 - k * k)
  },
  Out: function (k) {
    return Math.sqrt(1 - (--k * k))
  },
  InOut: function (k) {
    if ((k *= 2) < 1) {
      return - 0.5 * (Math.sqrt(1 - k * k) - 1)
    }
    return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1)
  }
}

export const Elastic = {
  In: function (k) {
    if (k === 0) {
      return 0
    }
    if (k === 1) {
      return 1
    }
    return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI)
  },
  Out: function (k) {
    if (k === 0) {
      return 0
    }
    if (k === 1) {
      return 1
    }
    return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1
  },
  InOut: function (k) {
    if (k === 0) {
      return 0
    }
    if (k === 1) {
      return 1
    }
    k *= 2
    if (k < 1) {
      return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI)
    }
    return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1
  }
}

export const Back = {
  In: function (k) {
    var s = 1.70158
    return k * k * ((s + 1) * k - s)
  },
  Out: function (k) {
    var s = 1.70158
    return --k * k * ((s + 1) * k + s) + 1
  },
  InOut: function (k) {
    var s = 1.70158 * 1.525
    if ((k *= 2) < 1) {
      return 0.5 * (k * k * ((s + 1) * k - s))
    }
    return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2)
  }
}

export const Bounce = {
  In: function (k) {
    return 1 - Bounce.Out(1 - k)
  },
  Out: function (k) {
    if (k < (1 / 2.75)) {
      return 7.5625 * k * k
    } else if (k < (2 / 2.75)) {
      return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75
    } else if (k < (2.5 / 2.75)) {
      return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375
    } else {
      return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375
    }
  },
  InOut: function (k) {
    if (k < 0.5) {
      return Bounce.In(k * 2) * 0.5
    }
    return Bounce.Out(k * 2 - 1) * 0.5 + 0.5
  }
}

export const EASING_FUNCTIONS = {
  'linear': Linear,

  'ease': Cubic.InOut,
  'ease-in': Cubic.In,
  'ease-out': Cubic.Out,
  'ease-in-out': Cubic.InOut,

  'ease-cubic': Cubic.In,
  'ease-in-cubic': Cubic.In,
  'ease-out-cubic': Cubic.Out,
  'ease-in-out-cubic': Cubic.InOut,

  'ease-quad': Quadratic.InOut,
  'ease-in-quad': Quadratic.In,
  'ease-out-quad': Quadratic.Out,
  'ease-in-out-quad': Quadratic.InOut,

  'ease-quart': Quartic.InOut,
  'ease-in-quart': Quartic.In,
  'ease-out-quart': Quartic.Out,
  'ease-in-out-quart': Quartic.InOut,

  'ease-quint': Quintic.InOut,
  'ease-in-quint': Quintic.In,
  'ease-out-quint': Quintic.Out,
  'ease-in-out-quint': Quintic.InOut,

  'ease-sine': Sinusoidal.InOut,
  'ease-in-sine': Sinusoidal.In,
  'ease-out-sine': Sinusoidal.Out,
  'ease-in-out-sine': Sinusoidal.InOut,

  'ease-expo': Exponential.InOut,
  'ease-in-expo': Exponential.In,
  'ease-out-expo': Exponential.Out,
  'ease-in-out-expo': Exponential.InOut,

  'ease-circ': Circular.InOut,
  'ease-in-circ': Circular.In,
  'ease-out-circ': Circular.Out,
  'ease-in-out-circ': Circular.InOut,

  'ease-elastic': Elastic.InOut,
  'ease-in-elastic': Elastic.In,
  'ease-out-elastic': Elastic.Out,
  'ease-in-out-elastic': Elastic.InOut,

  'ease-back': Back.InOut,
  'ease-in-back': Back.In,
  'ease-out-back': Back.Out,
  'ease-in-out-back': Back.InOut,

  'ease-bounce': Bounce.InOut,
  'ease-in-bounce': Bounce.In,
  'ease-out-bounce': Bounce.Out,
  'ease-in-out-bounce': Bounce.InOut,
}
