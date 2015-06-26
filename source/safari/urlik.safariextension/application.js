safari.application.addEventListener("message", responseReceived, false);
safari.extension.settings.addEventListener("change", prefsChanged, false);
safari.application.addEventListener("command", performCommand, false);
//safari.application.addEventListener("popover", popoverHandler, true);

/* extension button */
var button;
safari.extension.toolbarItems.forEach(function(item) {
	if (item.identifier == 'mainButton') {
    	button = item;
    }
});
/*
function popoverHandler() {
	console.log("popover handler");
}
*/
/* Prefs */
var privatePreference = safari.extension.settings.privatePreference;
var notificationPreference = safari.extension.settings.notificationPreference;

function responseReceived(messageEvent) {
      console.log('response received: ' + messageEvent.message);
      if(messageEvent.name === "shortUrlResult") {
        var shortenedUrl = messageEvent.message;
        console.log('got response: ' + shortenedUrl);
    }
}

function prefsChanged(event) {
    if (event.key == "privatePreference") {
        privatePreference = event.privatePreference;
    }
    if (event.key == "notificationPreference") {
        notificationPreference = event.notificationPreference;
    }
}

function validateURL(textval) {
  var urlregex = new RegExp("^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
  return urlregex.test(textval);
}

function resetBadge() {
  button.badge = 0;
};

var notify = function (title, options) {
    if (!'Notification' in window) {
        return;
    }
    //console.log(Notification.permission);

    if (Notification.permission === 'default') {
        Notification.requestPermission(function () {
            // ...callback this function once a permission level has been set.
            notify(title, options);
        });
    }
    else if (Notification.permission === 'granted') {
        var n = new Notification(
                    title,
                    {
                      'body': options.body ? options.body : title,
                      'tag' : title
                    }
                );
        n.onclick = function () {
            this.close();
        };
        n.onclose = function () {
        	button.badge = 0;
        };
    }
    else if (Notification.permission === 'denied') {
        return;
    }
};

function performCommand(event) {
    if (event.command == "shortenUrl") {

		var currentURL = safari.application.activeBrowserWindow.activeTab.url;

		if (typeof currentURL === 'undefined') {
			//console.log('not defined');
			return;
		}

		if (!validateURL(currentURL)) {
		 	//console.log('invalid url');
		 	return;
		}

		if (privatePreference) {
		  currentURL = currentURL + "&private";
		};

		var shortenerUrl = "http://url.ba/twitter?url="+encodeURIComponent(currentURL); 

		var xhr = new XMLHttpRequest();
		xhr.open('GET', shortenerUrl, true);
		xhr.responseType = 'text';
		xhr.onload = function(e) {
		  var shortlink = this.response;
		  var popover = safari.extension.popovers[0];

		  popover.contentWindow.displayMessage(shortlink, 'shortlink');
		  button.popover = popover;
		  button.showPopover(popover);
		  button.badge = 1;

		  if (notificationPreference) {
			  notify('URL.BA - ' + shortlink, 
			  	{ body: 'Shortened url is now in your clipboard!',
			  	  tag: shortlink
			  	});
		  } else {
		  	setTimeout(resetBadge, 2000);
		  };
		};

		xhr.send();
    }
}