 /*
Copy this into a javascript console in a tab to crash it.
var memoryEater = "nom"; while(true) {memoryEater = memoryEater += "nom";}
*/

/*
UPDATE 10/31/18- Ability to post results to New Relic and track # crashes, reloads, etc.
*/

const NEW_RELIC_ACCOUNT_ID = '<account-id>';
const NEW_RELIC_TOKEN = '<token>';


function checkActive(tabs) {

    var tabsLength = tabs.length;

    while (tabsLength--) {
        /*It's in a function to create a closure*/
        (function() {
            var thisTab = tabs[tabsLength];

            //Only check tabs that have finished loading and are http / https
            //This basically lets it ignore tabs like chrome://
            if (( thisTab.url.substring(0, 4) == "http" || thisTab.url.substring(0, 4) == "file" ) && thisTab.status == "complete") {

                //Perform a no-op
                chrome.tabs.executeScript(thisTab.id, {
                    code: "null;"
                }, function(result) {
                    //We will get a callback no matter what (unlike when I first released this)

                    //If it reports it's closed, then it's crashed, because a genuine close fires an event. A crashed tab does not.
                    if (chrome.runtime.lastError && chrome.runtime.lastError.message == "The tab was closed.") {
                        console.log("Crashed: ", thisTab.title, thisTab.id);
                        var m = { eventType: "ChromeStat", crash: "true", pageUrl: thisTab.url, pageTitle: thisTab.title }
                        postToNewRelic(m) //post crash to NR
                        console.log("Reloading: ", thisTab.title, thisTab.id);
                        chrome.tabs.reload(thisTab.id); //reload it
                    }
                });
            }
        }).call();
    }
}

function postToNewRelic(message) {
  var req = new XMLHttpRequest();
  var url = "https://insights-collector.newrelic.com/v1/accounts/" + NEW_RELIC_ACCOUNT_ID + "/events";

  req.open("POST", url, true);
  req.setRequestHeader("Content-Type", "application/json");
  req.setRequestHeader("X-Insert-Key", NEW_RELIC_TOKEN);
  req.send(JSON.stringify(message));
}

/*Check once a minute to make sure tabs are still responding*/
setInterval(function() {
    chrome.tabs.query({}, checkActive)
}, 60000);

//If the tab reloads, post state to New Relic
chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
  if (info.status == "loading" || info.status == "complete") { // 2 status events are fired upon 'onUpdated' - we send both occurrences
    if (info.url === undefined){
      var refresh = { eventType: "ChromeStat", reloadStatus: info.status, pageUrl: tab.url, pageTitle: tab.title };
      postToNewRelic(refresh); //post a refresh event to NR
    }
  }
});
