import * as vertex3 from "./vertex3.js"
import * as utils from "./utils.js"
// import hullCModule from "../build/hull.c.mjs"

/**
 * @typedef {{x: number, y: number, z: number}} VecXYZ
 * @typedef {{x: number, y: number, z: number, w: number}} QuatXYZW
 * @typedef {number[] | Float32Array} Vertices
 */

// ITERATIVE VERSION
// /** @type { IsPointInsideFn } */
// export function isPointInside( vertices, indices, point, pi ) {
//   console.assert( indices[ 0 ] !== pi )

//   const EPSILON = 1e-6
//   const normal = new Float32Array( 3 )
//   const a = new Float32Array( 3 )
//   const ap = new Float32Array( 3 )
//   const pab = new Float32Array( 3 )
//   const pb = new Float32Array( 3 )
//   const ab = new Float32Array( 3 )
//   let failList = [0] // 0 is the first chosen index

//   vertex3.copy( a, vertices, indices[ 0 ] ) // initially a and b are both at index0
//   vertex3.sub( pab, a, point, 0, pi )
//   vertex3.normalize( normal, pab )

//   for ( let i = 0; i < indices.length; ) {
//     const bi = indices[i]
//     vertex3.sub( pb, vertices, point, bi, pi )
//     const cosine = vertex3.dot( pb, normal )
//     if ( cosine < -EPSILON ) { // ideally < 0, but there may be some rounding error
//       if ( failList.includes(bi) ) {
//         // we are failing something again, our approximation is not getting better so there is no
//         // solution and we must be inside
//         return true
//       }

//       // re-estimate the normal to be the line from 'point' to the projection of 'point' onto 'ab'
//       // pa' = dot( -pa,unit(ab) )*unit(ab) + a - p
//       vertex3.sub( ab, vertices, a, bi )
//       vertex3.sub( ap, point, a, pi )
//       vertex3.normalize( ab, ab )
//       const dotAB = vertex3.dot( ap, ab )
//       vertex3.multiplyScalar( pab, ab, dotAB )
//       vertex3.add( pab, a, pab )
//       vertex3.sub( pab, pab, point, 0, pi )

//       if (pab[0] === 0 && pab[1] === 0 && pab[2] === 0) {
//         return true // point is on the line ab, consider it to be inside
//       }

//       vertex3.normalize( normal, pab )
//       vertex3.copy(a, vertices, bi) // next a point will be our last fail

//       failList.push(bi)
//       i = 0 // retest all vertices

//     } else {
//       i++
//     }
//   }

//   return false
// }

/** @typedef {(vertices: Vertices, indices: number[], point: Vertices, pi?: number) => boolean} IsPointInsideFn */
/** @type {IsPointInsideFn} */
export const isPointInside = (function() {
  const X_AXIS = new Float32Array([1,0,0])
  const Y_AXIS = new Float32Array([0,1,0])
  const delta = new Float32Array(3)
  const front = new Float32Array(3)
  const right = new Float32Array(3)
  const up = new Float32Array(3)

  return /** @type {IsPointInsideFn} */function isPointInside(vertices, indices, point, pi = 0) {
    // generate an axis with forward from point to index0, and up towards 0,1,0 (if possible)
    // this will be used as the basis for determining the spherical coordinates of each index
    vertex3.sub(front, vertices, point, indices[0], pi)
    vertex3.normalize(front, front)
    vertex3.copy( up, Math.abs( vertex3.dot(front, Y_AXIS) ) > 0.99 ? X_AXIS : Y_AXIS )
    vertex3.normalize( right, vertex3.cross(right, front, up) )
    vertex3.normalize( up, vertex3.cross(up, right, front) )

    let angles = [], modAngles = []

    // because we use an axis with forward from point to index0, index0 is always at angle 0
    let minPhi = 0
    let maxPhi = 0
    for (let i = 1; i < indices.length; i++) {
      const vi = indices[i]
      if (vi === pi) {
        continue
      }

      vertex3.sub(delta, vertices, point, vi, pi)
      vertex3.normalize(delta, delta)


      // determine the spherical coordinates for delta
      // phi will be 0 in the direction of the forward and PI for -forward
      // theta will be 0 for up and PI/-PI for -up
      // rounding errors can produce a dot product outside (-1,1) so clamp it to that range
      let phi = Math.acos( utils.clamp( vertex3.dot(front, delta), -1, 1 ) )
      const oldPhi = phi

      // if the projection on the up vector is below 0 then switch phi to a negative number, 
      // this gives our phi a range of (-PI,PI) centered at 0 on the forward
      const upDot  = vertex3.dot(up, delta)
      phi = (upDot < 0) ? -phi : phi

      angles.push([i, vi, oldPhi, phi, upDot, vertices[vi], vertices[vi+1], vertices[vi+2]])

      minPhi = Math.min(phi, minPhi)
      maxPhi = Math.max(phi, maxPhi)
    }

    if (angles.length > 1e10 || modAngles.length > 1e10) {
      return true
    }

    // if the range of phi angles is larger than PI, then all vertices surround 'point', and thus 'point' is inside
    // of the hull
    return maxPhi - minPhi > Math.PI
  }
})()

/** @type {(point: Vertices, vertices: Vertices, indices: number[], pointI: number) => boolean} */
export function isPointInVertices(point, vertices, indices, pointI = 0) {
  for (let j = 0; j < indices.length; j++) {
    if (vertex3.equals(point, vertices, 1e-6, pointI, indices[j])) {
      return true
    }
  }
  return false
}

/** @type {(vertices: Vertices, stride: number) => number[]} */
export function generateHullIndices(vertices, stride = 3) {
  let extremes = vertex3.generateExtremes(vertices, stride)
  let hull = extremes.slice()

  for (let i = 0; i < vertices.length; i += stride) {
    if (extremes.includes(i)) {
      continue // ignore the extremes, they are already in the hull
    }

    if (isPointInVertices(vertices, vertices, hull, i)) {
      continue // ignore repeated points
    }

    if (!isPointInside(vertices, hull, vertices, i)) {
      hull.push(i) // expand the hull

      // remove points that are now inside the hull, we can ignore
      // the extremes and the last point added because they are guaranteed
      // to not be inside the hull
      for (let j = extremes.length; j < hull.length - 1; ) {
        if (isPointInside(vertices, hull, vertices, hull[j])) {
          hull.splice(j, 1)
        } else {
          j++
        }
      }
    }
  }

  return hull
}


export function generateHullTriangles(vertices, indices, n) {
  n = n || indices.length

  /** @typedef { {ai: number, bi: number, ci: number, normal: Vertices, } } HullFace */
  /** @type { HullFace[] } */
  const hullFaces = []
  const hullCenter = new Float32Array(3) // the centroid is used to determine the outward normals
  const vec3 = new Float32Array(3)

  /** @type {(ai: number, bi: number, ci: number) => HullFace} */
  function buildFace(ai, bi, ci) {
    const normal = new Float32Array(3)

    vertex3.setFromCoplanarPoints(normal, vertices, vertices, vertices, ai, bi, ci)

    // if the normal is in the same direction as the centroid to vertex ai, then ai,bi,ci are counter-clockwise
    // and the normal is correct, otherwise ai,bi,ci are clockwise, so swap bi and ci and reverse the normal
    if (vertex3.dot(normal, vertex3.sub(vec3, vertices, hullCenter, ai)) > 0) {
      return { ai, bi, ci, normal }
    } else {
      return { ai, bi:ci, ci:bi, normal: vertex3.multiplyScalar(normal, normal, -1) }
    }
  }

  /** @type {(fi: number) => number[]} */
  function getFacingFaces(fi) {
    let faceIndices = []

    for (let i = 0; i < hullFaces.length; i++) {
      vertex3.normalize( vec3, vertex3.sub(vec3, vertices, vertices, fi, hullFaces[i].ai) )
      const dot = vertex3.dot( vec3, hullFaces[i].normal )
      if (dot > 0) {
        faceIndices.push(i)
      }
    }
    return faceIndices
  }

  /** @type {(faceIndices: number[]) => number[][]} */
  function getEdgesFromFaces(faceIndices) {
    return faceIndices.flatMap(index => {
      const face = hullFaces[index]
      return [[face.ai,face.bi], [face.ai,face.ci], [face.bi,face.ci]]
    })
  }

  /** @type {(edges: number[][]) => number[][]} */
  function removeDuplicateEdges(edges) {
    for (let i = 0; i < edges.length; ) {
      let removed = false

      for (let j = i + 1; j < edges.length; j++) {
        if ( (edges[i][0] === edges[j][0] && edges[i][1] === edges[j][1]) ||
             (edges[i][1] === edges[j][0] && edges[i][0] === edges[j][1]) ) {
          edges.splice(j, 1) // remove the highest index first
          edges.splice(i, 1)
          removed = true
          break // an edge can only be duplicated once
        }
      }

      if (!removed) {
        i++
      }
    }

    return edges
  }

  // form a triangular pyramid with the first 4 non-coplanar vertices in the hull
  const ai = indices[0]
  const bi = indices[1]
  const ci = indices[2]
  let dj = 3
  let numProcessed = 0

  for (dj = 3; dj < n; dj++) {
    const di = indices[dj]
    if (!vertex3.areCoplanar(vertices, vertices, vertices, vertices, 1e-5, ai, bi, ci, di)) {
      vertex3.centroidFromIndices(hullCenter, vertices, [ai,bi,ci,di])
      hullFaces.push( buildFace(ai, bi, ci) )
      hullFaces.push( buildFace(ai, bi, di) )
      hullFaces.push( buildFace(ai, ci, di) )
      hullFaces.push( buildFace(bi, ci, di) )
      numProcessed = 4
      break
    }
  }

  if (dj === n) {
    return undefined // all points are coplanar, unable to build a hull
  }

  for (let xj = 3; xj < n; xj++) {
    if (xj === dj) {
      continue
    }
    const xi = indices[xj]
    const faceIndices = getFacingFaces(xi)
    const edges = getEdgesFromFaces(faceIndices)

    if (faceIndices.length > 1) {
      removeDuplicateEdges(edges) // duplicate edges represent edges that will now be inside convex shape
    }

    // update the centroid with the new vertex
    vertex3.scaleAndAdd(hullCenter, vertices, hullCenter, numProcessed, xi, 0)
    vertex3.multiplyScalar(hullCenter, hullCenter, 1/(numProcessed + 1))

    // remove faceIndices from higest to lowest faceIndices[index], so each index is still valid after previous removals
    for (let index = faceIndices.length - 1; index >= 0; --index) {
      hullFaces.splice(faceIndices[index], 1)
    }

    // build the new faces using the edges silhoeutte
    for (let edge of edges) {
      hullFaces.push( buildFace(edge[0], edge[1], xi) )
    }

    numProcessed++
  }

  return hullFaces.flatMap(face => [face.ai, face.bi, face.ci])
}

// export const c = hullCModule()
// const cGenerateHullTriangles = c.cwrap('generateHullTriangles', 'number', ['number', 'array', 'number', 'number'])

// export function generateHullTriangles2(vertices, stride = 3) {
//   const verticesTyped = vertices.buffer ? vertices : Float32Array.from(vertices)

//   const verticesUint8 = new Uint8Array(verticesTyped.buffer, 0, verticesTyped.byteLength)
//   const outIndicesPtr = c._malloc(1024*3*4); // offset into c.HEAPU8.buffer

//   const numIndices = cGenerateHullTriangles(outIndicesPtr, verticesUint8, vertices.length, stride)
//   const indices = numIndices > 0 ? new Int32Array(c.HEAPU8.buffer, outIndicesPtr, numIndices) : []
//   c._free(outIndicesPtr)

//   if (numIndices < 0) {
//     console.error("cGenerateHullTriangles failed: ", numIndices)
//   }

//   return indices
// }
