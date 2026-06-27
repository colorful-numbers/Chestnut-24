# Add Characters And Dialogue

Character conversations are rendered by `components/CharacterDisplay.jsx`. On the
homepage they appear as preview cards in `components/CharacterCarousel.jsx`; the
full interactive dialogue lives on the standalone page `pages/cast/[id].js`,
where the display opens as a full-window modal.

## Folder Layout

Create one data folder and one media folder per character:

```text
data/characters/<character>/
public/characters/<character>/
```

For a full bilingual character, use this shape:

```text
data/characters/<character>/index.js
data/characters/<character>/zh.json
data/characters/<character>/en.json
public/characters/<character>/main-cg.svg
```

## Character Index (language-neutral graph)

`index.js` binds media, the background-music track, the story `graph`, and the
locale JSON. The graph is authored once; only text is localized.

```js
import zh from './zh.json'
import en from './en.json'

// Apple Music embed URL. Cross-origin embeds only play once deployed.
const BGM = { id: 'main', src: 'https://embed.music.apple.com/us/song/.../123' }

export const myCharacter = {
  id: 'my-character',
  defaultState: 'intro-1',
  mainCg: '/characters/my-character/main-cg.svg',
  background: '/story-media/scene.png',
  defaultBgm: BGM,
  expressions: { neutral: '/characters/my-character/main-cg.svg' },
  graph: {
    // Sentence node: advances through `next`. Optional `background` / `bgm`
    // change the scene at this node and carry forward.
    'intro-1': { expression: 'neutral', background: '/story-media/scene.png', bgm: BGM, next: 'intro-2' },
    'intro-2': { expression: 'neutral', next: 'pick' },
    // Decision node: two or more `choices` pause auto-play until the user picks.
    pick: { expression: 'neutral', choices: [{ to: 'a-1' }, { to: 'b-1' }] },
    'a-1': { expression: 'neutral' }, // end node: no `next`, no `choices`
    'b-1': { expression: 'neutral' },
  },
  locales: { zh, en },
}
```

Then export the character from `data/characters/index.js`.

### Node types

- **Sentence node** — has `next`, no multi-choice. Auto-play and the "next"
  controls advance it automatically. Keep most nodes this way (~60%+ of the
  graph should be continue-only).
- **Decision node** — has `choices` with **two or more** entries. Auto-play
  pauses here; the user must choose.
- **End node** — no `next` and no `choices`.

## Locale Text

Each locale JSON owns chrome strings plus a `lines` map keyed by graph node id.
Decision-node labels are an array aligned with that node's `choices` order.
Author `zh` fully; `en` may stay a placeholder until a translation pass.

```json
{
  "label": "角色对话",
  "title": "角色名",
  "speaker": "角色名",
  "body": "简短角色描述。",
  "openLabel": "点击进入对话",
  "choiceLabel": "做出选择",
  "controlsLabel": "对话控制",
  "back": "返回全部角色",
  "controls": {
    "lastChoice": "回到上一个选择",
    "lastSentence": "回到上一句",
    "backlog": "对话回顾",
    "auto": "自动播放",
    "autoStop": "停止自动播放",
    "nextSentence": "下一句",
    "nextChoice": "快进到下一个选择"
  },
  "music": { "open": "背景音乐", "now": "正在播放", "close": "关闭音乐面板" },
  "backlog": { "title": "对话回顾", "empty": "还没有可回顾的对话。", "jump": "返回这一句", "current": "当前", "reset": "回到开头", "close": "关闭回顾" },
  "tracks": { "main": "曲目名" },
  "lines": {
    "intro-1": { "title": "开场", "text": "对话文本。" },
    "pick": { "title": "选择", "text": "提示文本。", "choices": ["选项 A", "选项 B"] },
    "a-1": { "title": "结局 A", "text": "结尾文本。" },
    "b-1": { "title": "结局 B", "text": "结尾文本。" }
  }
}
```

The widget keeps a history stack, so the backlog panel and the "back to last
choice / sentence" controls can return to any visited line.
