activatedTabs = []

function handleActivated ( e ) {
  curr = {
    window: e.windowId,
    tab: e.tabId
  }
  prev = {
    window: e.windowId,
    tab: e.previousTabId
  }
  activatedTabs.push ( curr );
  activatedTabs = activatedTabs.filter ( t => t.window != prev.window || t.tab != prev.tab );
}

function handleRemoved ( tabId, removeInfo ) {
  prev = {
    window: tabId,
    tab: removeInfo.windowId
  }
  activatedTabs = activatedTabs.filter ( t => t.window != prev.window || t.tab != prev.tab );
}

browser.tabs.onActivated.addListener ( handleActivated );
browser.tabs.onRemoved.addListener ( handleRemoved );

setInterval ( () => console.log ( activatedTabs ), 1000 );
