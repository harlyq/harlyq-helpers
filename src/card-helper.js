import * as instanced from "./instanced.js"

function calcCircleUVs(circleSegments) {
  const uvs = [.5,.5]
  const indices = []

  for (let i = 0; i < circleSegments; i++) {
    const theta = 2*Math.PI*(i/circleSegments)
    const cosTheta = Math.cos(theta)
    const sinTheta = Math.sin(theta)
    uvs.push(.5*cosTheta + .5, .5*sinTheta + .5)
  }

  for (let i = 0; i < circleSegments - 1; i++) {
    indices.push(0, i+1, i+2)
  }
  indices.push(0, circleSegments, 1)

  return {uvs, indices}
}


// circle mesh with one less vertex, but generates thinner triangles
// function calcCircleUVs(circleSegments) {
//   const uvs = []
//   const indices = []

//   for (let i = 0; i < circleSegments; i++) {
//     const theta = 2*Math.PI*(i/circleSegments)
//     const cosTheta = Math.cos(theta)
//     const sinTheta = Math.sin(theta)
//     uvs.push(.5*cosTheta + .5, .5*sinTheta + .5)
//   }

//   const numQuads = circleSegments/2 - 1
//   for (let i = 0; i < numQuads; i++) {
//     indices.push(i, circleSegments-i-2, circleSegments-i-1)
//     indices.push(i+1, circleSegments-i-2, i)
//   }

//   return {uvs, indices}
// }

function calcCornerUVs(cornerSegments) {
  const uvs = [0,0]
  const indices = []

  // push cornerSegments + 1 uvs
  for (let i = 0; i <= cornerSegments; i++) {
    const theta = Math.PI*(i/2/cornerSegments)
    const cosTheta = Math.cos(theta)
    const sinTheta = Math.sin(theta)
    uvs.push(cosTheta, sinTheta)
  }

  for (let i = 0; i < cornerSegments; i++) {
    indices.push(0, i+1, i+2)
  }

  return {uvs, indices}
}

function remapUVs(uvs, s, t, ds, dt) {
  const sts = []
  for (let i = 0; i < uvs.length; i += 2) {
    sts.push(uvs[i]*ds + s, uvs[i+1]*dt + t)
  }
  return sts
}

function repeat(count, ins) {
  const outs = ins.slice()
  while (--count > 0) {
    outs.push(...ins)
  }
  return outs
}

function uvsToVerts(uvs) {
  const verts = []

  for (let i = 0, j = 0; i < uvs.length; i += 2, j += 3) {
    verts[j] = uvs[i]
    verts[j+1] = 0
    verts[j+2] = uvs[i+1]
  }

  return verts
}

function reverseIndices(indices) {
  const outs = Array(indices.length)
  for (let i = 0; i < indices.length; i+=3) {
    outs[i+2] = indices[i]
    outs[i+1] = indices[i+1]
    outs[i]   = indices[i+2]
  }
  return outs
}

export function calcRoundedCardAttrs(w, h, r, cornerSegments) {
  const corner = calcCornerUVs(cornerSegments)
  const n = corner.uvs.length/2
  const w_2 = w/2
  const h_2 = h/2
  const r_w = r/w
  const r_h = r/h

  const positions = new Float32Array([
    // front
    ...uvsToVerts( remapUVs(corner.uvs,  w_2-r,  h_2-r,  r,  r) ),
    ...uvsToVerts( remapUVs(corner.uvs,  w_2-r, -h_2+r,  r, -r) ),
    ...uvsToVerts( remapUVs(corner.uvs, -w_2+r, -h_2+r, -r, -r) ),
    ...uvsToVerts( remapUVs(corner.uvs, -w_2+r,  h_2-r, -r,  r) ),

    // back
    ...uvsToVerts( remapUVs(corner.uvs, -w_2+r,  h_2-r, -r,  r) ),
    ...uvsToVerts( remapUVs(corner.uvs, -w_2+r, -h_2+r, -r, -r) ),
    ...uvsToVerts( remapUVs(corner.uvs,  w_2-r, -h_2+r,  r, -r) ),
    ...uvsToVerts( remapUVs(corner.uvs,  w_2-r,  h_2-r,  r,  r) ),
  ])
  const normals = new Float32Array( [
    ...repeat(4*n, [0,1,0]), // front
    ...repeat(4*n, [0,-1,0]) // back
  ])
  const uvs = new Float32Array(repeat(2, [
    ...remapUVs(corner.uvs, 1-r_w, 1-r_h,  r_w,  r_h),
    ...remapUVs(corner.uvs, 1-r_w,   r_h,  r_w, -r_h),
    ...remapUVs(corner.uvs,   r_w,   r_h, -r_w, -r_h),
    ...remapUVs(corner.uvs,   r_w, 1-r_h, -r_w,  r_h),
  ]))
  const reversedCornerIndices = reverseIndices(corner.indices)
  const indices = [
    // front
    ...corner.indices, // top-right
    ...reversedCornerIndices.map(x => x + n), // bottom-right
    ...corner.indices.map(x => x + 2*n), // bottom-left
    ...reversedCornerIndices.map(x => x + 3*n), // top-left
    3*n-1, 2*n-1, n-1, // main i
    3*n-1, n-1, 4*n-1, // main ii
    n, n+1, 1, // right i
    n, 1, 0, // right ii
    2*n+1, 2*n, 3*n, // left i
    2*n+1, 3*n, 3*n+1, // left ii

    // back (start from 4*n)
    ...corner.indices.map(x => x + 4*n), // top-left
    ...reversedCornerIndices.map(x => x + 5*n), // bottom-left
    ...corner.indices.map(x => x + 6*n), // bottom-right
    ...reversedCornerIndices.map(x => x + 7*n), // top-right
    7*n-1, 6*n-1, 5*n-1, // main i
    7*n-1, 5*n-1, 8*n-1, // main ii
    5*n, 5*n+1, 4*n+1, // left i
    5*n, 4*n+1, 4*n, // left ii
    6*n+1, 6*n, 7*n, // right i
    6*n+1, 7*n, 7*n+1, // right ii
  ]

  return {positions, normals, uvs, indices}
}

export function calcCircleCardAttrs(width, height, circleSegments) {
  const circle = calcCircleUVs(circleSegments)
  const n = circle.uvs.length/2

  const positions = new Float32Array([
    ...uvsToVerts( remapUVs(circle.uvs, -width/2, -height/2,  width, height) ), // front
    ...uvsToVerts( remapUVs(circle.uvs,  width/2, -height/2, -width, height) ), // back
  ])
  const normals = new Float32Array([
    ...repeat(n, [0,1,0]), // front
    ...repeat(n, [0,-1,0]) // back
  ])
  const uvs = new Float32Array([
    ...circle.uvs, // front
    ...circle.uvs, // back
  ])
  const indices = [
    ...circle.indices, // front
    ...circle.indices.map(x => x + n), // back
  ]

  return {positions, normals, uvs, indices}
}

export function calcRectangularCardAttrs(width, height) {
  const w_2 = width/2, h_2 = height/2
  
  const positions = new Float32Array([
    -w_2, 0,  h_2,
     w_2, 0,  h_2,
     w_2, 0, -h_2,
    -w_2, 0, -h_2,
     w_2, 0,  h_2,
    -w_2, 0,  h_2,
    -w_2, 0, -h_2,
     w_2, 0, -h_2,
  ])
  const normals = new Float32Array([
    0,1,0,
    0,1,0,
    0,1,0,
    0,1,0,
    0,-1,0,
    0,-1,0,
    0,-1,0,
    0,-1,0,
  ])
  const uvs = new Float32Array([
    0,1,
    1,1,
    1,0,
    0,0,
    0,1,
    1,1,
    1,0,
    0,0,
  ])
  const indices = [
    0,2,1,
    0,3,2,
    4,6,5,
    4,7,6,
  ]
  
  return {positions, normals, uvs, indices}
}

export function createCardMesh(w, h, r, cornerSegments, texture) {
  let attrs

  if (cornerSegments <= 0 || r <= 0) {
    attrs = calcRectangularCardAttrs(w, h)
  } else if (r >= w/2 && r >= h/2) {
    attrs = calcCircleCardAttrs(w, h, 4*cornerSegments)
  } else {
    attrs = calcRoundedCardAttrs(w, h, r, cornerSegments)
  }

  const cardMaterial = new THREE.MeshStandardMaterial({ map: texture })
  const cardGeo = new THREE.BufferGeometry()

  cardGeo.setAttribute("position", new THREE.BufferAttribute(attrs.positions, 3))
  cardGeo.setAttribute("normal", new THREE.BufferAttribute(attrs.normals, 3))
  cardGeo.setAttribute("uv", new THREE.BufferAttribute(attrs.uvs, 2))
  cardGeo.setIndex(attrs.indices)

  return new THREE.Mesh(cardGeo, cardMaterial)
}

export function createPack(numCards, textureRows, textureCols, cardMesh) {
  const packMesh = instanced.createMesh(cardMesh, numCards)

  packMesh.geometry.setAttribute( "instanceCardFrame", new THREE.InstancedBufferAttribute (new Float32Array(numCards*2), 2 ) )

  packMesh.material.onBeforeCompile = (function(oldBeforeCompile) {
    return function beforeCompileForPack(shader, renderer) {
      oldBeforeCompile(shader, renderer)

      shader.uniforms.textureFrames = { value: new THREE.Vector2(textureCols, textureRows) }

      shader.vertexShader = shader.vertexShader.replace("void main()", `
      attribute vec2 instanceCardFrame;
      uniform vec2 textureFrames;

      void main()`)

      shader.vertexShader = shader.vertexShader.replace("#include <uv_vertex>", `
      #include <uv_vertex>
      {
      #ifdef USE_UV
        float frame = normal.y < 0. ? instanceCardFrame.x : instanceCardFrame.y;
        vUv.x = (mod(frame,textureFrames.x) + vUv.x)/textureFrames.x;
        vUv.y = 1. - (floor(frame/textureFrames.x) + (1. - vUv.y))/textureFrames.y;
      #endif
      }`)
    }
  })(packMesh.material.onBeforeCompile)

  packMesh.material.needsUpdate = true

  return {
    packMesh,
    nextIndex: 0,
    numCards,
  }
}

export function createCard(pack, front, back) {
  const index = pack.nextIndex++
  pack.packMesh.geometry.maxInstancedCount = index + 1

  setCardFrameAt(pack.packMesh, index, front, back)
  instanced.setScaleAt(pack.packMesh, index, 1, 1, 1)

  return index
}

export function setCardFrameAt(packMesh, index, front, back) {
  const cardFrame = packMesh.geometry.getAttribute("instanceCardFrame")
  cardFrame.setXY(index, front, back)
}

