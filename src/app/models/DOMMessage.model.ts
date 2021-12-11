export type DOMMessage = {
  command: 'updateStatusVideo' | 'removeRoom' | 'createRoom' | 'enterRoom' | 'timeupdate' | 'getExtensionId';
  data?: any;
}
