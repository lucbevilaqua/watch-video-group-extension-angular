export type DOMMessage = {
  command: 'updateStatusVideo' | 'removeRoom' | 'createRoom' | 'enterRoom' | 'timeupdate' | 'getExtensionId' | 'setDataInStorage' | 'getDataInStorage' | 'removeDataInStorage';
  data?: any;
}
