export type DOMMessage = {
  command: 'updateStatusVideo' | 'createRoom' | 'enterRoom' | 'timeupdate' | 'getExtensionId';
  data?: any;
}
