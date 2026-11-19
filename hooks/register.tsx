import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Board } from '../types'

// 진행상황 패널: E:\music\진행상황.md 를 옆 패널에 보여 준다 (파일이 바뀔 만한 순간에만 다시 읽음).
// 파일 형식: "# 제목" 줄은 구역 제목, "- 내용" 줄은 항목, 나머지 줄은 그대로.
const PANE = 'progress'
const TITLE = '진행상황'
const FILE = 'E:\\music\\진행상황.md'
const board = atom({ plugin: 'progress-pane', key: 'board' } as const, { text: '', mtimeMs: 0 }, {
  shape: 'board-1',
})

const hhmm = (ms: number) => {
  if (!ms) return ''
  const d = new Date(ms)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getMonth() + 1}/${d.getDate()} ${p(d.getHours())}:${p(d.getMinutes())}`
}

// 시계로 몇 초마다 보지 않고, 파일이 바뀌었을 수 있는 순간에만 새로 읽는다:
// 켤 때 · Claude가 파일을 고치는 도구(Edit/Write/Bash)를 쓴 직후 · 사람이 글을 보낼 때 · /progress
// (바뀌었는지는 고친 시각만 보고, 바뀌었을 때만 내용을 읽음)
const refresh = async ($: any) => {
  const st = await $.fs.stat(FILE).catch(() => undefined)
  const mtimeMs = st?.mtimeMs ?? 0
  const now = await read($, board)
  if (mtimeMs === now.mtimeMs && now.text !== '') return
  const text = st ? await $.fs.read(FILE).catch(() => '') : ''
  await update($, board, () => ({ text: String(text), mtimeMs }))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'progress', description: '진행상황 패널 열기' })
    await refresh($)
    void $.ui.open({ id: PANE, title: TITLE })
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    const ran = await next(e)
    if (e.tool === 'Edit' || e.tool === 'Write' || e.tool === 'Bash' || e.tool === 'PowerShell') await refresh($).catch(() => {})
    return ran
  })

  on('prompt.submit', async ($, e, next) => {
    await refresh($).catch(() => {})
    return next(e)
  })

  on('command.run', { command: 'progress' }, async $ => {
    await refresh($)
    await $.ui.open({ id: PANE, title: TITLE })
    return { text: '진행상황 패널을 열었어요.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const b = await read($, board)
    const lines = b.text.replace(/\r/g, '').split('\n')
    // 구역마다 항목 수 (「없음」은 빼고) → 제목 옆에 (N개)
    const count = (at: number) => {
      let n = 0
      for (let i = at + 1; i < lines.length && !/^#+\s/.test(lines[i]); i++)
        if (/^\s*[-*]\s/.test(lines[i]) && !/^\s*[-*]\s+없음\s*$/.test(lines[i])) n++
      return n
    }
    return (
      <Box flexDirection="column">
        {b.text.trim() === '' && <Text dimColor>{FILE} 이(가) 비어 있거나 없어요.</Text>}
        {lines.map((line, i) => {
          if (/^#+\s/.test(line)) {
            const n = count(i)
            const isRun = line.includes('돌아가는')
            return <Text color={isRun && n > 0 ? 'success' : 'warning'} weight="bold">{line.replace(/^#+\s*/, '■ ')} ({n}개)</Text>
          }
          if (/^\s*[-*]\s/.test(line)) return <Text>{line.replace(/^(\s*)[-*]\s/, '$1· ')}</Text>
          if (line.trim() === '') return <Text> </Text>
          return <Text dimColor>{line}</Text>
        })}
        {b.mtimeMs > 0 && <Text dimColor>— 고친 시각 {hhmm(b.mtimeMs)}</Text>}
      </Box>
    )
  })
}
