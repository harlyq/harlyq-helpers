export function isNetworked(component) {
  let curEntity = component.el;

  while(curEntity && curEntity.components && !curEntity.components.networked) {
    curEntity = curEntity.parentNode;
  }

  return curEntity && curEntity.components && curEntity.components.networked && curEntity.components.networked.data
}

export function takeOwnership(component) {
  if (typeof NAF === "object" && isNetworked(component)) {
    NAF.utils.takeOwnership(component.el)
  } 
}

export function isMine(component) {
  if (typeof NAF === "object" && isNetworked(component)) {
    const owner = NAF.utils.getNetworkOwner(component.el)
    return !owner || owner === NAF.clientId
  }
  return true
}

export function getClientId() {
  return typeof NAF === "object" ? NAF.clientId : undefined
}

export function wasCreatedByNetwork(component) {
  return !!component.el.firstUpdateData
}

export function networkSystem(componentName) {

  return {
    registerNetworking(component, callbacks) {
      if (typeof NAF === "object") {
        const el = component.el
        console.assert(!this.networkCallbacks.has(component), `component already registered`)
        this.networkCallbacks.set(component, callbacks)
  
        // if NAF.client is not set then requestSync() will be called from onConnected
        // if networkId is not set then requestSync() will be called from onEntityCreated
        if (NAF.clientId && NAF.utils.getNetworkId(el)) {
          this.requestSync(component)
        }
  
        if (typeof callbacks.onOwnershipGained === "function") {
          el.addEventListener("ownership-gained", callbacks.onOwnershipGained)
        }
  
        if (typeof callbacks.onOwnershipLost === "function") {
          el.addEventListener("ownership-lost", callbacks.onOwnershipLost)
        }
  
        if (typeof callbacks.onOwnershipChanged === "function") {
          el.addEventListener("ownership-changed", callbacks.onOwnershipChanged)
        }
      }
    },
  
    unregisterNetworking(component) {
      if (typeof NAF === "object") {
        console.assert(this.networkCallbacks.has(component), `component not registered`)
        const el = component.el
        const callbacks = this.networkCallbacks.get(component)
  
        if (typeof callbacks.onOwnershipGained === "function") {
          el.removeEventListener("onOwnershipGained", callbacks.onOwnershipGained)
        }
  
        if (typeof callbacks.onOwnershipLost === "function") {
          el.removeEventListener("onOwnershipLost", callbacks.onOwnershipLost)
        }
  
        if (typeof callbacks.onOwnershipChanged === "function") {
          el.removeEventListener("onOwnershipChanged", callbacks.onOwnershipChanged)
        }
  
        this.networkCallbacks.delete(component)
      }
    },
  
    setupNetwork() {
      if (typeof NAF === "object") {
        this.networkCache = {}
        this.networkCallbacks = new Map()
        this.networkPacket = {}
  
        NAF.connection.subscribeToDataChannel(componentName, (senderId, type, packet, targetId) => {
          const entity = NAF.entities.getEntity(packet.networkId)
          const component = entity ? entity.components[componentName] : undefined
  
          if (packet.data === "NETRequestSync") {
            if (component && NAF.clientId === NAF.utils.getNetworkOwner(entity)) {
              const callbacks = this.networkCallbacks.get(component)
              if (typeof callbacks.requestSync === "function") {
                callbacks.requestSync(senderId)
              }  
            }
  
          } else if (component) {
            const callbacks = this.networkCallbacks.get(component)
            if (typeof callbacks.receiveNetworkData === "function") {
              callbacks.receiveNetworkData(packet.data, senderId)
            }
  
          } else {
            // we've received a packet for an element that does not yet exist, so cache it
            // TODO do we need an array of packets?
            packet.senderId = senderId
            this.networkCache[packet.networkId] = packet
          }
        })
  
        this.onEntityCreated = this.onEntityCreated.bind(this)
        this.onClientConnected = this.onClientConnected.bind(this)
        this.onClientDisconnected = this.onClientDisconnected.bind(this)
        this.onConnected = this.onConnected.bind(this)
  
        if (!NAF.clientId) {
          document.body.addEventListener("connected", this.onConnected)
        }
  
        document.body.addEventListener("entityCreated", this.onEntityCreated)
        document.body.addEventListener("clientConnected", this.onClientConnected)
        document.body.addEventListener("clientDisconnected", this.onClientDisconnected)
      }
    },
  
    shutdownNetwork() {
      if (typeof NAF === "object") {
        NAF.connection.unsubscribeToDataChannel(componentName)
  
        document.body.removeEventListener("connected", this.onConnected) // ok to remove even if never added
        document.body.removeEventListener("entityCreated", this.onEntityCreated)
        document.body.removeEventListener("clientConnected", this.onClientConnected)
        document.body.removeEventListener("clientDisconnected", this.onClientDisconnected)
  
        console.assert(this.networkCallbacks.length === 0, `missing calls to unregisterNetworking(). Some components are still registered`)
        delete this.networkCallbacks
        delete this.networkCache
      }
    },
  
    broadcastNetworkData(component, data) {
      this.sendNetworkData(component, data, undefined)
    },
  
    sendNetworkData(component, data, targetId) {
      if (typeof NAF === "object") {
        const networkId = NAF.utils.getNetworkId(component.el)
        if (networkId) {
          this.networkPacket.networkId = networkId
          this.networkPacket.data = data
          if (targetId) {
            NAF.connection.sendDataGuaranteed(targetId, componentName, packet)
          } else {
            NAF.connection.broadcastData(componentName, packet)
          }
        }
      }
    },
  
    onConnected(event) {
      this.networkCallbacks.forEach((_, component) => {
        this.requestSync(component)
      })
      document.body.removeEventListener("connected", this.onConnected)
    },
  
    onEntityCreated(event) {
      const el = event.detail.el
      const component = el.components[componentName]
      const networkId = NAF.utils.getNetworkId(el)
      const packet = networkId ? this.networkCache[networkId] : undefined
  
      if (component && packet) {
        const callbacks = this.networkCallbacks.get(component)
        if (typeof callbacks.receiveNetworkData === "function") {
          callbacks.receiveNetworkData(packet.data, packet.senderId)
        }
        delete this.networkCache[networkId]
      }
  
      if (component && NAF.clientId) {
        this.requestSync(component)
      }
    },
  
    onClientConnected(event) {
      const clientId = event.detail.clientId
      this.networkCallbacks.forEach((callbacks) => {
        if (typeof callbacks.onClientConnected === "function") {
          callbacks.onClientConnected(event)
        }
      })
    },
  
    onClientDisconnected(event) {
      const clientId = event.detail.clientId
      this.networkCallbacks.forEach((callbacks) => {
        if (typeof callbacks.onClientDisconnected === "function") {
          callbacks.onClientDisconnected(event)
        }
      })
    },
  
    requestSync(component) {
      this.broadcastNetworkData(component, "NETRequestSync")
    },
  
  }
}


