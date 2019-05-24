import * as vertex3 from "./vertex3.js"
// import hullCModule from "../build/hull.c.mjs"

/**
 * @typedef {{x: number, y: number, z: number}} VecXYZ
 * @typedef {{x: number, y: number, z: number, w: number}} QuatXYZW
 * @typedef {number[] | Float32Array} Vertices
 */

export function generateHullTriangles(vertices, stride = 3) {
  const numVertices = vertices.length
  if (numVertices < 12) {
    return undefined // too few triangles for a hull
  }

  /** @typedef { {ai: number, bi: number, ci: number, normal: Vertices, } } HullFace */
  /** @type { HullFace[] } */
  const hullFaces = []
  const hullCenter = new Float32Array(3) // the centroid is used to determine the outward normals
  const vec3 = new Float32Array(3)
  const TOLERANCE = 1e-5 // tolerance for rounding errors in calculations

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
      if (dot > TOLERANCE) {
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

  // form a triangular pyramid with the first 4 non-coplanar unique vertices in the hull
  let numProcessed = 0
  let di = 0

  for (let ai = 0, bi = 0, ci = 0, i = stride; i < numVertices; i += stride) {
    if (bi === 0) {
      if (!vertex3.equals(vertices, vertices, 1e-5, i, ai)) {
        bi = i
      }
    } else if (ci === 0) {
      if (!vertex3.equals(vertices, vertices, 1e-5, i, bi)) {
        ci = i
      }
    } else if (di === 0) {
      if (!vertex3.equals(vertices, vertices, 1e-5, i, ci) && !vertex3.areCoplanar(vertices, vertices, vertices, vertices, 1e-5, ai, bi, ci, i)) {
        di = i
        vertex3.centroidFromIndices(hullCenter, vertices, [ai,bi,ci,di])
        hullFaces.push( buildFace(ai, bi, ci) )
        hullFaces.push( buildFace(ai, bi, di) )
        hullFaces.push( buildFace(ai, ci, di) )
        hullFaces.push( buildFace(bi, ci, di) )
        numProcessed = 4
        break
      }
    }
  }

  if (numProcessed === 0) {
    return undefined // all points are coplanar, unable to build a hull
  }

  for (let xi = 3*stride; xi < numVertices; xi += stride) {
    if (xi === di) {
      continue
    }

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
