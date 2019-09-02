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

function redirect(requestDetails) {
  var getting = browser.storage.sync.get(['limit']).then ( (result) => {
    limit = (result.limit==undefined) ? [] : result.limit;
  }, (e)=>console.log(e));
  for ( var l of limit ) {
    // TODO: better matching function
    if ( requestDetails.url.includes(l.host) && tracker[extractHostname(requestDetails.url)] > l.time ) {
      return {
        redirectUrl: browser.extension.getURL("blocked.html")
      };
    }
  }
}

function updateTimes(tabs) {
  for (let tab of tabs) {
    let host = extractHostname(tab.url);
    tracker[host] = ( tracker[host] == undefined ) ? 0 : tracker[host] + 1;
  }
}

// Load data
browser.storage.sync.get(['tracker','day']).then( function(result) {
  tracker = (result.tracker==undefined) ? {} : result.tracker;
  limit = (result.limit==undefined) ? [] : result.limit;
  day = (result.day==undefined) ? (new Date().getDate()) : result.day;
  browser.webRequest.onBeforeRequest.addListener(
    redirect,
    {urls: ["<all_urls>"],types:['main_frame']},
    ["blocking"]
  );
  setInterval ( () => {
    // Restart counter at new date
    curr_day = new Date().getDate();
    if ( curr_day != day ) {
      browser.storage.sync.remove ( ['tracker'] ).then ( ()=>console.log('New day'), (e)=>console.log(e));
      tracker = {};
      day = curr_day;
    }
    // Update active tabs timing
    browser.tabs.query({active: true}).then ( updateTimes, (e) => console.log ( e ) );
    // Persistent save data
    browser.storage.sync.set({'tracker':tracker});
  }, 1000 );
}, (e) => console.log ( e ));
