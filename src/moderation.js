// Global state
var tracker = {},
    limit   = [],
    date     = 0;

// https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string
function extractHostname(url) {
  let hostname;

  //find & remove protocol (http, ftp, etc.) and get hostname
  if (url.indexOf("//") > -1) {
    hostname = url.split('/')[2];
  }
  else {
    hostname = url.split('/')[0];
  }

  //find & remove port number
  hostname = hostname.split(':')[0];
  //find & remove "?"
  hostname = hostname.split('?')[0];

  return hostname;
}

/*
 * Check if the request is directed to a
 * domain limited by the user and if it
 * doesn't have any remaining time.
 */
function redirect(requestDetails) {
  // Update limits
  browser.storage.sync.get(['limit']).then ( (result) => {
    limit = (result.limit==undefined) ? [] : result.limit;
  }, (e)=>console.log(e));

  // Match
  for ( var l of limit ) {
    // TODO: better matching function
    let reqHost = extractHostname ( requestDetails.url );
    if ( reqHost.includes(l.host) && tracker[reqHost] > l.time ) {
      return {
        redirectUrl: browser.extension.getURL("blocked.html")
      };
    }
  }
}

/*
 * Update of one second the time
 * used by each active tab
 */
function updateTimes(tabs) {
  for (let tab of tabs) {
    let host = extractHostname(tab.url);
    tracker[host] = ( tracker[host] == undefined ) ? 0 : tracker[host] + 1;
  }
}

// Get current data
browser.storage.sync.get(['tracker','date','limit']).then( function(result) {
  // Initialize data
  tracker = (result.tracker==undefined) ? {} : result.tracker;
  limit = (result.limit==undefined) ? [] : result.limit;
  date = (result.date==undefined) ? (new Date().getDate()) : result.date;

  // Update status each second
  setInterval ( () => {
    // Restart counter at new date
    let curr_date = new Date().getDate();
    tracker = ( curr_date != date ) ? {} : tracker;
    date = curr_date;
    // Update active tabs timing
    browser.tabs.query({active: true}).then ( updateTimes, (e) => console.log ( e ) );
    // Persistent save data
    browser.storage.sync.set({'tracker':tracker,'date':date});
  }, 1000 );

  // Monitor web requests
  browser.webRequest.onBeforeRequest.addListener(
    redirect,
    {urls: ["<all_urls>"],types:['main_frame']},
    ["blocking"]
  );
}, (e) => console.log ( e ));
