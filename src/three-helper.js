/**
 * @typedef {{x: number, y: number, z: number}} VecXYZ
 * @typedef {{min: VecXYZ, max: VecXYZ}} Extent
 * 
 */

function verifyMaterialNeedsUpdate(material, canvas) {
  for (let map of ["map", "alphaMap", "aoMap", "bumpMap", "displacementMap", "emissiveMap", "envMap", "lighMap", "metalnessMap", "normalMap", "roughnessMap"]) {
    if (material[map] && material[map].image === canvas) {
      material[map].needsUpdate = true
    }
  }
}

function verifyUniformNeedsUpdate(material, canvas) {
  if (material.uniforms && 
      material.uniforms.map && 
      material.uniforms.map.value && 
      typeof material.uniforms.map.value === "object" && 
      material.uniforms.map.value.image === canvas) {
    material.uniforms.map.value.needsUpdate = true
  }
}

/** @type {(rootObject3D: object, canvas: object) => void} */
export function updateMaterialsUsingThisCanvas(rootObject3D, canvas) {
  rootObject3D.traverse((node) => {
    if (node.material) {
      if (Array.isArray(node.material)) {
        for (let mat of node.material) {
          verifyMaterialNeedsUpdate(mat, canvas)
          verifyUniformNeedsUpdate(mat, canvas)
        }
      } else {
        verifyMaterialNeedsUpdate(node.material, canvas)
        verifyUniformNeedsUpdate(node.material, canvas)
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

// adapted from d3-threeD.js
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

 var DEGS_TO_RADS = Math.PI / 180;

 var DIGIT_0 = 48, DIGIT_9 = 57, COMMA = 44, SPACE = 32, PERIOD = 46, MINUS = 45;
 
 export function shapeFromPathString(pathStr) {
     if (pathStr[0] === '"' || pathStr[0] === "'") {
       pathStr = pathStr.substring(1, pathStr.length-1); // get rid of string delimiters
     }
 
 
     var path = new THREE.Shape();
 
     var idx = 1, len = pathStr.length, activeCmd,
     x = 0, y = 0, nx = 0, ny = 0, firstX = null, firstY = null,
     x1 = 0, x2 = 0, y1 = 0, y2 = 0,
     rx = 0, ry = 0, xar = 0, laf = 0, sf = 0, cx, cy;
 
     function eatNum() {
         var sidx, c, isFloat = false, s;
         // eat delims
         while (idx < len) {
             c = pathStr.charCodeAt(idx);
             if (c !== COMMA && c !== SPACE) break;
             idx++;
         }
         if (c === MINUS) sidx = idx++;
         else sidx = idx;
         // eat number
         while (idx < len) {
             c = pathStr.charCodeAt(idx);
             if (DIGIT_0 <= c && c <= DIGIT_9) {
                 idx++;
                 continue;
             }
             else if (c === PERIOD) {
                 idx++;
                 isFloat = true;
                 continue;
             }
 
             s = pathStr.substring(sidx, idx);
             return isFloat ? parseFloat(s) : parseInt(s);
         }
 
         s = pathStr.substring(sidx);
         return isFloat ? parseFloat(s) : parseInt(s);
     }
 
     function nextIsNum() {
         var c;
         // do permanently eat any delims...
         while (idx < len) {
             c = pathStr.charCodeAt(idx);
             if (c !== COMMA && c !== SPACE) break;
             idx++;
         }
         c = pathStr.charCodeAt(idx);
         return (c === MINUS || (DIGIT_0 <= c && c <= DIGIT_9));
     }
 
     var canRepeat;
     activeCmd = pathStr[0];
     while (idx <= len) {
         canRepeat = true;
         switch (activeCmd) {
             // moveto commands, become lineto's if repeated
             case 'M':
                 x = eatNum();
                 y = eatNum();
                 path.moveTo(x, y);
                 activeCmd = 'L';
                 firstX = x;
                 firstY = y;
                 break;
 
             case 'm':
                 x += eatNum();
                 y += eatNum();
                 path.moveTo(x, y);
                 activeCmd = 'l';
                 firstX = x;
                 firstY = y;
                 break;
 
             case 'Z':
             case 'z':
                 canRepeat = false;
                 if (x !== firstX || y !== firstY)
                 path.lineTo(firstX, firstY);
                 break;
 
             // - lines!
             case 'L':
             case 'H':
             case 'V':
                 nx = (activeCmd === 'V') ? x : eatNum();
                 ny = (activeCmd === 'H') ? y : eatNum();
                 path.lineTo(nx, ny);
                 x = nx;
                 y = ny;
                 break;
 
             case 'l':
             case 'h':
             case 'v':
                 nx = (activeCmd === 'v') ? x : (x + eatNum());
                 ny = (activeCmd === 'h') ? y : (y + eatNum());
                 path.lineTo(nx, ny);
                 x = nx;
                 y = ny;
                 break;
 
             // - cubic bezier
             case 'C':
                 x1 = eatNum(); y1 = eatNum();
 
             case 'S':
                 if (activeCmd === 'S') {
                     x1 = 2 * x - x2; y1 = 2 * y - y2;
                 }
                 x2 = eatNum();
                 y2 = eatNum();
                 nx = eatNum();
                 ny = eatNum();
                 path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
                 x = nx; y = ny;
                 break;
 
             case 'c':
                 x1 = x + eatNum();
                 y1 = y + eatNum();
 
             case 's':
                 if (activeCmd === 's') {
                     x1 = 2 * x - x2;
                     y1 = 2 * y - y2;
                 }
                 x2 = x + eatNum();
                 y2 = y + eatNum();
                 nx = x + eatNum();
                 ny = y + eatNum();
                 path.bezierCurveTo(x1, y1, x2, y2, nx, ny);
                 x = nx; y = ny;
                 break;
 
             // - quadratic bezier
             case 'Q':
                 x1 = eatNum(); y1 = eatNum();
 
             case 'T':
                 if (activeCmd === 'T') {
                     x1 = 2 * x - x1;
                     y1 = 2 * y - y1;
                 }
                 nx = eatNum();
                 ny = eatNum();
                 path.quadraticCurveTo(x1, y1, nx, ny);
                 x = nx;
                 y = ny;
                 break;
 
             case 'q':
                 x1 = x + eatNum();
                 y1 = y + eatNum();
 
             case 't':
                 if (activeCmd === 't') {
                     x1 = 2 * x - x1;
                     y1 = 2 * y - y1;
                 }
                 nx = x + eatNum();
                 ny = y + eatNum();
                 path.quadraticCurveTo(x1, y1, nx, ny);
                 x = nx; y = ny;
                 break;
 
             // - elliptical arc
             case 'A':
                 rx = eatNum();
                 ry = eatNum();
                 xar = eatNum() * DEGS_TO_RADS;
                 laf = eatNum();
                 sf = eatNum();
                 nx = eatNum();
                 ny = eatNum();
                 if (rx !== ry) {
                     console.warn("Forcing elliptical arc to be a circular one :(",
                     rx, ry);
                 }
 
                 // SVG implementation notes does all the math for us! woo!
                 // http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
                 // step1, using x1 as x1'
                 x1 = Math.cos(xar) * (x - nx) / 2 + Math.sin(xar) * (y - ny) / 2;
                 y1 = -Math.sin(xar) * (x - nx) / 2 + Math.cos(xar) * (y - ny) / 2;
                 // step 2, using x2 as cx'
                 var norm = Math.sqrt(
                     (rx*rx * ry*ry - rx*rx * y1*y1 - ry*ry * x1*x1) /
                     (rx*rx * y1*y1 + ry*ry * x1*x1));
 
                 if (laf === sf) norm = -norm;
                 x2 = norm * rx * y1 / ry;
                 y2 = norm * -ry * x1 / rx;
                 // step 3
                 cx = Math.cos(xar) * x2 - Math.sin(xar) * y2 + (x + nx) / 2;
                 cy = Math.sin(xar) * x2 + Math.cos(xar) * y2 + (y + ny) / 2;
 
                 var u = new THREE.Vector2(1, 0),
                 v = new THREE.Vector2((x1 - x2) / rx,
                 (y1 - y2) / ry);
                 var startAng = Math.acos(u.dot(v) / u.length() / v.length());
                 if (u.x * v.y - u.y * v.x < 0) startAng = -startAng;
 
                 // we can reuse 'v' from start angle as our 'u' for delta angle
                 u.x = (-x1 - x2) / rx;
                 u.y = (-y1 - y2) / ry;
 
                 var deltaAng = Math.acos(v.dot(u) / v.length() / u.length());
                 // This normalization ends up making our curves fail to triangulate...
                 if (v.x * u.y - v.y * u.x < 0) deltaAng = -deltaAng;
                 if (!sf && deltaAng > 0) deltaAng -= Math.PI * 2;
                 if (sf && deltaAng < 0) deltaAng += Math.PI * 2;
 
                 path.absarc(cx, cy, rx, startAng, startAng + deltaAng, sf);
                 x = nx;
                 y = ny;
                 break;
 
             default:
                 throw new Error("weird path command: " + activeCmd);
         }
 
         // just reissue the command
         if (canRepeat && nextIsNum()) continue;
         activeCmd = pathStr[idx++];
 
     }
 
     return path;
 };
 