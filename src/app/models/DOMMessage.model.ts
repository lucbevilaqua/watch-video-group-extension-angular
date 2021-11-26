export type DOMMessage = {
  command: 'pause' | 'play' | 'createRoom' | 'entryRoom';
  data?: any;
}
