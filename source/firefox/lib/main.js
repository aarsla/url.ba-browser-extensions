var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var pageWorker = require("sdk/page-worker");
var clipboard = require("sdk/clipboard");
var preferences = require('sdk/simple-prefs').prefs;
var notifications = require("sdk/notifications");
var self = require("sdk/self");
var urlikIcon = self.data.url("icon-64.png");
var { Hotkey } = require("sdk/hotkeys");
var { setInterval, clearInterval } = require("sdk/timers");

var button = buttons.ActionButton({
  id: "urlba-shortener",
  label: "url.ba",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onClick: handleClick
});

var showHotKey = Hotkey({
  combo: "accel-f1",
  onPress: function() {
    handleClick();
  }
});


function validateURL(textval) {
  var urlregex = new RegExp("^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
  return urlregex.test(textval);
}

function handleClick(state) {

  // Preferences
  var notify = preferences.notificationPreference;
  var privateLinks = preferences.privatePreference;

  var currentURL = tabs.activeTab.url;

  if (!validateURL(currentURL)) {

    button.badge = "!";
    button.badgeColor = "#B93330";

    var id = setInterval(function() {
      button.badge = null;
      clearInterval(id);
    }, 2000);

    if (notify) {
      notifications.notify({
          title: "URL.BA",
          text: "Sorry, invalid URL!",
          iconURL: urlikIcon
        });
    }
    return;
  };

  var shortenerUrl = "http://url.ba/twitter?url="+currentURL; 

  if (privateLinks) {
    shortenerUrl = shortenerUrl + "&private";
  };

  var getShortenedUrl = "self.port.emit('url', document.body.innerHTML);";

  var worker = pageWorker.Page({
    contentScript: getShortenedUrl,
    contentURL: shortenerUrl,
  });

  worker.port.on("url", function(message) {
    clipboard.set(message);
    button.badge = "Ok";
    button.badgeColor = "#3CB262";

    var id = setInterval(function() {
      button.badge = null;
      clearInterval(id);
    }, 2000);

    
    if (notify) {
      notifications.notify({
        title: "URL.BA - " + message,
        text: "Shortened url is now in your clipboard!",
        iconURL: urlikIcon
      });
    };
  });

}