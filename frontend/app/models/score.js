import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  wpm: DS.attr(),
  accuracy: DS.attr(),
  userId: DS.attr(),
  userName: DS.attr(),
  snippetId: DS.attr(),

  snippet: DS.belongsTo('snippet'),
  user: DS.belongsTo('user')
});
