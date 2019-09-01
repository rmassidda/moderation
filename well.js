tracker = {}

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
  console.clear ();
  console.log ( tracker );
}

function onError(error) {
  console.log(`Error: ${error}`);
}

setInterval ( () => browser.tabs.query({active: true}).then ( logTabs, onError ), 1000 );
