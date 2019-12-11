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

/** @type {() => {startTimer: (delay: number, callback: () => void) => any, clearTimer: (timer: any) => void, clearAllTimers: () => void, pause: () => void, resume: () => void }} */
export function basicClock() {
  let timers = []

  function startTimerInternal( timer, delay, callback ) {
    timer.id = setTimeout( () => { clearTimer( timer ); callback() }, delay*1000)
    timer.startTime = Date.now()
    timer.callback = callback
  }

  function startTimer( delay, callback ) {
    if (delay > 0) {
      const newTimer = {}
      startTimerInternal( newTimer, delay, callback )
      timers.push( newTimer )
      return newTimer

    } else {
      callback()
    }
  }

  function clearTimer( timer ) {
    const index = timers.indexOf( timer )
    if ( index >= 0 ) {
      clearTimeout( timer.id )
      timers.splice( index, 1 )
    }
  }

  function clearAllTimers() {
    for ( let timer of timers ) {
      clearTimeout( timer.id )
    }
    timers.length = 0
  }

  function pause() {
    for ( let timer of timers ) {
      timer.resumeTime = Date.now() - timer.startTime
      clearTimeout( timer.id )
    }
  }

  function resume() {
    for ( let timer of timers ) {
      if ( timer.resumeTime ) {
        startTimerInternal( timer, timer.resumeTime, timer.callback )
        delete timer.resumeTime
      }
    }
  }

  return {
    startTimer,
    clearTimer,
    clearAllTimers,
    pause,
    resume
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


/** @type { ( eventNames: string, callback: EventListener ) => any } */
export function scopedEvents( thisEl, callback ) {
  let eventNames, source, scope
  let hasListeners = false
  let elements = []
  let eventTypes = parseEventNames( eventNames )
 
  function parseEventNames( eventNames ) {
    return eventNames && typeof eventNames === "string" ? eventNames.split( "," ).map( x => x.trim() ) : []
  }

  function set( newEventNames, newSource, newScope ) {
    const wasListening = hasListeners

    if ( wasListening && ( newEventNames !== eventNames || newSource !== source || newScope !== scope ) ) {
      remove()
    }

    source = newSource
    scope = newScope

    if ( eventNames !== newEventNames ) {
      eventNames = newEventNames
      eventTypes = parseEventNames( eventNames )
    }

    elements = getElementsInScope( thisEl, source, scope, undefined )

    if ( wasListening ) {
      add()
    }
  }

  function add() {
    if ( !hasListeners ) {
      for ( let el of elements ) {
        for ( let type of eventTypes ) {
          el.addEventListener( type, callback )
        }
      }
      hasListeners = true
    }
  }

  function remove() {
    if ( hasListeners ) {
      for ( let el of elements ) {
        for ( let type of eventTypes ) {
          el.removeEventListener( type, callback )
        }
      }
      hasListeners = false
    }
  }

  return {
    set,
    add,
    remove,
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

// creates a data channel with the same name as the component
// usage:
// AFRAME.registerSystem(<componentName>, {
//  ...simpleNetworkSystem(<componentName>),
//  init() {
//    this.setupNetwork()
//  },
//  remove() {
//    this.shutdownNetwork()
//  },
// })
//
// AFRAME.registerComponent(<componentName>), {
//   init() {
//     this.system.registerNetworkedComponent(this)
//   }
//   remove() {
//     this.system.unregisterNetworkComponent(this)
//   }
//   receiveNetworkData(key, data, senderId) {
//     if (key === "newreplica") {
//       // send any setup data to the replica
//     }
//     // process other names
//   }
// })

/** @type {(componentName: string) => {
 *  isConnectedTo: (clientId: string) => boolean,
 *  isEntityNetworked: (el: Element) => boolean,
 *  isOwner: (component: any) => boolean,
 *  onInstantiated: (event: Event) => void,
 *  ownerSendNetworkData: (component: any, key: string, data: any, targetId?: string) => void
 *  sendNetworkData: (component: any, key: string, data: any, targetId?: string) => void,
 *  setupNetwork: () => void,
 *  shutdownNetwork: () => void,
 *  takeOwnership: (component: any) => void,
 *  registerNetworkedComponent: (component: any) => void,
 *  unregisterNetworkedComponent: (component: any) => void,
 * }} */
export function simpleNetworkSystem(componentName) {

  return {
    isConnectedTo(clientId) {
      return typeof NAF === "object" ? NAF.connection.isConnectedTo(clientId) : false
    },
  
    isEntityNetworked(el) {
      /** @type {any} */
      let curEntity = el
    
      if (typeof NAF === "object") {
        while (curEntity && curEntity.components && !curEntity.components.networked) {
          curEntity = curEntity.parentNode
        }
      
        if (curEntity && curEntity.components && curEntity.components.networked) {
          return true
        }
      }
    
      return false
    },

    isOwner(component) {
      return typeof NAF === "object" ? NAF.utils.isMine(component.el) : true
    },

    onInstantiated(event) {
      const el = event.detail.el
      const networkId = NAF.utils.getNetworkId(el)
      const component = el.components[componentName]
      this.networkComponents[networkId] = component
  
      if (!NAF.utils.isMine(el)) {
        this.sendNetworkData(component, "newreplica", undefined)
      }
    },

    ownerSendNetworkData(component, key, data, targetId = undefined) {
      if (this.isOwner(component)) {
        this.sendNetworkData(component, key, data, targetId)
      }
    },
  
    sendNetworkData(component, key, data, targetId = undefined) {
      if (this.isEntityNetworked(component.el)) {
        const packet = {
          key,
          networkId: NAF.utils.getNetworkId(component.el),
          data
        }
        
        if (targetId) {
          NAF.connection.sendDataGuaranteed(targetId, componentName, packet)
        } else {
          NAF.connection.broadcastData(componentName, packet)
        }
      }
    },

    setupNetwork() {
      this.networkComponents = new Map() // map by networkId
      this.onInstantiated = this.onInstantiated.bind(this)
  
      if (typeof NAF !== "object") {
        return
      }
  
      NAF.connection.subscribeToDataChannel(componentName, (senderId, type, packet, targetId) => {
        const component = this.networkComponents[packet.networkId]
        if (component) {
          component.receiveNetworkData(packet.key, packet.data, senderId)
        }
      })
    },
  
    shutdownNetwork() {
      if (typeof NAF !== "object") {
        return
      }
  
      NAF.connection.unsubscribeToDataChannel(componentName)
    },
  
    takeOwnership(component) {
      if (!this.isOwner(component)) {
        NAF.utils.takeOwnership(component.el)
      }
    },
  
    registerNetworkedComponent(component) {
      if (typeof component.receiveNetworkData !== "function") {
        throw Error(`missing receiveNetworkData(key, packet, senderId)`)
      }   

      if (typeof NAF === "object" && this.isEntityNetworked(component.el)) {
        component.el.addEventListener("instantiated", this.onInstantiated) // from "networked" component, once it is setup
      }
    },
  
    unregisterNetworkedComponent(component) {
      component.el.removeEventListener("instantiated", this.onInstantiated) // does nothing if it was never added
  
      for (let networkId in this.networkComponents) {
        if (this.networkComponents[networkId] === component) {
          delete this.networkComponents[networkId]
          break
        }
      }
    },

  }
}

