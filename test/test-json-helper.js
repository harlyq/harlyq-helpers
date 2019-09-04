import test from "tape"
import * as jsonHelper from "../src/json-helper.js"

test("jsonHelper.deepEquals", (t) => {
  t.ok(jsonHelper.deepEquals({}, {}), "emptry objects")
  t.ok(jsonHelper.deepEquals([], new Float32Array()), "empty arrays")
  t.ok(jsonHelper.deepEquals(1, 1), "numbers")
  t.notOk(jsonHelper.deepEquals([1], [1,2]), "different size arrays")
  t.notOk(jsonHelper.deepEquals([1,2], [1]), "different size arrays II")
  t.notOk(jsonHelper.deepEquals({x:1}, {y:2,x:1}), "different size objects")
  t.notOk(jsonHelper.deepEquals({x:1,y:2}, {y:2}), "different size objects II")
  t.notOk(jsonHelper.deepEquals("a", "b"), "different strings")
  t.ok(jsonHelper.deepEquals(new Float32Array(3).fill(6), [6,6,6]), "float array vs array, same content")
  t.end()
})


test("jsonHelper.getWithPath", (t) => {
  t.equals(jsonHelper.getWithPath({a: 1, b: {c: {x: "hello"}, d: 3}}, ["b","c","x"]), "hello", "valid leaf")
  t.equals(jsonHelper.getWithPath({a: 1, b: {c: {x: "hello"}, d: 3}}, ["b","c","y"]), undefined, "invalid leaf")
  t.equals(jsonHelper.getWithPath({a: 1, b: {c: {x: "hello"}, d: 3}}, ["a"]), 1, "valid first level")
  t.equals(jsonHelper.getWithPath({a: 1, b: {c: {x: "hello"}, d: 3}}, ["b","w"]), undefined, "invalid branch")
  t.equals(jsonHelper.getWithPath(undefined, undefined), undefined, "undefined")
  t.end()
})

test("jsonHelper.deepCopy", (t) => {
  t.deepEquals(jsonHelper.deepCopy(""), "", "empty string")
  t.deepEquals(jsonHelper.deepCopy(1), 1, "number")
  t.deepEquals(jsonHelper.deepCopy([]), [], "empty array")
  t.deepEquals(jsonHelper.deepCopy({}), {}, "empty object")
  t.deepEquals(jsonHelper.deepCopy({a:1, b:"hello", c:undefined}), {a:1, b:"hello", c:undefined}, "object")
  t.deepEquals(jsonHelper.deepCopy([1,"help",false]), [1,"help",false], "array")
  t.deepEquals(jsonHelper.deepCopy({x: [1,"help",false], y: 2}), {x: [1,"help",false], y: 2}, "object with array")
  t.end()
})

test("jsonHelper.query", (t) => {
  t.deepEquals(jsonHelper.query(undefined, () => (t.fail('undefined should never query'), false), () => t.fail('undefined should never output')), undefined, 'undefined')
  t.deepEquals(jsonHelper.query(null, () => (t.fail('null should never query'), false), () => t.fail('null should never output')), undefined, 'null')
  t.deepEquals(jsonHelper.query([], () => false, () => t.fail('empty array should never output')), undefined, 'empty array')
  t.deepEquals(jsonHelper.query({}, () => false, () => t.fail('empty object should never output')), undefined, 'empty object')
  t.deepEquals(jsonHelper.query( [{a:1},{a:2},{a:3}] , q => q.a >= 2), {a:2}, 'array of simple objects')
  t.deepEquals(jsonHelper.query( [{a:1},{a:2},{a:3}] , q => q.a >= 2, d => d.a), 2, 'array of simple objects, with feature extraction')
  t.deepEquals(jsonHelper.query( {u: [0], x: {b:1, c:1}, y: {c:3} } , q => 'b' in q), {b:1, c:1}, 'nested objects, check for property')
  t.deepEquals(jsonHelper.query( {u: [0], x: [{b:1, c:1}, {b:2, c:2}], y: {b:3, c:3} } , q => 'b' in q), {b:1, c:1}, 'multiple nested objects, check for property')
  t.deepEquals(jsonHelper.query( [ [1,2,3], [4,5,6,7], [8,9,10], [11] ] , q => q.length === 3), [1,2,3], 'nested arrays, check length')
  t.end()
})

test("jsonHelper.queryAll", (t) => {
  t.deepEquals(jsonHelper.queryAll(undefined, () => (t.fail('undefined should never query'), false), () => t.fail('undefined should never output')), [], 'undefined')
  t.deepEquals(jsonHelper.queryAll(null, () => (t.fail('null should never query'), false), () => t.fail('null should never output')), [], 'null')
  t.deepEquals(jsonHelper.queryAll([], () => false, () => t.fail('empty array should never output')), [], 'empty array')
  t.deepEquals(jsonHelper.queryAll({}, () => false, () => t.fail('empty object should never output')), [], 'empty object')
  t.deepEquals(jsonHelper.queryAll( [{a:1},{a:2},{a:3}] , q => q.a >= 2), [{a:2}, {a:3}], 'array of simple objects')
  t.deepEquals(jsonHelper.queryAll( [{a:1},{a:2},{a:3}] , q => q.a >= 2, d => d.a), [2,3], 'array of simple objects, with feature extraction')
  t.deepEquals(jsonHelper.queryAll( {x: {b:1, c:1}, y: {c:3} } , q => 'b' in q), [{b:1, c:1}], 'nested objects, check for property')
  t.deepEquals(jsonHelper.queryAll( {x: [{b:1, c:1}, {b:2, c:2}], y: {b:3, c:3} } , q => 'b' in q), [{b:1, c:1}, {b:2, c:2}, {b:3, c:3}], 'multiple nested objects, check for property')
  t.deepEquals(jsonHelper.queryAll( [ [1,2,3], [4,5,6,7], [8,9,10], [11] ] , q => q.length === 3), [ [1,2,3], [8,9,10] ], 'nested arrays, check length')
  t.deepEquals(jsonHelper.queryAll( [ [1,2,3], [4,5,6,7], [8,9,10], [11] ] , q => q.length === 5), [], 'nested arrays, check length, no matches')
  t.end()
})

test("jsonHelper.countAll", (t) => {
  t.deepEquals(jsonHelper.countAll( undefined, () => (t.fail('undefined should never query'), false) ), 0, 'undefined')
  t.deepEquals(jsonHelper.countAll( null, () => (t.fail('null should never query'), false) ), 0, 'null')
  t.deepEquals(jsonHelper.countAll( [], () => false ), 0, 'empty array')
  t.deepEquals(jsonHelper.countAll( {}, () => false ), 0, 'empty object')
  t.deepEquals(jsonHelper.countAll( [{a:1},{a:2},{a:3}] , q => q.a >= 2), 2, 'array of simple objects')
  t.deepEquals(jsonHelper.countAll( {x: {b:1, c:1}, y: {c:3} } , q => 'b' in q), 1, 'nested objects, check for property')
  t.deepEquals(jsonHelper.countAll( {x: [{b:1, c:1}, {b:2, c:2}], y: {b:3, c:3} } , q => 'b' in q), 3, 'multiple nested objects, check for property')
  t.deepEquals(jsonHelper.countAll( [ [1,2,3], [4,5,6,7], [8,9,10], [11] ] , q => q.length === 3), 2, 'nested arrays, check length')
  t.deepEquals(jsonHelper.countAll( [ [1,2,3], [4,5,6,7], [8,9,10], [11] ] , q => q.length === 5), 0, 'nested arrays, check length, no matches')
  t.end()
})

