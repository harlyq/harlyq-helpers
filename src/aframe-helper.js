import * as attribute from "./attribute.js"
import * as domHelper from "./dom-helper.js"
import * as jsonHelper from "./json-helper.js"

// *value* can be boolean, string, color or array of numbers
/** 
 * @typedef { (target: object, prop: string, value: any) => void } SetPropertyFn
 * @type { SetPropertyFn } 
 * */
export const setProperty = (() => {
  const trim = x => x.trim()
  const OBJECT3D_FAST_SET = {
    // @ts-ignore
    "rotation": x => isNaN(x) ? 0 : THREE.Math.degToRad(x),
    "position": x => isNaN(x) ? 0 : x,
    "scale": x => isNaN(x) ? 1 : x,
  }
  
  return /** @type { SetPropertyFn } */function setProperty(target, prop, value) {
    let fn = OBJECT3D_FAST_SET[prop]
    if (fn) {
      if (!Array.isArray(value)) {
        if (typeof value === "object") {
          value = [value.x, value.y, value.z]
        } else if (typeof value === "number") {
          value = [value]
        } else {
          value = value.split(" ").map(trim)
        }        
      }
      value.length = 3
      target.object3D[prop].set(...value.map(fn))
      return
    }
  
    const parts = prop.split(".")
    if (parts.length <= 2) {
      // component or component.property
      parts[0] = parts[0].replace(/[A-Z]/g, x => "-" + x.toLowerCase()) // convert component names from camelCase to kebab-case
      if (value || typeof value === "boolean" || typeof value === "number") {
        // @ts-ignore
        AFRAME.utils.entity.setComponentProperty(target, parts.join("."), attribute.stringify(value))
      } else {
        target.removeAttribute(parts[0], parts[1]) // removes a component or mixin, resets an attribute to default, or removes the attribute if not in the schema
      }
      return
    }
  
    // e.g. object3dmap.mesh.material.uniforms.color
    const path = jsonHelper.getWithPath(target, parts.slice(0, -1))
    if (path) {
      // this only works for boolean, string, color and number
      path[ parts[parts.length - 1] ] = value
    } else {
      console.warn(`unknown path for setProperty() '${prop}'`)
    }
  }   
  
})()

/** @type {(el: HTMLElement, prop: string) => string} */
export function getProperty(el, prop) {
  const parts = prop.split(".")

  if (parts.length === 1) {
    return el.getAttribute(prop)

  } else if (parts.length <= 2) {
    parts[0] = parts[0].replace(/[A-Z]/g, x => "-" + x.toLowerCase()) // convert component names from camelCase to kebab-case
    
    const attr = el.getAttribute(parts[0])
    return typeof attr === "object" ? attr[parts[1]] : undefined
    
  } else {
    const value = jsonHelper.getWithPath(el, parts)
    return value
  }
}

/** @type { ( el: HTMLElement, callback: EventListener ) => { update: (events: string, scope: string, source: string, delay: () => number | number, enabled: boolean) => void, play: () => void, pause: () => void, remove: () => void } } */
export function delayedEventHandler(el, callback) {
  let _events
  let _elements = []
  let _delay
  let _enabled
  let _source
  let _scope
  const _timers = []

  function setupCallback(timer, callback, delay) {
    timer.startTime = Date.now()
    timer.delay = delay
    delete timer.remainingTime

    timer.id = setTimeout( () => {
      const i = _timers.indexOf(timer)
      _timers.splice(i, 1)
      callback()
    }, delay*1000 )
  }

  function onEvent(event) {
    delayedCallback(event)
  }

  function addListeners() {
    for ( let el of _elements ) {
      for ( let type of _events ) {
        el.addEventListener( type, onEvent )
      }
    }
  }

  function removeListeners() {
    for ( let el of _elements ) {
      for ( let type of _events ) {
        el.removeEventListener( type, onEvent )
      }
    }
  }

  function delayedCallback(event) {
    if (_enabled) {
      const delay = typeof _delay === "function" ? _delay() : _delay

      if (delay > 0) {
        const timer = {}
        setupCallback(timer, callback, delay)          
        _timers.push(timer)

      } else {
        callback(event)
      }
    }
  }

  function update(events, scope, source, delay, enabled) {
    remove()

    _events = events ? events.split(",").map(x => x.trim()) : []
    _delay = delay
    _enabled = enabled

    if (source !== _source || scope !== _scope) {
      _elements = getElementsInScope(el, source, scope, undefined)
      _source = source
      _scope = scope
    }

    if (_enabled) {
      play()
    }
  }

  function play() {
    if (_enabled) {
      for (let timer of _timers) {
        setupCallback(timer, callback, timer.remainingTime)
      }

      addListeners()

      if (_events.length === 0) {
        delayedCallback(undefined)
      }
    }
  }

  function pause() {
    for (let timer of _timers) {
      timer.remainingTime = timer.delay - (Date.now() - timer.startTime)/1000
      clearTimeout( timer.id )
    }

    removeListeners()
  }

  function remove() {
    pause()
    _timers.length = 0
  }

  return {
    update,
    play,
    pause,
    remove,
  }
}


export function getElementsInScope( el, selector, selectorScope, eventEl ) {
  switch ( selectorScope ) {
    case "self": return selector ? el.querySelectorAll( selector ) : [ el ]
    case "parent": return selector ? el.parentNode.querySelectorAll( selector ) : [ el ]
    case "event": return selector && eventEl instanceof HTMLElement ? eventEl.querySelectorAll( selector ) : [ el ]
    case "document": 
    default:
      return selector ? document.querySelectorAll( selector ) : [ el ]
  }
}


export function loadTemplate(template, testString, callback) {
  const match = template && template.match(/url\((.+)\)/)
  if (match) {
    const filename = match[1]
    // @ts-ignore
    const fileLoader = new THREE.FileLoader()
    fileLoader.load(
      filename, 
      (data) => callback(data),
      () => {},
      (err) => {
        console.error(`unable to load: ${filename} `, err)
      }
    )
  
  } else if ( testString && template.includes(testString) ) {
    callback( template.trim() )

  } else {
    const templateEl = template ? document.querySelector(template) : undefined
    callback( templateEl ? templateEl.textContent.trim() : template.trim() )
    
  }
}

export function info(component, ...msg) {
  console.info(getComponentDebugName(component), ...msg)
}

export function log(component, ...msg) {
  console.log(getComponentDebugName(component), ...msg)
}

export function warn(component, ...msg) {
  console.warn(getComponentDebugName(component), ...msg)
}

export function error(component, ...msg) {
  console.error(getComponentDebugName(component), ...msg)
}

export function getComponentDebugName(component) {
  return domHelper.getDebugName(component.el) + '[' + component.attrName + ']'
}

