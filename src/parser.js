import * as rgbcolor from "./rgbcolor.js"

// Convert a string "1 2 3" into a type and value {type: "numbers", value: [1,2,3]}
export const parseValue = (function() {
  const toNumber = str => Number(str.trim())

  return function parseValue(str) {
    if (str === "") {
      return {type: "any", value: ""}
    }

    let vec = str.split(" ").filter(x => x !== "").map(toNumber)
    if (!vec.every(isNaN)) {
      return {type: "numbers", value: vec}
    }
  
    let col = parseColor(str.trim())
    if (col) {
      return {type: "color", value: col}
    }
  
    return {type: "string", value: str.trim()}
  }
})()


// Convert a string "1..3" into {range: ["1","3"]}
// Convert a string "1|2|3" into {options: ["1","2","3"]}
export function parseRangeOptions(str) {
  const options = str.split("|")
  if (options.length > 1) {
    return { options }
  }

  const range = str.split("..")
  if (range.length > 1) {
    return { range: [ range[0], range[1] ] } 
  }

  return { options }
}

// remix of https://github.com/mrdoob/three.js/blob/master/src/math/Color.js
export const COLOR_KEYWORDS = { 'aliceblue': 0xF0F8FF, 'antiquewhite': 0xFAEBD7, 'aqua': 0x00FFFF, 'aquamarine': 0x7FFFD4, 'azure': 0xF0FFFF,
	'beige': 0xF5F5DC, 'bisque': 0xFFE4C4, 'black': 0x000000, 'blanchedalmond': 0xFFEBCD, 'blue': 0x0000FF, 'blueviolet': 0x8A2BE2,
	'brown': 0xA52A2A, 'burlywood': 0xDEB887, 'cadetblue': 0x5F9EA0, 'chartreuse': 0x7FFF00, 'chocolate': 0xD2691E, 'coral': 0xFF7F50,
	'cornflowerblue': 0x6495ED, 'cornsilk': 0xFFF8DC, 'crimson': 0xDC143C, 'cyan': 0x00FFFF, 'darkblue': 0x00008B, 'darkcyan': 0x008B8B,
	'darkgoldenrod': 0xB8860B, 'darkgray': 0xA9A9A9, 'darkgreen': 0x006400, 'darkgrey': 0xA9A9A9, 'darkkhaki': 0xBDB76B, 'darkmagenta': 0x8B008B,
	'darkolivegreen': 0x556B2F, 'darkorange': 0xFF8C00, 'darkorchid': 0x9932CC, 'darkred': 0x8B0000, 'darksalmon': 0xE9967A, 'darkseagreen': 0x8FBC8F,
	'darkslateblue': 0x483D8B, 'darkslategray': 0x2F4F4F, 'darkslategrey': 0x2F4F4F, 'darkturquoise': 0x00CED1, 'darkviolet': 0x9400D3,
	'deeppink': 0xFF1493, 'deepskyblue': 0x00BFFF, 'dimgray': 0x696969, 'dimgrey': 0x696969, 'dodgerblue': 0x1E90FF, 'firebrick': 0xB22222,
	'floralwhite': 0xFFFAF0, 'forestgreen': 0x228B22, 'fuchsia': 0xFF00FF, 'gainsboro': 0xDCDCDC, 'ghostwhite': 0xF8F8FF, 'gold': 0xFFD700,
	'goldenrod': 0xDAA520, 'gray': 0x808080, 'green': 0x008000, 'greenyellow': 0xADFF2F, 'grey': 0x808080, 'honeydew': 0xF0FFF0, 'hotpink': 0xFF69B4,
	'indianred': 0xCD5C5C, 'indigo': 0x4B0082, 'ivory': 0xFFFFF0, 'khaki': 0xF0E68C, 'lavender': 0xE6E6FA, 'lavenderblush': 0xFFF0F5, 'lawngreen': 0x7CFC00,
	'lemonchiffon': 0xFFFACD, 'lightblue': 0xADD8E6, 'lightcoral': 0xF08080, 'lightcyan': 0xE0FFFF, 'lightgoldenrodyellow': 0xFAFAD2, 'lightgray': 0xD3D3D3,
	'lightgreen': 0x90EE90, 'lightgrey': 0xD3D3D3, 'lightpink': 0xFFB6C1, 'lightsalmon': 0xFFA07A, 'lightseagreen': 0x20B2AA, 'lightskyblue': 0x87CEFA,
	'lightslategray': 0x778899, 'lightslategrey': 0x778899, 'lightsteelblue': 0xB0C4DE, 'lightyellow': 0xFFFFE0, 'lime': 0x00FF00, 'limegreen': 0x32CD32,
	'linen': 0xFAF0E6, 'magenta': 0xFF00FF, 'maroon': 0x800000, 'mediumaquamarine': 0x66CDAA, 'mediumblue': 0x0000CD, 'mediumorchid': 0xBA55D3,
	'mediumpurple': 0x9370DB, 'mediumseagreen': 0x3CB371, 'mediumslateblue': 0x7B68EE, 'mediumspringgreen': 0x00FA9A, 'mediumturquoise': 0x48D1CC,
	'mediumvioletred': 0xC71585, 'midnightblue': 0x191970, 'mintcream': 0xF5FFFA, 'mistyrose': 0xFFE4E1, 'moccasin': 0xFFE4B5, 'navajowhite': 0xFFDEAD,
	'navy': 0x000080, 'oldlace': 0xFDF5E6, 'olive': 0x808000, 'olivedrab': 0x6B8E23, 'orange': 0xFFA500, 'orangered': 0xFF4500, 'orchid': 0xDA70D6,
	'palegoldenrod': 0xEEE8AA, 'palegreen': 0x98FB98, 'paleturquoise': 0xAFEEEE, 'palevioletred': 0xDB7093, 'papayawhip': 0xFFEFD5, 'peachpuff': 0xFFDAB9,
	'peru': 0xCD853F, 'pink': 0xFFC0CB, 'plum': 0xDDA0DD, 'powderblue': 0xB0E0E6, 'purple': 0x800080, 'rebeccapurple': 0x663399, 'red': 0xFF0000, 'rosybrown': 0xBC8F8F,
	'royalblue': 0x4169E1, 'saddlebrown': 0x8B4513, 'salmon': 0xFA8072, 'sandybrown': 0xF4A460, 'seagreen': 0x2E8B57, 'seashell': 0xFFF5EE,
	'sienna': 0xA0522D, 'silver': 0xC0C0C0, 'skyblue': 0x87CEEB, 'slateblue': 0x6A5ACD, 'slategray': 0x708090, 'slategrey': 0x708090, 'snow': 0xFFFAFA,
	'springgreen': 0x00FF7F, 'steelblue': 0x4682B4, 'tan': 0xD2B48C, 'teal': 0x008080, 'thistle': 0xD8BFD8, 'tomato': 0xFF6347, 'turquoise': 0x40E0D0,
  'violet': 0xEE82EE, 'wheat': 0xF5DEB3, 'white': 0xFFFFFF, 'whitesmoke': 0xF5F5F5, 'yellow': 0xFFFF00, 'yellowgreen': 0x9ACD32 };

const COLOR_REGEX = /^((?:rgb|hsl)a?)\(\s*([^\)]*)\)/

export function parseColor(str) {
  let m;

  if ( m = COLOR_REGEX.exec( str ) ) {

    // rgb / hsl
    let color;
    const name = m[ 1 ];
    const components = m[ 2 ];

    switch ( name ) {

      case 'rgb':
      case 'rgba':

        if ( color = /^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec( components ) ) {

          // rgb(255,0,0) rgba(255,0,0,0.5)
          return {
            r: Math.min( 255, parseInt( color[ 1 ], 10 ) ) / 255,
            g: Math.min( 255, parseInt( color[ 2 ], 10 ) ) / 255,
            b: Math.min( 255, parseInt( color[ 3 ], 10 ) ) / 255,
            a: color[5] ? parseFloat( color[5] ) : undefined,
          }
        }

        if ( color = /^(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec( components ) ) {

          // rgb(100%,0%,0%) rgba(100%,0%,0%,0.5)
          return {
            r: Math.min( 100, parseInt( color[ 1 ], 10 ) ) / 100,
            g: Math.min( 100, parseInt( color[ 2 ], 10 ) ) / 100,
            b: Math.min( 100, parseInt( color[ 3 ], 10 ) ) / 100,
            a: color[5] ? parseFloat( color[5] ) : undefined,
          }
        }
        break;

      case 'hsl':
      case 'hsla':

        if ( color = /^([0-9]*\.?[0-9]+)\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec( components ) ) {

          // hsl(120,50%,50%) hsla(120,50%,50%,0.5)
          const rgba = rgbcolor.setHSL({}, parseFloat( color[ 1 ] )/360, parseInt( color[ 2 ], 10 )/100, parseInt( color[ 3 ], 10 )/100)
          rgba.a = color[5] ? parseFloat( color[5] ) : undefined
          return rgba
        }
        break;

    }

  } else if ( m = /^\#([A-Fa-f0-9]+)$/.exec( str ) ) {

    // hex color
    const hex = m[ 1 ];
    const size = hex.length;

    if ( size === 3 ) {

      // #ff0
      return {
        r: parseInt( hex.charAt( 0 ) + hex.charAt( 0 ), 16 ) / 255,
        g: parseInt( hex.charAt( 1 ) + hex.charAt( 1 ), 16 ) / 255,
        b: parseInt( hex.charAt( 2 ) + hex.charAt( 2 ), 16 ) / 255,
      }

    } else if ( size === 6 ) {

      // #ff0000
      return {
        r: parseInt( hex.charAt( 0 ) + hex.charAt( 1 ), 16 ) / 255,
        g: parseInt( hex.charAt( 2 ) + hex.charAt( 3 ), 16 ) / 255,
        b: parseInt( hex.charAt( 4 ) + hex.charAt( 5 ), 16 ) / 255,
      }
    }
  }

  if ( str && str.length > 0 ) {
    // color keywords
    const hex = COLOR_KEYWORDS[ str ];

    if ( hex !== undefined ) {
      return rgbcolor.setHex({}, hex)
    }
  }
}