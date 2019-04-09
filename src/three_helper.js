/**
 * @typedef {{x: number, y: number, z: number}} VecXYZ
 * @typedef {{min: VecXYZ, max: VecXYZ}} Extent
 * 
 */

 /** @type {(rootObject3D: object, canvas: object) => void} */
export function updateMaterialsUsingThisCanvas(rootObject3D, canvas) {
  rootObject3D.traverse((node) => {
    if (node.material) {
      for (let map of ["map", "alphaMap", "aoMap", "bumpMap", "displacementMap", "emissiveMap", "envMap", "lighMap", "metalnessMap", "normalMap", "roughnessMap"]) {
        if (node.material[map] && node.material[map].image === canvas) {
          node.material[map].needsUpdate = true
        }
      }

      if (node.material.uniforms) {
        for (let key in node.material.uniforms) {
          const uniform = node.material.uniforms[key]
          if (uniform.value && typeof uniform.value === "object" && uniform.value.image === canvas) {
            uniform.value.needsUpdate = true
          }
        }
      }
    }
  })
}

/** @typedef {<T extends Extent>(out: T, object3D: object) => T} SetFromObject3DFn */
/** @type {SetFromObject3DFn} */
export const setFromObject3D = (function() {
  // @ts-ignore
  let tempPosition = new THREE.Vector3()
  // @ts-ignore
  let tempQuaternion = new THREE.Quaternion()
  // @ts-ignore
  let tempScale = new THREE.Vector3()
  // @ts-ignore
  let tempBox3 = new THREE.Box3()

  return /** @type {SetFromObject3DFn} */function setFromObject3D(ext, object3D) {
    if (object3D.children.length === 0) {
      return ext
    }

    // HACK we force the worldmatrix to identity for the object, so we can get a bounding box
    // based around the origin
    tempPosition.copy(object3D.position)
    tempQuaternion.copy(object3D.quaternion)
    tempScale.copy(object3D.scale)

    object3D.position.set(0,0,0)
    object3D.quaternion.set(0,0,0,1)
    object3D.scale.set(1,1,1)

    tempBox3.setFromObject(object3D) // expensive for models
    // ext.setFromObject(object3D) // expensive for models

    object3D.position.copy(tempPosition)
    object3D.quaternion.copy(tempQuaternion)
    object3D.scale.copy(tempScale)
    object3D.updateMatrixWorld(true)

    ext.min.x = tempBox3.min.x
    ext.min.y = tempBox3.min.y 
    ext.min.z = tempBox3.min.z 
    ext.max.x = tempBox3.max.x 
    ext.max.y = tempBox3.max.y 
    ext.max.z = tempBox3.max.z 

    return ext
  }
})()