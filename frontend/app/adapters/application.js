import Ember from 'ember';
import DS from 'ember-data';

export default DS.JSONAPIAdapter.extend({
  urlForQueryRecord (options, modelName) {
    if (options.random) {
      // TODO: this still leaves 'random: true' in the url :|
      return '/' + Ember.String.pluralize(modelName) + '/random';
    }

    return this._super(...arguments);
  }
});
