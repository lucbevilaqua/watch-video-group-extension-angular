export type DOMMessage = {
  command: 'pause' | 'play' | 'createRoom' | 'entryRoom' | 'timeupdate';
  data?: any;
}
