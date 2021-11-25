// window.addEventListener('load', function(event) {
//   this.setTimeout(() => {
//     console.log('vai lançar o put');
//     chrome.runtime.sendMessage(
//       { command: 'put' },
//       () => {
//         console.log('finalizou o put')
//       }
//     );
//   })
// });

var myPort = chrome.runtime.connect({ name: 'port-from-cs' });

document.querySelector('video').addEventListener('pause', () => myPort.postMessage({ command: 'pause' }));

document.querySelector('video').addEventListener('play', () => myPort.postMessage({ command: 'play' }));

myPort.onMessage.addListener((msg) => {
  if (msg.command === 'updateVideo') {
    if (msg.data?.pause) {
      document.querySelector('video')?.pause();
    } else {
      document.querySelector('video')?.play()
    }
  }
});
