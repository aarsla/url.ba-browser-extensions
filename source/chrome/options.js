document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('saveButton').addEventListener('click', saveOptions);

function saveOptions() {
	var privacy = document.getElementById("privatePreference").checked;
	var notify = document.getElementById("notificationPreference").checked;

	chrome.storage.sync.set({
    	privatePreference: privacy,
    	notificationPreference: notify
	}, function() {
	  	// Update status to let user know options were saved.
	  	var status = document.getElementById('status');
	  	status.textContent = 'Options saved.';
	  	setTimeout(function() {
	    	status.textContent = '';
	  	}, 750);
	});
}

function restoreOptions() {
  chrome.storage.sync.get({
    privatePreference: false,
    notificationPreference: false
  }, function(items) {
    document.getElementById('privatePreference').checked = items.privatePreference;
    document.getElementById('notificationPreference').checked = items.notificationPreference;
  });
}

function resetOptions() {
	localStorage.removeItem("privatePreference");
	localStorage.removeItem("notificationPreference");
	location.reload();
}