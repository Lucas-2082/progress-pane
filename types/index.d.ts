export type Board = { text: string; mtimeMs: number }

declare module 'claude-code' {
  interface PluginState {
    'progress-pane': { board: Shaped<Board> }
  }
}
