/**
 * @typedef {{x: number, y: number, z: number}} VecXYZ
 * @typedef {{min: VecXYZ, max: VecXYZ}} Extent
 * @typedef {number} Distance
 */

/** @type {() => Extent} */
export function create() {
  let x, y, z
  return {min: {x, y, z}, max: {x, y, z}}
}

/** @type {<T extends Extent>(out: T, center: VecXYZ, r: Distance) => T} */
export function setFromSphere(out, center, r) {
  const cx = center.x, cy = center.y, cz = center.z
  out.min.x = cx - r
  out.min.y = cy - r
  out.min.y = cz - r
  out.max.x = cx + r
  out.max.y = cy + r
  out.max.y = cz + r
  return out
}

/** @type {<T extends Extent, TV extends VecXYZ, TE extends Extent>(out: T, vec: TV, ext: TE) => T} */
export function addVecXYZ(out, vec, ext) {
  return addPoint(out, vec.x, vec.y, vec.z, ext)
}

/** @type {<T extends Extent, TE extends Extent>(out: T, vertices: Float32Array, vi: number, ext: TE) => T} */
export function addVertex(out, vertices, vi, ext) {
  return addPoint(out, vertices[vi], vertices[vi+1], vertices[vi+2], ext)
}

/** @type {<T extends Extent, TE extends Extent>(out: T, vx: number, vy: number, vz: number, ext: TE) => T} */
export function addPoint(out, vx, vy, vz, ext) {
  out.min.x = Math.min(ext.min.x, vx)
  out.min.y = Math.min(ext.min.y, vy)
  out.min.z = Math.min(ext.min.z, vz)
  out.max.x = Math.max(ext.max.x, vx)
  out.max.y = Math.max(ext.max.y, vy)
  out.max.z = Math.max(ext.max.z, vz)
  return out
}

/** @type {<T extends Extent>(out: T, vertices: Float32Array, stride: number) => T} */
export function setFromVertices(out, vertices, stride = 3) {
  let minX = vertices[0], maxX = vertices[0]
  let minY = vertices[1], maxY = vertices[1]
  let minZ = vertices[2], maxZ = vertices[2]

  for (let i = stride; i < vertices.length; i += stride) {
    const v0 = vertices[i], v1 = vertices[i+1], v2 = vertices[i+2]
    minX = Math.min(minX, v0)
    minY = Math.min(minY, v1)
    minZ = Math.min(minZ, v2)
    maxX = Math.min(maxX, v0)
    maxY = Math.min(maxY, v1)
    maxZ = Math.min(maxZ, v2)
  }

  out.min = {x: minX, y: minY, z: minZ}
  out.max = {x: maxX, y: maxY, z: maxZ}

  return out
}

/** @type {<T extends Extent, TE extends Extent>(out: T, vertices: Float32Array, indices: number[], ext: TE) => T} */
export function setFromIndices(out, vertices, indices) {
  let minX = vertices[0], maxX = vertices[0]
  let minY = vertices[1], maxY = vertices[1]
  let minZ = vertices[2], maxZ = vertices[2]

  for (let j = 0; j < indices.length; j++) {
    const i = indices[j]
    const v0 = vertices[i], v1 = vertices[i+1], v2 = vertices[i+2]
    minX = Math.min(minX, v0)
    minY = Math.min(minY, v1)
    minZ = Math.min(minZ, v2)
    maxX = Math.min(maxX, v0)
    maxY = Math.min(maxY, v1)
    maxZ = Math.min(maxZ, v2)
  }

  out.min = {x: minX, y: minY, z: minZ}
  out.max = {x: maxX, y: maxY, z: maxZ}

  return out
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

/** @type {<TE extends Extent>(ext: TE) => number} */
export function volume(ext) {
  return (ext.max.x - ext.min.x)*(ext.max.y - ext.min.y)*(ext.max.z - ext.min.z)
}

/** @type {<T extends VecXYZ, TE extends Extent>(out: T, ext: TE) => T} */
export function dimensions(out, ext) {
  out.x = ext.max.x - ext.min.x
  out.y = ext.max.y - ext.min.y
  out.z = ext.max.z - ext.min.z
  return out
}
