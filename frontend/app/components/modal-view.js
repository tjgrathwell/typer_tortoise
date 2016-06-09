import Ember from 'ember';

export default Ember.Component.extend({
  closeAction: 'closeModal',

  actions: {
    backgroundClicked: function () {
      this.sendAction('closeAction');
    }
  }
});
