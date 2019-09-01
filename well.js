tracker = {}
browser.storage.sync.get(['tracker']).then( function(result) {
  tracker = (result.tracker==undefined) ? {} : result.tracker;
}, (e) => console.log ( e ));


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
  console.log ( tracker );
}

function onError(error) {
}

setInterval ( () => {
  // TODO: check if date changed and clear the tracker dates
  // Update active tabs timing
  browser.tabs.query({active: true}).then ( logTabs, onError )
  // Persistent save data
  browser.storage.sync.set({'tracker':tracker});
}, 1000 );
