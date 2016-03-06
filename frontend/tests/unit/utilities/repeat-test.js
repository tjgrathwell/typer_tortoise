import { test } from 'ember-qunit';
import Utilities from 'frontend/util'

test("calls a function (first arg) some number (second arg) of times", function (assert) {
  var counter = 1;
  Utilities.repeat(function () { counter++ }, 5);

  assert.equal(counter, 1 + 5);
});

test("takes 'this' as an optional third argument", function (assert) {
  var obj = {counter: 3};
  Utilities.repeat(function () { this.counter++ }, 4, obj);

  assert.equal(obj.counter, 3 + 4);
});
