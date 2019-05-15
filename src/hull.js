import * as vertex3 from "./vertex3.js"

/**
 * @typedef {{x: number, y: number, z: number}} VecXYZ
 * @typedef {{x: number, y: number, z: number, w: number}} QuatXYZW
 * @typedef {number[] | Float32Array} Vertices
 */

/** @typedef {(vertices: Vertices, indices: number[], point: Vertices, pi?: number) => boolean} IsPointInsideFn */
/** @type {IsPointInsideFn} */
export const isPointInside = (function() {
  const minAxis = new Float32Array(3)
  const maxAxis = new Float32Array(3)
  const delta = new Float32Array(3)

  return /** @type {IsPointInsideFn} */function isPointInside(vertices, indices, point, pi = 0) {
    for (let i = 0; i < indices.length; i++) {
      vertex3.sub(delta, vertices, point, indices[i], pi)
      vertex3.min(minAxis, delta, minAxis)
      vertex3.max(maxAxis, delta, maxAxis)
    }
  
    // If the angle to all hull vertices is greather than PI, then the point
    // is inside of the hull
    return Math.acos(minAxis[0]) - Math.acos(maxAxis[0]) > Math.PI &&
      Math.acos(minAxis[1]) - Math.acos(maxAxis[1]) > Math.PI &&
      Math.acos(minAxis[2]) - Math.acos(maxAxis[2]) > Math.PI
  }
})()

/** @type {(point: Vertices, vertices: Vertices, indices: number[], pi: number) => boolean} */
export function isPointInVertices(point, vertices, indices, pi = 0) {
  for (let j = 0; j < indices.length; j++) {
    if (vertex3.equals(point, vertices, 1e-6, pi, indices[j])) {
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
      for (let j = extremes.length; j < hull.length - 1; j++) {
        if (isPointInside(vertices, hull, vertices, hull[j])) {
          hull.splice(j, 1)
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
    return faceIndices.map(index => {
      const face = hullFaces[index]
      return [[face.ai,face.bi], [face.ai,face.ci], [face.bi,face.ci]]
    }).flat()
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
    vertex3.multiplyScalar(hullCenter, vertex3.scaleAndAdd(hullCenter, vertices, hullCenter, numProcessed, xi, 0), 1/(numProcessed + 1))

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

