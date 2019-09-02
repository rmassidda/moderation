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

function logTabs(tabs) {
  for (let tab of tabs) {
    let host = extractHostname(tab.url);
    tracker[host] = ( tracker[host] == undefined ) ? 0 : tracker[host] + 1;
  }
  // console.log ( tracker );
}

// Load data
browser.storage.sync.get(['tracker','day']).then( function(result) {
  tracker = (result.tracker==undefined) ? {} : result.tracker;
  day = (result.day==undefined) ? (new Date().getDate()) : result.day;
}, (e) => console.log ( e ));

// TODO: limit settings
limit = [
  {host:"stackoverflow.com",time:10},
  {host:"duckduckgo.com",time:80}
]

setInterval ( () => {
  // Restart counter at new date
  curr_day = new Date().getDate();
  if ( curr_day != day ) {
    browser.storage.sync.remove ( ['tracker'] ).then ( ()=>console.log('New day'), (e)=>console.log(e));
    tracker = {};
    day = curr_day;
  }
  // Update active tabs timing
  browser.tabs.query({active: true}).then ( logTabs, (e) => console.log ( e ) );
  // Persistent save data
  browser.storage.sync.set({'tracker':tracker});
}, 1000 );

function redirect(requestDetails) {
  for ( var l of limit ) {
    // TODO: better matching function
    if ( requestDetails.url.includes(l.host) && tracker[l.host] > l.time ) {
      return {
        // TODO: redirect to local extension page
        redirectUrl: "https://38.media.tumblr.com/tumblr_ldbj01lZiP1qe0eclo1_500.gif"
      };
    }
  }
  return {}
}

// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onBeforeRequest
browser.webRequest.onBeforeRequest.addListener(
  redirect,
  {urls: ["<all_urls>"],types:['main_frame']},
  ["blocking"]
);
