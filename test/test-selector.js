import test from "tape"
import * as selector from "../src/selector.js"

test("selector.parse", (t) => {
  t.deepEquals(selector.parse(""), {type: "", id: "", classes: [], attrs: {}}, "empty")
  t.deepEquals(selector.parse("xyz"), {type: "xyz", id: "", classes: [], attrs: {}}, "type")
  t.deepEquals(selector.parse("#xyz"), {type: "", id: "xyz", classes: [], attrs: {}}, "id")
  t.deepEquals(selector.parse(".xyz"), {type: "", id: "", classes: ["xyz"], attrs: {}}, "class")
  t.deepEquals(selector.parse("[xyz=1]"), {type: "", id: "", classes: [], attrs: {"xyz": "1"}}, "attributes")
  t.deepEquals(selector.parse("type.class#id[attr=value]"), {type: "type", id: "id", classes: ["class"], attrs: {attr: "value"}}, "everything")
  t.deepEquals(selector.parse(".class#id[]"), {type: "", id: "id", classes: ["class"], attrs: {}}, "class and id")
  t.deepEquals(selector.parse(".class1#id.class2"), {type: "", id: "id", classes: ["class1", "class2"], attrs: {}}, "multiple classes")
  t.deepEquals(selector.parse("[foo=bar][one.two=three.four]"), {type: "", id: "", classes: [], attrs: {"foo": "bar", "one.two": "three.four"}}, "multiple attributes, and dot notation")
  t.deepEquals(selector.parse("xyz[foo=bar]#abc"), {type: "xyz", id: "abc", classes: [], attrs: {"foo": "bar"}}, "id at the end")

  t.end()
})