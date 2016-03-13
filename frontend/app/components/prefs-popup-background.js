import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['prefs-popup-bg'],
  closeAction: 'closeModal',

  click: function () {
    this.sendAction('closeAction');
  }
});
