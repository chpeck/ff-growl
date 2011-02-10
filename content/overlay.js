var buzz_js = 'http://buzzgrowl.com/embed/buzz.js';
var old_buzz_js = 'http://thingbuzz.com/embed/buzz.js';
var prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('extensions.buzzgrowl.');
var extension = {
  init: function() {
    var appcontent = document.getElementById('appcontent');
    if(appcontent) {
      appcontent.addEventListener('DOMContentLoaded', extension.onPageLoad, true);
    }
    prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
    if (prefs.getPrefType('enabled') == 0) {
      prefs.setBoolPref('enabled', true);
    }
    prefs.setCharPref('currentVersion', extension.getVersion('apps@thingbuzz.com'));
    prefs.addObserver('enabled', this, false);
    extension.updateIcon();
  },

  getVersion: function(addonID) {
    var extMan = Components.classes['@mozilla.org/extensions/manager;1'].getService(Components.interfaces.nsIExtensionManager);
    var ext = extMan.getItemForID(addonID);
    ext.QueryInterface(Components.interfaces.nsIUpdateItem);
    return ext.version;
  },

  observe: function(aSubject, aTopic, aData) {
    if ('nsPref:changed' == aTopic) {
      if(aData == 'enabled') {
        extension.updateIcon();
        extension.updateGrowl();
      }
    }
  },

  updateIcon: function() {
    document.getElementById('status-bar-icon').src = 'chrome://buzzgrowl/content/icon_' + (prefs.getBoolPref('enabled') ? '1' : '0') + '.png';
  },

  toggle: function() {
    prefs.setBoolPref('enabled', !prefs.getBoolPref('enabled'));
  },

  updateGrowl: function() {
    if (prefs.getBoolPref('enabled')) {
      extension.showGrowls();
    } else {
      extension.hideGrowls();
    }
  },

  newGrowl: function() {
    var growl = window.content.document.createElement('script');
    growl.innerHTML = "new TBZZ.Growl({token: '2313d3858ac9077e1429906d12fd57b1'})";
    var head = window.content.document.getElementsByTagName('head')[0];
    if (!window.content.document.getElementsByClassName('buzz_growl').length) {
      head.appendChild(growl);
    }
  },

  showGrowls: function() {
    if(window.content.document.location.protocol == 'http:' && !window.content.location.hostname.match(/(?:^|\.)(?:facebook|twitter)\.com$/)) {
      extension.injectScript();
      extension.newGrowl();
    }
  },

  hideGrowls: function() {
    var growl_divs = window.content.document.getElementsByClassName('buzz_growl');
    for (var i=0; i<growl_divs.length; i++) {
      growl_divs[i].parentNode.removeChild(growl_divs[i]);
    }
  },

  hasScript: function(script_url) {
    var script_tags = window.content.document.getElementsByTagName('script');
    for (var i=0; i<script_tags.length; i++) {
      if (script_tags[i].src == script_url) {
        break;
      }
    }
    return (i < script_tags.length);
  },

  injectScript: function() {
    if(!extension.hasScript(buzz_js) && !extension.hasScript(old_buzz_js)) {
      var head = window.content.document.getElementsByTagName('head')[0];
      var buzz = window.content.document.createElement('script');
      buzz.src = buzz_js;
      head.appendChild(buzz);
    }
  },

  onPageLoad: function(aEvent) {
    var doc = aEvent.originalTarget; // doc is document that triggered "onload" event
    if (prefs.getBoolPref('enabled') && doc == window.content.document) {
      extension.updateIcon();
      if (!extension.hasScript(buzz_js) && !extension.hasScript(old_buzz_js)) {
        extension.updateGrowl();
      }
    }
  },
}
window.addEventListener("load", function() { extension.init(); }, false);
