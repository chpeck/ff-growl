(function() {

const Cc = Components.classes;
const Ci = Components.interfaces;

top.BuzzGrowl = {
  prefs: Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getBranch('extensions.buzzgrowl.'),
  buzz_js: 'http://buzzgrowl.com/embed/buzz.js',
  old_buzz_js: 'http://thingbuzz.com/embed/buzz.js',

  init: function() {
    var appcontent = document.getElementById('appcontent');
    if (appcontent) {
      appcontent.addEventListener('DOMContentLoaded', BuzzGrowl.onPageLoad, true);
    }
    BuzzGrowl.prefs.QueryInterface(Ci.nsIPrefBranch2);
    if (BuzzGrowl.prefs.getPrefType('enabled') == 0) {
      BuzzGrowl.prefs.setBoolPref('enabled', true);
    }
    BuzzGrowl.prefs.setCharPref('currentVersion', BuzzGrowl.getVersion('apps@thingbuzz.com'));
    BuzzGrowl.prefs.addObserver('enabled', BuzzGrowl, false);
    BuzzGrowl.updateIcon();
  },

  getVersion: function(addonID) {
    var extMan = Cc['@mozilla.org/extensions/manager;1'].getService(Ci.nsIExtensionManager);
    var ext = extMan.getItemForID(addonID);
    ext.QueryInterface(Ci.nsIUpdateItem);
    return ext.version;
  },

  observe: function(aSubject, aTopic, aData) {
    if ('nsPref:changed' == aTopic) {
      if (aData == 'enabled') {
        BuzzGrowl.updateIcon();
        BuzzGrowl.updateGrowl();
      }
    }
  },

  updateIcon: function() {
    document.getElementById('status-bar-icon').src = 'chrome://buzzgrowl/content/icon_' + (BuzzGrowl.prefs.getBoolPref('enabled') ? '1' : '0') + '.png';
  },

  toggle: function() {
    BuzzGrowl.prefs.setBoolPref('enabled', !BuzzGrowl.prefs.getBoolPref('enabled'));
  },

  updateGrowl: function() {
    if (BuzzGrowl.prefs.getBoolPref('enabled')) {
      if (BuzzGrowl.hasScript(BuzzGrowl.buzz_js) || BuzzGrowl.hasScript(BuzzGrowl.old_buzz_js)) {
        if (!window.content.document.getElementsByClassName('buzz_growl').length) {
          BuzzGrowl.newGrowl();
        }
      } else {
        BuzzGrowl.injectScript(BuzzGrowl.buzz_js);
      }
    } else {
      var growl_divs = window.content.document.getElementsByClassName('buzz_growl');
      for (var i=0; i<growl_divs.length; i++) {
        growl_divs[i].parentNode.removeChild(growl_divs[i]);
      }
    }
  },

  newGrowl: function() {
    var head = window.content.document.getElementsByTagName('head')[0];
    var growl = window.content.document.createElement('script');
    growl.innerHTML = "new TBZZ.Growl({token: '2313d3858ac9077e1429906d12fd57b1'})";
    head.appendChild(growl);
  },

  hasScript: function(script_url) {
    var script_tags = window.content.document.getElementsByTagName('script');
    for (var i=0; i<script_tags.length; i++) {
      if (script_tags[i].src.indexOf(script_url) == 0) {
        break;
      }
    }
    return (i < script_tags.length);
  },

  injectScript: function(script_url) {
    var head = window.content.document.getElementsByTagName('head')[0];
    var buzz = window.content.document.createElement('script');
    buzz.src = script_url;
    head.appendChild(buzz);
    BuzzGrowl.newGrowl();
  },

  onPageLoad: function(aEvent) {
    var doc = aEvent.originalTarget; // doc is document that triggered "onload" event
    if (doc == window.content.document && doc.location.protocol == 'http:' && !doc.location.hostname.match(/(?:^|\.)(?:facebook|twitter)\.com$/)) {
      if (BuzzGrowl.prefs.getBoolPref('enabled') && !BuzzGrowl.hasScript(BuzzGrowl.buzz_js) && !BuzzGrowl.hasScript(BuzzGrowl.old_buzz_js)) {
        BuzzGrowl.updateGrowl();
      }
    }
  },
}

window.addEventListener("load", BuzzGrowl.init, false);

})();
