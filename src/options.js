function saveOptions(e) {
  e.preventDefault();
  let config = document.getElementById("config").value.split('\n');
  let limit = [];
  for ( c of config ) {
    val = c.split(',');
    limit.push ( {host:val[0],time:val[1]} );
  }
  browser.storage.sync.set({'limit':limit});
}

function restoreOptions() {

  function setCurrentChoice(result) {
    let limit = (result.limit==undefined) ? [] : result.limit;
    for ( l of limit ) {
      document.getElementById("config").value += `${l.host},${l.time}\n`;
    }
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.sync.get(['limit']);
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
