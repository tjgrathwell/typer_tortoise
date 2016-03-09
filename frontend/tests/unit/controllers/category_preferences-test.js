import { moduleFor, module, test } from 'ember-qunit';
import Category from 'frontend/models/category'
import Storage from 'frontend/storage'

const categories_json = [
  {id: 1, name: 'melodramatically-din',   enabled: false},
  {id: 2, name: 'warrant-individualists', enabled: true},
  {id: 3, name: 'overlaid-arachnids',     enabled: true}
];

const storage_key_name = 'typer_tortoise.category_ids';

moduleFor('controller:category_preferences', 'Controller | category preferences', {
  unit: true,
  needs: ['router:main'] // TODO: maybe remove in later ember
});

test('can return a list of just the enabled categories', function (assert) {
  var catController = this.subject();
  catController.set('model', $.map(categories_json, function (el) {
    return Category.create(el);
  }));
  assert.deepEqual(catController.enabledCategoryIds(), [2, 3]);
});

test('can to toggle categories on and off', function (assert) {
  var catController = this.subject();
  catController.set('model', $.map(categories_json, function (el) {
    return Category.create(el);
  }));
  catController.setCategory(2, false);
  assert.deepEqual(catController.enabledCategoryIds(), [3]);
});

test('raises errors when you try to toggle a category it does not know', function (assert) {
  var catController = this.subject();
  catController.set('model', $.map(categories_json, function (el) {
    return Category.create(el);
  }));
  assert.throws(function () {
    catController.setCategory(4, false);
  }, /Couldn't find an object with id 4/);
});

test('for an unauthed user, loads the selected categories from localstorage if available', function (assert) {
  Storage.clear();

  var catController = this.subject();

  var categoriesPromise = new Ember.RSVP.Promise(function (resolve, reject) {
    resolve(categories_json);
  });

  sinon.stub(catController, '_loadCategoriesFromServer', function () {
    return categoriesPromise;
  });

  assert.deepEqual(catController.enabledCategoryIds(), []);

  Storage.set(storage_key_name, '1,3');

  return catController.loadCategories().then(function () {
    assert.deepEqual(catController.enabledCategoryIds(), [1,3]);
  });
});

test('for an unauthed user, saves the selected categories into localstorage as csv', function (assert) {
  Storage.clear();

  var catController = this.subject();

  catController.set('model', $.map(categories_json, function (el) {
    return Category.create(el);
  }));

  catController.saveCategories(function () {});

  assert.equal(Storage.get(storage_key_name), '2,3');
});

test('for an unauthed user, optimistically creates category objects from localStorage on init', function (assert) {
  Storage.clear();

  Storage.set(storage_key_name, '35,93');

  var catController = this.subject();
  assert.deepEqual(catController.enabledCategoryIds(), [35, 93]);
});
