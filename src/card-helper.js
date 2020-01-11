import * as instanced from "./instanced.js"

export function createCardMesh(width, height, texture) {
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

  const cardMaterial = new THREE.MeshStandardMaterial({ map: texture })
  const cardGeo = new THREE.BufferGeometry()
  cardGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  cardGeo.setAttribute("normal", new THREE.BufferAttribute(normals, 3))
  cardGeo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2))
  cardGeo.setIndex(indices)

  return new THREE.Mesh(cardGeo, cardMaterial)
}

export function createPack(numCards, texture, textureRows, textureCols, width, height) {
  const cardObj3D = createCardMesh(width, height, texture)
  const packInstancedMesh = instanced.createMesh(cardObj3D, numCards)

  packInstancedMesh.geometry.setAttribute( "instanceCardFrame", new THREE.InstancedBufferAttribute (new Float32Array(numCards*2), 2 ) )

  packInstancedMesh.material.onBeforeCompile = (function(oldBeforeCompile) {
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
  })(packInstancedMesh.material.onBeforeCompile)

  packInstancedMesh.material.needsUpdate = true

  return {
    packInstancedMesh,
    nextIndex: 0,
    numCards,
  }
}

export function createCard(pack, front, back) {
  const index = pack.nextIndex++
  pack.packInstancedMesh.geometry.maxInstancedCount = index + 1

  setCardFrameAt(pack.packInstancedMesh, index, front, back)
  instanced.setScaleAt(pack.packInstancedMesh, index, 1, 1, 1)

  return index
}

export function setCardFrameAt(instancedMesh, index, front, back) {
  const cardFrame = instancedMesh.geometry.getAttribute("instanceCardFrame")
  cardFrame.setXY(index, front, back)
}

