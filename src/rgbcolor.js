// remix of https://github.com/mrdoob/three.js/blob/master/src/math/Color.js
import * as utils from "./utils.js"

export function setHex(out, hex) {
  out.r = ( hex >> 16 & 255 )/255
  out.g = ( hex >> 8 & 255 )/255
  out.b = ( hex & 255 )/255
  return out
}

export const setHSL = (function () {
  function hue2rgb( p, q, t ) {
    if ( t < 0 ) t += 1;
    if ( t > 1 ) t -= 1;
    if ( t < 1 / 6 ) return p + ( q - p ) * 6 * t;
    if ( t < 1 / 2 ) return q;
    if ( t < 2 / 3 ) return p + ( q - p ) * 6 * ( 2 / 3 - t );
    return p;
  }

  return function setHSL(out, h, s, l) {
    // h,s,l ranges are in 0.0 - 1.0
    h = utils.euclideanModulo( h, 1 );
    s = utils.clamp( s, 0, 1 );
    l = utils.clamp( l, 0, 1 );

    if ( s === 0 ) {
      out.r = out.g = out.b = l;
    } else {
      let p = l <= 0.5 ? l * ( 1 + s ) : l + s - ( l * s );
      let q = ( 2 * l ) - p;

      out.r = hue2rgb( q, p, h + 1 / 3 );
      out.g = hue2rgb( q, p, h );
      out.b = hue2rgb( q, p, h - 1 / 3 );
    }

    return out;
  }
})()

export function equals(x, y) {
  return x.r === y.r && x.g === y.g && x.b === y.b && x.a === y.a
}

export function toHex(a) {
  return (a.r*255) << 16 ^ (a.g*255) << 8 ^ (a.b*255) << 0
}

export function toString(a) {
  return "#" + toHex(a).toString(16).padStart(6, '0')
}
