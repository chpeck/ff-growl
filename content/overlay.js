var buzz_js = 'http://thingbuzz.com/embed/buzz.js';
var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch).getBranch('extensions.buzzgrowl.');
var extension = {
  init: function() {
    var appcontent = document.getElementById("appcontent");   // browser
    if(appcontent) {
      appcontent.addEventListener("DOMContentLoaded", extension.onPageLoad, true);
    }
    try {
      prefs.getBoolPref('enabled');
    } catch (err) {
      alert('set to true ' );
      prefs.setBoolPref('enabled', true)
    }
    
    extension.updateIcon();
    extension.updateGrowl();
  },
  
  enabled: function() {
    return prefs.getBoolPref('enabled');
  },

  updateIcon: function() {
    document.getElementById('status-bar-icon').src = 'chrome://buzzgrowl/content/icon_' + (extension.enabled() ? '1' : '0') + '.png';
  },
  
  toggle: function() {
    prefs.setBoolPref('enabled', !extension.enabled());
    extension.updateIcon();
    extension.updateGrowl();
  },
  
  updateGrowl: function() {
    if (extension.enabled()) {
      extension.showGrowls();
    } else {
      extension.hideGrowls();
    }
  },
  
  showGrowls: function() {
    if(window.content.document.location.protocol == 'http:' && !window.content.location.hostname.match(/(?:^|\.)(?:facebook|twitter)\.com$/)) {
      extension.injectScript();
      var head = window.content.document.getElementsByTagName('head')[0];
      var growl = window.content.document.createElement('script');
      growl.innerHTML = "new TBZZ.Growl({token: '2313d3858ac9077e1429906d12fd57b1'})";
      head.appendChild(growl);
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
    if(!extension.hasScript(buzz_js)) {
      var head = window.content.document.getElementsByTagName('head')[0];
      var buzz = window.content.document.createElement('script');
      buzz.src = buzz_js;
      head.appendChild(buzz);
    }
  },

  onPageLoad: function(aEvent) {
    var doc = aEvent.originalTarget; // doc is document that triggered "onload" event
    if (extension.enabled() && doc == window.content.document) {
      extension.updateGrowl();
    }
  },
  
  onPageUnload: function(aEvent) {
    // do something
  }
}
window.addEventListener("load", function() { extension.init(); }, false);
