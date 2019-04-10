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
      if (Array.isArray(value)) {
      } else if (typeof value === "object") {
        value = [value.x, value.y, value.z]
      } else {
        value = value.split(" ").map(trim)
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
        target.removeAttribute(parts.join("."))
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

