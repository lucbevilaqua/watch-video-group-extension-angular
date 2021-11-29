export type DOMMessage = {
  command: 'updateStatusVideo' | 'createRoom' | 'entryRoom' | 'timeupdate' | 'getExtensionId';
  data?: any;
}
