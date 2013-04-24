var App = Em.Application.create();

App.models = {};
App.controllers = {};
App.views = {};

//
//  jQuery addons
//

jQuery.fn.centerOnParent = function () {
  var parent = this.parent();
  var parent_offset = parent.offset();
  this.css({
    top:  parent_offset.top  + ((parent.height() / 2) - (this.height() / 2)),
    left: parent_offset.left + ((parent.width()  / 2) - (this.width()  / 2))
  });
  return this;
};

//
//  currently logged in user
//

App.user = null;

//
//  history handling
//

App.history = Em.Object.create({
  pageToken:    function ()      { return window.location.pathname; },
  setPageToken: function (token) { return history.pushState({}, '', token); }
});

//
//  key handling
//

// some reference for character codes:
//   var chr_from_int = String.fromCharCode(34);
//   var int_from_chr = '"'.charCodeAt(0)

App.KEY_BACKSPACE     = 8;
App.KEY_TAB           = 9;
App.KEY_RETURN        = 13;
App.KEY_SINGLE_QUOTE  = 39;
App.KEY_FORWARD_SLASH = 47;

App.notAKeypress = function (e) {
  // Pressing 'ctrl-t' to open a new tab still sends that 't'
  //   to the typing area before the new tab opens, meaning
  //   you can unintentionally start 'typing' when you're
  //   really going away to do something else.
  // Don't accept any keystrokes with modifiers to avoid
  //   all these sort of problems.
  if (e.ctrlKey || e.altKey || e.metaKey) { return true; }

  if (e.which == App.KEY_BACKSPACE) { return true; }
  // tab in keypress shows as 0
  if (e.which == 0)                 { return true; }
  return false;
};

App.setPreventDefaultForKey = function (e) {
  // in firefox delete/backspace goes back a page. undesirable!
  if (e.which == App.KEY_BACKSPACE)       { e.preventDefault();   }

  // in firefox, single quote and forward slash do a "quick search"
  if (e.which == App.KEY_SINGLE_QUOTE)    { e.preventDefault();   }
  if (e.which == App.KEY_FORWARD_SLASH)   { e.preventDefault();   }

  // tab shouldn't take us out of the typing window
  if (e.which == App.KEY_TAB)             { e.preventDefault();   }
};
