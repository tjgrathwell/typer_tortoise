import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  fullText: DS.attr(),
  categoryId: DS.attr(),
  categoryName: DS.attr()
});
