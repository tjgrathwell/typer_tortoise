import Ember from 'ember';
import DS from 'ember-data';

export default DS.JSONAPIAdapter.extend({
  urlForQueryRecord (options, modelName) {
    if (options.random) {
      return '/' + Ember.String.pluralize(modelName) + '/random';
    }

    return this._super(...arguments);
  },

  queryRecord (store, type, query) {
    var url = this.buildURL(type.modelName, null, null, 'queryRecord', query);
    delete query.random;
    return this.ajax(url, 'GET', {data: query});
  }
});
