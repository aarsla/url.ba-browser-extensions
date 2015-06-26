// Preferences
var privateLinks;
var notify;

chrome.storage.sync.get({
  privatePreference: false,
  notificationPreference: false
}, function(items) {
  privateLinks = items.privatePreference;
  notify = items.notificationPreference;
});

function resetBadge() {
  chrome.browserAction.setBadgeText({text: ""});
  chrome.browserAction.setBadgeBackgroundColor({color: "#CCCCCC"});
};

function copyToClipboard( text ){
  var copyDiv = document.createElement('div');
  copyDiv.contentEditable = true;
  document.body.appendChild(copyDiv);
  copyDiv.innerHTML = text;
  copyDiv.unselectable = "off";
  copyDiv.focus();
  document.execCommand('SelectAll');
  document.execCommand("Copy", false, null);
  document.body.removeChild(copyDiv);
}

function validateURL(textval) {
  var urlregex = new RegExp("^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
  return urlregex.test(textval);
}

var Notification=(function(){
  var notification=null;
      
  return {
    display:function(opt){
      notification=chrome.notifications.create(opt);
    },
    hide:function(){
      notification.close();
    }};
})();

chrome.browserAction.onClicked.addListener(function(tab) {

  var currentURL = tab.url;

  if (!validateURL(currentURL)) {

    chrome.browserAction.setBadgeText({text: "!"});
    chrome.browserAction.setBadgeBackgroundColor({color: "#B93330"});
    setTimeout(resetBadge, 2000);

    if (notify) {
      var opt = {
            type: "basic",
            title: "URL.BA",
            message: "Sorry, invalid URL!",
            iconUrl: "icon-64.png"
        };

        Notification.display(opt);
    };

    return;
  };

  var shortenerUrl = "http://url.ba/twitter?url="+currentURL;
  if (privateLinks) {
    shortenerUrl = shortenerUrl + "&private";
  };

  var xhr = new XMLHttpRequest();
  xhr.open('GET', shortenerUrl, true);
  xhr.responseType = 'text';
  xhr.onload = function(e) {
    var shortUrl = this.response;
    copyToClipboard(shortUrl);

    chrome.browserAction.setBadgeText({text: "Ok"});
    chrome.browserAction.setBadgeBackgroundColor({color: "#3CB262"});
    setTimeout(resetBadge, 2000);

    if (notify) {
      var opt = {
            type: "basic",
            title: "URL.BA - " + shortUrl,
            message: "Shortened url is now in your clipboard!",
            iconUrl: "icon-64.png"
        };

        Notification.display(opt);
      };
    };

  xhr.send();
});