# progress-pane

Claude Code 옆 패널에 **진행상황 파일**(`E:\music\진행상황.md`)을 항상 띄워 두는 모드입니다.
파일을 3초마다 다시 읽으므로, Claude나 사람이 파일을 고치면 패널이 저절로 바뀝니다.

A Claude Code mod that keeps a side pane open showing a progress file (a small Markdown list), re-read every 3 seconds.

## 파일 형식

```
# 지금 돌아가는 작업
- 노래 생성: 아버지의 지게 (16:20 시작)

# 결정 기다리는 일
- 돌아보니 한세상 버전 고르기

# 다음 할 일
- 발매 준비
```

- `# 제목` 줄은 구역 제목이 되고, 옆에 항목 수 `(N개)`가 붙습니다 (`- 없음`은 세지 않음).
- 「돌아가는」이 들어간 구역에 항목이 있으면 제목이 초록색으로 바뀌어, 작업이 몇 개 동시에 도는지 바로 보입니다.
- `- 내용` 줄은 항목, 나머지 줄은 흐린 글씨로 보입니다.

파일 경로는 `hooks/register.tsx` 맨 위의 `FILE` 값입니다. 다른 경로를 쓰려면 그 값을 바꾸세요.

## 설치

Claude Code 터미널 입력창에서:

```
/plugin install progress-pane --marketplace Lucas-2082/progress-pane
```

`Add marketplace?`에 `y`, 그다음 설치 범위(user)를 Enter로 고르면 바로 켜집니다.

셸에서:

```
claude plugin install progress-pane --marketplace Lucas-2082/progress-pane
```

## 사용

- Claude Code를 켜면 「진행상황」 패널이 자동으로 열립니다 (터미널이 좁으면 넓힐 때 나타남).
- 닫았으면 `/progress` 로 다시 엽니다.
