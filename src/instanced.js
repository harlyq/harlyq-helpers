export const calcMatrixWorld = (function() {
  const quaternion = new THREE.Quaternion()
  const position = new THREE.Vector3()
  const scale = new THREE.Vector3()

  return function calcMatrixWorld(instancedMesh, index, outMatrixWorld = new THREE.Matrix4()) {
    getQuaternionAt(instancedMesh, index, quaternion)
    getPositionAt(instancedMesh, index, position)
    getScaleAt(instancedMesh, index, scale)
  
    outMatrixWorld.compose(position, quaternion, scale)
    outMatrixWorld.premultiply(instancedMesh.matrixWorld)
    return outMatrixWorld
  }
})()


export const calcOffsetMatrix = (function() {
  const instancedMatrixWorld = new THREE.Matrix4()

  return function calcOffsetMatrix(base3D, instancedMesh, index, outOffsetMatrix = new THREE.Matrix4()) {
    calcMatrixWorld(instancedMesh, index, instancedMatrixWorld)
    outOffsetMatrix.getInverse(base3D.matrixWorld).multiply(instancedMatrixWorld)
    return outOffsetMatrix
  }
})()


export const applyOffsetMatrix = (function() {
  const invParentMatrix = new THREE.Matrix4()
  const newMatrix = new THREE.Matrix4() 
  const quaternion = new THREE.Quaternion()
  const position = new THREE.Vector3()
  const scale = new THREE.Vector3()
  
  return function applyOffsetMatrix(base3D, instancedMesh, index, offsetMatrix) {
    invParentMatrix.getInverse(instancedMesh.parent.matrixWorld)  
    newMatrix.multiplyMatrices(base3D.matrixWorld, offsetMatrix) // determine new world matrix
    newMatrix.premultiply(invParentMatrix) // convert to a local matrix
    newMatrix.decompose(position, quaternion, scale)

    setPositionAt(instancedMesh, index, position)
    setQuaternionAt(instancedMesh, index, quaternion)
  }
})()


export function createMesh(obj3D, count) {
  const mesh = obj3D ? obj3D.getObjectByProperty("isMesh", true) : undefined
  if (!mesh || !mesh.geometry || !mesh.material) {
    return undefined
  }

  function onBeforeCompile(oldFunction) {
    return function onBeforeCompile(shader) {
      if (oldFunction) {
        oldFunction(shader)
      }

      let vertexShader = shader.vertexShader
      let fragmentShader = shader.fragmentShader
  
      vertexShader = vertexShader.replace('void main()', `
      attribute vec3 instancePosition;
      attribute vec4 instanceQuaternion;
      attribute vec4 instanceColor;
      attribute vec3 instanceScale;
  
      varying vec4 vInstanceColor;
  
      vec3 applyQuaternion( const vec3 v, const vec4 q ) 
      {
        return v + 2. * cross( q.xyz, cross( q.xyz, v ) + q.w * v );
      }
  
      void main()`)
  
      vertexShader = vertexShader.replace('#include <color_vertex>', `
      #include <color_vertex>
      vInstanceColor = instanceColor;`)
  
      vertexShader = vertexShader.replace('#include <begin_vertex>', `
      vec3 transformed = applyQuaternion( position*instanceScale, instanceQuaternion ) + instancePosition;`)
  
      vertexShader = vertexShader.replace('#include <defaultnormal_vertex>', `
      vec3 transformedNormal = normalMatrix * applyQuaternion( objectNormal/instanceScale, -instanceQuaternion );
      
      #ifdef FLIP_SIDED
        transformedNormal = - transformedNormal;
      #endif
  
      #ifdef USE_TANGENT
        vec3 transformedTangent = normalMatrix * applyQuaternion( objectTangent/instanceScale, -instanceQuaternion );
        #ifdef FLIP_SIDED
          transformedTangent = - transformedTangent;
        #endif
      #endif`)
  
      fragmentShader = fragmentShader.replace('#include <color_pars_fragment>', `
      #include <color_pars_fragment>
      varying vec4 vInstanceColor;`)
  
      fragmentShader = fragmentShader.replace('#include <color_fragment>', `
      #include <color_fragment>
      diffuseColor *= vInstanceColor;`)
  
      shader.vertexShader = vertexShader
      shader.fragmentShader = fragmentShader
    }
  }

  const FLOATS_PER_QUATERNION = 4
  const FLOATS_PER_POSITION = 3
  const FLOATS_PER_COLOR = 3
  const FLOATS_PER_SCALE = 3

  const quaternions = new Float32Array(count*FLOATS_PER_QUATERNION)
  const positions = new Float32Array(count*FLOATS_PER_POSITION)
  const scales = new Float32Array(count*FLOATS_PER_SCALE)
  const colors = new Float32Array(count*FLOATS_PER_COLOR).fill(1)

  for (let i = 0; i < count; i++) {
    quaternions[i*FLOATS_PER_QUATERNION + 3] = 1
  }

  const instancePosition = new THREE.InstancedBufferAttribute(positions, FLOATS_PER_POSITION)
  const instanceQuaternion = new THREE.InstancedBufferAttribute(quaternions, FLOATS_PER_QUATERNION)
  const instanceScale = new THREE.InstancedBufferAttribute(scales, FLOATS_PER_SCALE)
  const instanceColor = new THREE.InstancedBufferAttribute(colors, FLOATS_PER_COLOR)

  const instancedGeometry = new THREE.InstancedBufferGeometry().copy(mesh.geometry)
  instancedGeometry.maxInstancedCount = count

  instancedGeometry.setAttribute("instancePosition", instancePosition)
  instancedGeometry.setAttribute("instanceQuaternion", instanceQuaternion)
  instancedGeometry.setAttribute("instanceScale", instanceScale)
  instancedGeometry.setAttribute("instanceColor", instanceColor)

  let instancedMaterial = mesh.material

  // patch shaders
  if (Array.isArray(mesh.material)) {
    instancedMaterial = mesh.material.map(x => x.clone())
    instancedMaterial.forEach(x => x.onBeforeCompile = onBeforeCompile(x.onBeforeCompile))
  } else {
    instancedMaterial = mesh.material.clone()
    instancedMaterial.onBeforeCompile = onBeforeCompile(instancedMaterial.onBeforeCompile)
  }

  const instancedMesh = new THREE.Mesh(instancedGeometry, instancedMaterial)
  instancedMesh.frustumCulled = false

  const raycasterMesh = new THREE.Mesh(instancedGeometry, instancedMaterial)
  const raycasterPos = new THREE.Vector3()
  const raycasterQuat = new THREE.Quaternion()
  const raycasterScale = new THREE.Vector3(1,1,1)
  const raycasterIntersections = []

  instancedMesh.raycast = (raycaster, intersects) => {
    raycasterIntersections.length = 0
  
    for (let i = 0; i < raycasterMesh.geometry.maxInstancedCount; i++) {
      raycasterMesh.matrixWorld.compose( getPositionAt(instancedMesh, i, raycasterPos), getQuaternionAt(instancedMesh, i, raycasterQuat), getScaleAt(instancedMesh, i, raycasterScale) )
      raycasterMesh.matrixWorld.premultiply(instancedMesh.matrixWorld)
      raycasterMesh.raycast( raycaster, raycasterIntersections )
      if (raycasterIntersections.length > 0) {
        raycasterIntersections[0].instanceId = i
        raycasterIntersections[0].object = instancedMesh
        intersects.push( raycasterIntersections[0] )
        raycasterIntersections.length = 0
      }
    }
  }

  return instancedMesh
}


export function setPositionAt(instancedMesh, index, xOrVec3, y, z) {
  const position = instancedMesh.geometry.getAttribute("instancePosition")
  if (typeof xOrVec3 === "object") {
    position.setXYZ(index, xOrVec3.x, xOrVec3.y, xOrVec3.z)
  } else {
    position.setXYZ(index, xOrVec3, y, z)
  }
  position.needsUpdate = true
}


export function getPositionAt(instancedMesh, index, outPosition = new THREE.Vector3()) {
  const position = instancedMesh.geometry.getAttribute("instancePosition")
  outPosition.x = position.getX(index)
  outPosition.y = position.getY(index)
  outPosition.z = position.getZ(index)
  return outPosition
}


export function setQuaternionAt(instancedMesh, index, xOrQuaternion, y, z, w) {
  const quaternion = instancedMesh.geometry.getAttribute("instanceQuaternion")
  if (typeof xOrQuaternion === "object") {
    quaternion.setXYZW(index, xOrQuaternion.x, xOrQuaternion.y, xOrQuaternion.z, xOrQuaternion.w)
  } else {
    quaternion.setXYZW(index, xOrQuaternion, y, z, w)
  }
  quaternion.needsUpdate = true
}


export function getQuaternionAt(instancedMesh, index, outQuaternion = new THREE.Quaternion()) {
  const quaternion = instancedMesh.geometry.getAttribute("instanceQuaternion")
  outQuaternion.x = quaternion.getX(index)
  outQuaternion.y = quaternion.getY(index)
  outQuaternion.z = quaternion.getZ(index)
  outQuaternion.w = quaternion.getW(index)
  return outQuaternion
}


export function setColorAt(instancedMesh, index, rOrColor, g, b) {
  const color = instancedMesh.geometry.getAttribute("instanceColor")
  if (typeof rOrColor === "object") {
    color.setXYZ(index, rOrColor.r, rOrColor.g, rOrColor.b)
  } else {
    color.setXYZ(index, rOrColor, g, b)
  }
  color.needsUpdate = true
}


export function getColorAt(instancedMesh, index, outColor = new THREE.Color()) {
  const color = instancedMesh.geometry.getAttribute("instanceColor")
  outColor.r = color.getX(index)
  outColor.g = color.getY(index)
  outColor.b = color.getZ(index)
  return outColor
}


export function setScaleAt(instancedMesh, index, xOrVec3, y, z) {
  const scale = instancedMesh.geometry.getAttribute("instanceScale")
  if (typeof xOrVec3 === "object") {
    scale.setXYZ(index, xOrVec3.x, xOrVec3.y, xOrVec3.z)
  } else {
    scale.setXYZ(index, xOrVec3, y, z)
  }
  scale.needsUpdate = true
}


export function getScaleAt(instancedMesh, index, outScale = new THREE.Vector3()) {
  const scale = instancedMesh.geometry.getAttribute("instanceScale")
  outScale.x = scale.getX(index)
  outScale.y = scale.getY(index)
  outScale.z = scale.getZ(index)
  return outScale
}
