import * as attribute from "./attribute.js"
import * as utils from "./utils.js"

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
      if (value) {
        // @ts-ignore
        AFRAME.utils.entity.setComponentProperty(target, parts.join("."), attribute.stringify(value)) // does this work for vectors??
      } else {
        target.removeAttribute(parts) // removes a component or mixin, resets an attribute to default, or removes the attribute if not in the schema
      }
      return
    }
  
    // e.g. object3dmap.mesh.material.uniforms.color
    const path = utils.getWithPath(target, parts)
    if (path) {
      // this only works for boolean, string, color and an array of one element
      path[prop] = Array.isArray(value) && value.length === 1 ? value[0] : value
    } else {
      console.warn(`unknown path for setProperty() '${prop}'`)
    }
  }   
  
})()

/** @type {() => {start: (delay: number, callback: () => void) => void, stop: () => void, pause: () => void, resume: () => void }} */
export function basicTimer() {
  let sendEventTimer
  let timeOfStart
  let timeoutCallback
  let timeRemaining

  function start(delay, callback) {
    stop()
    
    if (delay > 0) {
      sendEventTimer = setTimeout(callback, delay*1000)
      timeOfStart = Date.now()
      timeoutCallback = callback
    } else {
      callback()
    }
  }

  function stop() {
    clearTimeout(sendEventTimer)
    sendEventTimer = undefined
    timeOfStart = undefined
    timeRemaining = undefined
    timeoutCallback = undefined
  }

  function pause() {
    if (sendEventTimer) {
      let remaining = Date.now() - timeOfStart
      stop()
      timeRemaining = remaining
    }
  }

  function resume() {
    if (timeRemaining) {
      start(timeRemaining, timeoutCallback)
      timeRemaining = undefined
    }
  }

  return {
    start,
    stop,
    pause,
    resume
  }
}


/** @type { () => {set: (el: HTMLElement, selector: string, scope: string, eventName: string, callbackFn: (e: any) => boolean) => void, add: () => void, remove: () => void, getElementsInScope: (el: HTMLElement, selector: string, scope: string, eventEl: HTMLElement) => void }} */
export function scopedListener() {
  let elements = []
  let event
  let callback

  function set(el, selector, scope, eventName, callbackFn) {
    remove()
    elements = getElementsInScope(el, selector, scope)
    event = eventName
    callback = callbackFn
  }

  function add() {
    if (event && callback) {
      for (let el of elements) {
        // console.log("scopedListener:add", el.id, event)
        el.addEventListener(event, callback)
      }
    }
  }

  function remove() {
    if (event && callback) {
      for (let el of elements) {
        // console.log("scopedListener:remove", el.id, event)
        el.removeEventListener(event, callback)
      }
    }
  }

  function getElementsInScope(el, selector, scope, eventEl) {
    switch (scope) {
      case "self": return selector === "" ? [el] : el.querySelectorAll(selector) || [el]
      case "parent": return selector === "" ? [el] : el.parentNode.querySelectorAll(selector) || [el]
      case "event": {
        const bestEl = eventEl ? eventEl : el
        return selector === "" ? [bestEl] : bestEl.querySelectorAll(selector) || [bestEl]
      }
      case "document": 
      default:
        return selector === "" ? [el] : document.querySelectorAll(selector) || [el]
    }
  }

  return {
    set,
    add,
    remove,
    getElementsInScope,
  }
}

export function loadTemplate(template, callback) {
  const match = template && template.match(/url\((.+)\)/)
  if (match) {
    const filename = match[1]
    const fileLoader = new THREE.FileLoader()
    fileLoader.load(
      filename, 
      (data) => callback(data),
      () => {},
      (err) => {
        console.error(`unable to load: ${filename} `, err)
      }
    )
  
  } else {
    const templateEl = template ? document.querySelector(template) : undefined
    this.templateContent = templateEl ? templateEl.textContent.trim() : template.trim()
  }
}
