import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['prefs-popup-bg'],

  click: function () {
    this.get('controller').send('closeModal');
  }
});
