import test from "tape"
import * as attribute from "../src/attribute.js"
import * as rgbcolor from "../src/rgbcolor.js"

/**
 * @typedef {{r: number, g: number, b: number}} RGBColor
 */

test("attribute.parsePartAny", (t) => {
  t.deepEquals(attribute.parsePartAny(""), "", "empty")
  t.deepEquals(attribute.parsePartAny("1"), 1, "single number")
  t.deepEquals(attribute.parsePartAny(" 2  3  4"), {x:2, y:3, z:4}, "vector")
  t.deepEquals(attribute.parsePartAny(" 2.5 "), 2.5, "decimal number")
  t.deepEquals(attribute.parsePartAny(" lesser   "), "lesser", "string")
  t.deepEquals(attribute.parsePartAny(" 2,3 ,4 "), "2,3 ,4", "string with numbers")
  t.equals(rgbcolor.toString(/** @type {RGBColor} */(attribute.parsePartAny("red"))), "#ff0000", "named color")
  t.equals(rgbcolor.toString(/** @type {RGBColor} */(attribute.parsePartAny("#123"))), "#112233", "hex color")

  t.end()
})


test("attribute.parseRangeOptionVariable", (t) => {
  t.deepEquals(attribute.parseRangeOptionVariable("1 2 3"), { options: ["1 2 3"]}, "no range or options")
  t.deepEquals(attribute.parseRangeOptionVariable("1 2->3 4 5"), { range: ["1 2","3 4 5"]}, "range")
  t.deepEquals(attribute.parseRangeOptionVariable("a|b|c"), { options: ["a","b","c"]}, "options")
  t.deepEquals(attribute.parseRangeOptionVariable("1 2||3"), { options: ["1 2","","3"]}, "empty option")
  t.deepEquals(attribute.parseRangeOptionVariable("->3"), { range: ["","3"]}, "empty range")
  t.deepEquals(attribute.parseRangeOptionVariable("1->3 | 2.5->6"), { options: ["1->3 "," 2.5->6"]}, "both range and options")
  t.deepEquals(attribute.parseRangeOptionVariable("1->3->-2"), { range: ["1","3"]}, "multiple ranges")

  t.end()
})

test("attribute.parse", (t) => {
  t.deepEquals(attribute.parse(""), { options: [""] }, "empty")
  t.deepEquals(attribute.parse("a"), { options: ["a"] }, "string")
  t.deepEquals(attribute.parse("-1.75"), { options: [-1.75] }, "number")
  t.deepEquals(attribute.parse("1.125 2.5 6"), { options: [{x:1.125, y:2.5, z:6}] }, "vector")
  t.deepEquals(attribute.parse("2.25->-6.75"), { range: [2.25, -6.75] }, "range")
  t.deepEquals(attribute.parse("black->#fff"), { range: [{ r:0,g:0,b:0 }, { r:1,g:1,b:1 }] }, "range of color")
  t.deepEquals(attribute.parse("top->bottom"), { range: ["top", "bottom"] }, "range of string")
  t.deepEquals(attribute.parse("9 -1->0 4 .5"), { range: [{x:9, y:-1}, {x:0, y:4, z:.5}] }, "range of vector")

  t.end()
})

test("attribute.stringify", (t) => {
  t.equals(attribute.stringify(""), "", "empty")
  t.equals(attribute.stringify({ r:1,g:1,b:1 }), "#ffffff", "color")
  t.equals(attribute.stringify({ x:-1,y:.5,z:2 }), "-1 0.5 2", "vecxyz")
  t.equals(attribute.stringify(new Float32Array([1,-2,-.25])), "1,-2,-0.25", "float32array")
  t.equals(attribute.stringify("blah"), "blah", "string")
  t.equals(attribute.stringify(true), "true", "boolean")
  t.equals(attribute.stringify(-10.8), "-10.8", "number")
  t.equals(attribute.stringify([11.7]), "11.7", "vector with one element")
  t.equals(attribute.stringify(["a","b","c"]), "a,b,c", "array of strings")
  t.equals(attribute.stringify({ options: ["a","b","c"] }), "a|b|c", "string options")
  t.equals(attribute.stringify({ range: [10,12.5] }), "10->12.5", "number range")
  t.equals(attribute.stringify({ range: [{ r:0,g:0,b:0 }, { r:1,g:1,b:1 }] }), "#000000->#ffffff", "color range")
  t.equals(attribute.stringify( attribute.parse(".8 -> -6") ), "0.8->-6", "parse number range")
  t.equals(attribute.stringify( attribute.parse("9 -1->0 4 .5") ), "9 -1->0 4 0.5", "parse vector range")
  t.equals(attribute.stringify( attribute.parse("9 -1->0 4 .5 18") ), "9 -1->0 4 0.5 18", "parse vec4 range")
  t.equals(attribute.stringify( attribute.parse("blue||green|red") ), "#0000ff||#008000|#ff0000", "parse color options")
  
  t.end()
})

test("attribute.nestedsplit", (t) => {
  t.deepEquals(attribute.nestedSplit(""), [""], "empty")
  t.deepEquals(attribute.nestedSplit("a,b"), ["a","b"], "two params")
  t.deepEquals(attribute.nestedSplit(" a , b"), [" a "," b"], "two params, with spacing")
  t.deepEquals(attribute.nestedSplit(" a , b,    c"), [" a "," b","    c"], "three params")
  t.deepEquals(attribute.nestedSplit(" a -> b->    c", "->"), [" a "," b","    c"], "-> split")
  t.deepEquals(attribute.nestedSplit(" (a,b,c) -> [d,e]->    {f}", "->"), [" (a,b,c) "," [d,e]","    {f}"], "nesting")
  t.deepEquals(attribute.nestedSplit(" (a,b,c) -> [{d.1,d.2},e]->    {[f.1,(f.2,f.3)]}", "->"), [" (a,b,c) "," [{d.1,d.2},e]","    {[f.1,(f.2,f.3)]}"], "nested nesting")
  
  t.end()
})

test("attribute.randomize", (t) => {
  let testA = true
  let testB = true
  let testC = true
  let testD = true

  for (let i = 0; i < 100; i++) {
    const stringA = attribute.randomize({options: ["a","b","c"]})
    const numberB = attribute.randomize({range: [1,5]})
    const colorC = attribute.randomize({range: [{r:.1,g:.3,b:.5}, {r:.2,g:.4,b:.6}]})
    const vectorD = attribute.randomize({range: [{x:-1,y:5}, {x:2,y:5}]})

    // @ts-ignore
    testA = testA || ["a","b","c"].includes(stringA)
    testB = testB || (numberB >= 1 && numberB < 5)
    // @ts-ignore
    testC = testC || (colorC.r >= .1 && colorC.r < .2 && colorC.g >= .3 && colorC.g < .3 && colorC.b >= .5 && colorC.b < .6 )
    // @ts-ignore
    testD = testD || (vectorD.x >= -1 && vectorD.x < 2 && vectorD.y === 5)
  }

  t.ok(testA, "string")
  t.ok(testB, "one number")
  t.ok(testC, "color")
  t.ok(testC, "array or numbers")
  t.equals(attribute.randomize(undefined), undefined, "undefined")
  t.equals(attribute.randomizeArray(undefined), undefined, "undefined array")
  t.end()
})

test("attribute.parseColor", (t) => {
  t.deepEquals(attribute.parseColor(""), undefined, "empty")
  t.deepEquals(attribute.parseColor("black"), { options: [{r:0,g:0,b:0}] }, "color string")
  t.deepEquals(attribute.parseColor("rgb(100%,100%,100%)"), { options: [{r:1,g:1,b:1}] }, "rgb string")
  t.deepEquals(attribute.parseColor("red->lime"), { range: [{r:1,g:0,b:0}, {r:0,g:1,b:0}] }, "color range")
  t.deepEquals(attribute.parseColor("rgb(255,255,255)|blue|yellow"), { options: [{r:1,g:1,b:1}, {r:0,g:0,b:1}, {r:1,g:1,b:0}] }, "color options")
  t.end()
})

test("attribute.parseColorArray", (t) => {
  t.deepEquals(attribute.parseColorArray(""), [], "empty")
  t.deepEquals(attribute.parseColorArray("black"), [ { options: [{r:0,g:0,b:0}] } ], "one color string")
  t.deepEquals(attribute.parseColorArray("rgb(100%,100%,100%)"), [ { options: [{r:1,g:1,b:1}] } ], "one rgb string")
  t.deepEquals(attribute.parseColorArray("red->lime"), [ { range: [{r:1,g:0,b:0}, {r:0,g:1,b:0}] } ], "one color range")
  t.deepEquals(attribute.parseColorArray("rgb(255,255,255)|blue|yellow"), [ { options: [{r:1,g:1,b:1}, {r:0,g:0,b:1}, {r:1,g:1,b:0}] } ], "one color options")
  t.deepEquals(attribute.parseColorArray("rgb(255,255,255)|blue|yellow, red->lime, rgb(50%,50%,50%)"), [ { options: [{r:1,g:1,b:1}, {r:0,g:0,b:1}, {r:1,g:1,b:0}] }, { range: [{r:1,g:0,b:0}, {r:0,g:1,b:0}] }, { options: [{r:.5,g:.5,b:.5}] } ], "multiple colors")
  t.deepEquals(attribute.parseColorSparseArray(", red->lime, rgb(50%,50%,50%)"), [ undefined, { range: [{r:1,g:0,b:0}, {r:0,g:1,b:0}] }, { options: [{r:.5,g:.5,b:.5}] } ], "multiple colors")
  t.end()
})

test("attribute.parseNumber", (t) => {
  t.deepEquals(attribute.parseNumber(""), undefined, "empty")
  t.deepEquals(attribute.parseNumber("10"), { options: [10] }, "one number")
  t.deepEquals(attribute.parseNumber("-5->23"), { range: [-5, 23] }, "number range")
  t.deepEquals(attribute.parseNumber(".1|-.2|.3"), { options: [.1, -.2, .3] }, "number options")
  t.deepEquals(attribute.parseNumber(".1|-.2|.3", x => -x), { options: [-.1, .2, -.3] }, "number options, negate modifier")
  t.end()
})

test("attribute.parseNumberArray", (t) => {
  t.deepEquals(attribute.parseNumberArray(""), [], "empty")
  t.deepEquals(attribute.parseNumberArray("10"), [ { options: [10] } ], "one number")
  t.deepEquals(attribute.parseNumberArray("-5->23"), [ { range: [-5, 23] } ], "one number range")
  t.deepEquals(attribute.parseNumberArray(".1|-.2|.3"), [ { options: [.1, -.2, .3] } ], "one number options")
  t.deepEquals(attribute.parseNumberArray(".1|-.2|.3, -5->23, 10"), [ { options: [.1, -.2, .3] }, { range: [-5, 23] }, { options: [10] } ], "multiple numbers")
  t.deepEquals(attribute.parseNumberArray(".1|-.2|.3, -5->23, 10", x => 2*x), [ { options: [.2, -.4, .6] }, { range: [-10, 46] }, { options: [20] } ], "multiple numbers, 2x multiplier")
  t.deepEquals(attribute.parseNumberSparseArray(".1|-.2|.3, , 10", x => 2*x), [ { options: [.2, -.4, .6] }, undefined, { options: [20] } ], "sparse, multiple numbers, 2x multiplier")
  t.end()
})

test("attribute.parseVec3", (t) => {
  t.deepEquals(attribute.parseVec3(""), undefined, "empty")
  t.deepEquals(attribute.parseVec3("1 2 3"), { options: [{x:1,y:2,z:3}] }, "one vec3")
  t.deepEquals(attribute.parseVec3("-1 -2 -3->2 4 6"), { range: [{x:-1,y:-2,z:-3}, {x:2,y:4,z:6}] }, "vec3 range")
  t.deepEquals(attribute.parseVec3(".1 .2 .3|-.2 .2 -.2|4 6 9"), { options: [{x:.1,y:.2,z:.3}, {x:-.2,y:.2,z:-.2}, {x:4,y:6,z:9}] }, "vec3 options")
  t.deepEquals(attribute.parseVec3(".1 .5 .25|-.5 .5 -.5|4 6 9", vec => ({x: vec.x*2, y: vec.y*2, z: vec.z*2}) ), { options: [{x:.2,y:1,z:.5}, {x:-1,y:1,z:-1}, {x:8,y:12,z:18}] }, "vec3 options, 2x multiplier")
  t.end()
})

test("attribute.parseVec3array", (t) => {
  t.deepEquals(attribute.parseVec3Array(""), [], "empty")
  t.deepEquals(attribute.parseVec3Array("1 2 3"), [ { options: [{x:1,y:2,z:3}] } ], "one vec3")
  t.deepEquals(attribute.parseVec3Array("-1 -2 -3->2 4 6"), [ { range: [{x:-1,y:-2,z:-3}, {x:2,y:4,z:6}] } ], "vec3 range")
  t.deepEquals(attribute.parseVec3Array(".1 .2 .3|-.2 .2 -.2|4 6 9"), [ { options: [{x:.1,y:.2,z:.3}, {x:-.2,y:.2,z:-.2}, {x:4,y:6,z:9}] } ], "vec3 options")
  t.deepEquals(attribute.parseVec3Array(".1 .2 .3|-.2 .2 -.2|4 6 9, -1 -2 -3->2 4 6, 1 2 3" ), [ { options: [{x:.1,y:.2,z:.3}, {x:-.2,y:.2,z:-.2}, {x:4,y:6,z:9}] }, { range: [{x:-1,y:-2,z:-3}, {x:2,y:4,z:6}] }, { options: [{x:1,y:2,z:3}] } ], "mutiple vec3s")
  t.deepEquals(attribute.parseVec3Array(".1 .2 .3|-.2 .2 -.2|4 6 9, -1 -2 -3->2 4 6, 1 2 3", vec => ({x: -vec.x, y: -vec.y, z: -vec.z}) ), [ { options: [{x:-.1,y:-.2,z:-.3}, {x:.2,y:-.2,z:.2}, {x:-4,y:-6,z:-9}] }, { range: [{x:1,y:2,z:3}, {x:-2,y:-4,z:-6}] }, { options: [{x:-1,y:-2,z:-3}] } ], "mutiple vec3s, negate modifier")
  t.deepEquals(attribute.parseVec3SparseArray(".1 .2 .3|-.2 .2 -.2|4 6 9, -1 -2 -3->2 4 6,", vec => ({x: -vec.x, y: -vec.y, z: -vec.z}) ), [ { options: [{x:-.1,y:-.2,z:-.3}, {x:.2,y:-.2,z:.2}, {x:-4,y:-6,z:-9}] }, { range: [{x:1,y:2,z:3}, {x:-2,y:-4,z:-6}] }, undefined ], "sparse, mutiple vec3s, negate modifier")
  t.end()
})

test("attribute.getMaximum", (t) => {
  t.deepEquals(attribute.getMaximum(attribute.parse("")), undefined, "empty")
  t.deepEquals(attribute.getMaximum(attribute.parse("3")), 3, "single number")
  t.deepEquals(attribute.getMaximum(attribute.parse("-1->4")), 4, "range")
  t.deepEquals(attribute.getMaximum(attribute.parse("-2|.3|6.75")), 6.75, "options")
  t.end()
})

test("attribute.getAverage", (t) => {
  t.deepEquals(attribute.getAverage(attribute.parse("")), undefined, "empty")
  t.deepEquals(attribute.getAverage(attribute.parse("3")), 3, "single number")
  t.deepEquals(attribute.getAverage(attribute.parse("-1->4")), 1.5, "range")
  t.deepEquals(attribute.getAverage(attribute.parse("-2|.5|6.75")), 1.75, "options")
  t.end()
})

test("attribute.substitute", (t) => {
  t.equals(attribute.substitute$("$a.b$", {}), "", "missing variable")
  t.equals(attribute.substitute$("$a$", {a:1}), "1", "simmple number variable")
  t.equals(attribute.substitute$("$a.b$", {a: {b:2}}), "2", "complex number variable")
  t.equals(attribute.substitute$("$a.b$", {a: {b:{x:1,y:2,z:3}}}), "1 2 3", "complex vec3 variable")
  t.equals(attribute.substitute$("$a.b$", {a: {b:"cat"}}), "cat", "complex string variable")
  t.end()
})

test("attribute.eval", (t) => {
  t.deepEquals(attribute.evalVec3("1 2 3"), {x:1, y:2, z:3}, "valid vec3")
  t.deepEquals(attribute.evalVec3("1 2"), undefined, "invalid vec3")
  t.deepEquals(attribute.evalColor("blue"), {r:0, g:0, b:1}, "valid color")
  t.deepEquals(attribute.evalColor("badcolor"), undefined, "invalid color")
  t.deepEquals(attribute.evalNumber("1"), 1, "valid number")
  t.deepEquals(attribute.evalNumber("notANumber"), undefined, "invalid number")
  t.deepEquals(attribute.evalNumberArray(""), [], "empty array")
  t.deepEquals(attribute.evalNumberArray("1,2,3"), [1,2,3], "number array")
  t.deepEquals(attribute.evalSparseNumberArray("1,,3"), [1,undefined,3], "sparse number array")
  t.deepEquals(attribute.evalVec2Array("1 2,2 4,3 6"), [{x:1,y:2}, {x:2,y:4}, {x:3,y:6}], "vec2 array")
  t.deepEquals(attribute.evalSparseVec2Array("1 2,2 4,"), [{x:1,y:2}, {x:2,y:4}, undefined], "sparse vec2 array")
  t.deepEquals(attribute.evalVec2Array("1,2 4,3 6"), undefined, "invalid vec2 array")
  t.deepEquals(attribute.evalNumber("1->2", { randomFn: () => .5 }), 1.5, "number range, return middle")
  t.deepEquals(attribute.evalNumberArray("1->2, 2->3, 3->4", { randomFn: () => .5 }), [1.5, 2.5, 3.5], "number array range, return middle")
  t.deepEquals(attribute.evalColor("black->white", { randomFn: () => 1 }), {r:1, g:1, b:1}, "color range, return end")
  t.deepEquals(attribute.evalString("alpha|bravo|cat", { randomFn: () => 1 }), "cat", "string options, return end")
  t.deepEquals(attribute.evalNumber("1.75", { conversionFn: (x) => x*2 }), 3.5, "number conversion")
  t.deepEquals(attribute.evalNumber("$a$", { variables: {a: 1} }), 1, "simple variable")
  t.deepEquals(attribute.evalNumber("$a$", { variables: {} }), undefined, "missing variable")
  t.deepEquals(attribute.evalNumber("$a.b.c$", { variables: {a: {b: {c: 2}}} }), 2, "complex variable as a number")
  t.deepEquals(attribute.evalString("$a.b.c$", { variables: {a: {b: {c: 2}}} }), "2", "complex variable as a string")
  t.deepEquals(attribute.evalVec2("$a.b.c$", { variables: {a: {b: {c: 2}}} }), undefined, "complex variable as an invalid vec2")
  t.deepEquals(attribute.evalVec2("$a.b.c$", { variables: {a: {b: {c: {x:2, y:3}}}} }), {x:2, y:3}, "complex variable as an valid vec2")
  t.deepEquals(attribute.evalVec2("$a.b.c$", { variables: {a: {b: {c: "3 4"}}} }), {x:3, y:4}, "complex variable as an valid vec2 string")
  t.deepEquals(attribute.evalString("I see $b$ and $a$", { variables: {a: "mouse", b: "cat"} }), "I see cat and mouse", "composite variables")
  t.deepEquals(attribute.evalString("$10 or $20?"), "$10 or $20?", "non-variable $ signs")
  t.end()
})

test("modifier.modifierStack overwrite", (t) => {
  const stacked = attribute.modifierStack(() => -1, attribute.MODIFIER_OVERWRITE)
  
  t.comment("mode = LAST")
  t.deepEquals(stacked.set(0, "test", "attr", 3), 3, "set the value")
  t.deepEquals(stacked.set(0, "test", "attr", 4), 4, "another set from the same source")
  t.deepEquals(stacked.set(1, "test", "attr", 10), 10, "set by a second source")
  t.deepEquals(stacked.unset(1, "test", "attr"), 4, "remove second source")
  t.deepEquals(stacked.set(1, "test", "attr", 10), 10, "re-set second source")
  t.deepEquals(stacked.unset(0, "test", "attr"), 10, "remove first source")
  t.deepEquals(stacked.unset(1, "test", "attr"), -1, "remove second source")
  t.deepEquals(stacked.unset(0, "test", "attr"), undefined, "unset with no sources set")

  t.comment("mode = FIRST")
  t.deepEquals(stacked.set(0, "test", "attr", 3, stacked.FIRST), 3, "set the value")
  t.deepEquals(stacked.set(0, "test", "attr", 4, stacked.FIRST), 4, "another set from the same source")
  t.deepEquals(stacked.set(1, "test", "attr", 10, stacked.FIRST), 4, "set by a second source")
  t.deepEquals(stacked.unset(0, "test", "attr"), 10, "remove first source")
  t.deepEquals(stacked.unset(1, "test", "attr"), -1, "remove second source")
  t.deepEquals(stacked.unset(0, "test", "attr"), undefined, "unset with no sources set")

  t.comment("mode = APPEND")
  t.deepEquals(stacked.set(0, "test", "attr", 3, stacked.APPEND), [-1,3], "set the value")
  t.deepEquals(stacked.set(0, "test", "attr", 4, stacked.APPEND), [-1,4], "another set from the same source")
  t.deepEquals(stacked.set(1, "test", "attr", 10, stacked.APPEND), [-1,4,10], "set by a second source")
  t.deepEquals(stacked.unset(0, "test", "attr"), [-1,10], "remove first source")
  t.deepEquals(stacked.unset(1, "test", "attr"), -1, "remove second source")
  t.deepEquals(stacked.unset(0, "test", "attr"), undefined, "unset with no sources set")

  t.end()
})

test("modifier.modifierStack nested", (t) => {
  const stacked = attribute.modifierStack(() => -1, attribute.MODIFIER_NESTED)
  
  t.comment("mode = LAST")
  t.deepEquals(stacked.set(0, "test", "attr", 3), 3, "set the value")
  t.deepEquals(stacked.set(0, "test", "attr", 4), 4, "another set from the same source")
  t.deepEquals(stacked.set(1, "test", "attr", 10), 10, "set by a second source")
  t.deepEquals(stacked.unset(1, "test", "attr"), 4, "unset second source")
  t.deepEquals(stacked.set(1, "test", "attr", 10), 10, "re-set second source")
  t.deepEquals(stacked.unset(0, "test", "attr"), 10, "unset first source")
  t.deepEquals(stacked.unset(1, "test", "attr"), 3, "unset second source")
  t.deepEquals(stacked.unset(0, "test", "attr"), -1, "unset first source again")
  t.deepEquals(stacked.unset(0, "test", "attr"), undefined, "unset with no sources set")

  t.comment("mode = FIRST")
  t.deepEquals(stacked.set(0, "test", "attr", 3, stacked.FIRST), 3, "set the value")
  t.deepEquals(stacked.set(0, "test", "attr", 4, stacked.FIRST), 3, "another set from the same source")
  t.deepEquals(stacked.set(1, "test", "attr", 10, stacked.FIRST), 3, "set by a second source")
  t.deepEquals(stacked.unset(0, "test", "attr"), 3, "unset first source")
  t.deepEquals(stacked.unset(1, "test", "attr"), 3, "unset second source")
  t.deepEquals(stacked.unset(0, "test", "attr"), -1, "unset first source again")
  t.deepEquals(stacked.unset(0, "test", "attr"), undefined, "unset with no sources set")

  t.comment("mode = APPEND")
  t.deepEquals(stacked.set(0, "test", "attr", 3, stacked.APPEND), [-1,3], "set the value")
  t.deepEquals(stacked.set(0, "test", "attr", 4, stacked.APPEND), [-1,3,4], "another set from the same source")
  t.deepEquals(stacked.set(1, "test", "attr", 10, stacked.APPEND), [-1,3,4,10], "set by a second source")
  t.deepEquals(stacked.unset(0, "test", "attr"), [-1,3,10], "unset first source")
  t.deepEquals(stacked.unset(1, "test", "attr"), [-1,3], "unset second source")
  t.deepEquals(stacked.unset(0, "test", "attr"), -1, "unset the first source again")
  t.deepEquals(stacked.unset(0, "test", "attr"), undefined, "unset with no sources set")

  t.end()
})
