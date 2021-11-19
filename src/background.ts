chrome.runtime.onInstalled.addListener(() => {
  chrome.webNavigation.onCompleted.addListener(
    () => {
      chrome.tabs.query({ active: true, currentWindow: true }, ([{ id }]) => {
        if (id == null) return;
        chrome.pageAction.show(id);
      });
    },
    { url: [{ urlMatches: 'youtube.com' }] }
  );
});
