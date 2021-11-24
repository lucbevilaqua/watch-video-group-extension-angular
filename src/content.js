document.querySelector('video').addEventListener('pause', () => {
  chrome.runtime.sendMessage(
    { command: 'pause' },
    () => { }
  );
})

document.querySelector('video').addEventListener('play', () => {
  chrome.runtime.sendMessage(
    { command: 'play' },
    () => { }
  );
})

