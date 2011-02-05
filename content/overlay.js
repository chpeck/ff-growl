window.addEventListener("load", function() { myExtension.init(); }, false);
var buzz_js = 'http://thingbuzz.com/embed/buzz.js';
var myExtension = {
  init: function() {
    var appcontent = document.getElementById("appcontent");   // browser
    if(appcontent) {
      appcontent.addEventListener("DOMContentLoaded", myExtension.onPageLoad, true);
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
     var head = window.content.document.getElementsByTagName('head')[0];
     var buzz = window.content.document.createElement('script');
     buzz.src = buzz_js;
     head.appendChild(buzz);

     var growl = window.content.document.createElement('script');
     growl.innerHTML = "new TBZZ.Growl({token: '2313d3858ac9077e1429906d12fd57b1'})";
     head.appendChild(growl);
  },

  onPageLoad: function(aEvent) {
    var doc = aEvent.originalTarget; // doc is document that triggered "onload" event
    if(doc == window.content.document) {
      if (doc.location.protocol == 'http:') {
        if (!myExtension.hasScript(buzz_js)) {
          myExtension.injectScript();
        }
      }
    }
  },
  
  onPageUnload: function(aEvent) {
    // do something
  }
}