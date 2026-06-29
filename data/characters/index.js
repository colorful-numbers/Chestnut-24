import fs from 'fs'
import path from 'path'
import { parseCharacterMarkdown } from '../../lib/characters'

const CHARACTERS_DIR = path.join(process.cwd(), 'data', 'characters')
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'characters')
const LOCALES = ['zh', 'en']

// --- Global settings (shared by every character) ---------------------------

// Background-music tracks. Referenced by name from character markdown via
// `- [BGM](main)`. Apple Music embeds only play once deployed to a real domain;
// that is acceptable for local preview.
const BGM = {
  main: { id: 'main', src: 'https://embed.music.apple.com/us/song/kimi-ga-umareta-hi-feat-hatsune-miku/409345971' },
  silent: { id: 'silent', src: 'https://embed.music.apple.com/us/song/nuit/1335309747' },
}

// Display names for each BGM track, per locale.
const TRACK_NAMES = {
  zh: { main: '君が生まれた日 (feat. 初音未来)', silent: 'Nuit' },
  en: { main: 'Kimi ga Umareta Hi (feat. Hatsune Miku)', silent: 'Nuit' },
}

// UI chrome strings. The dialogue markdown only carries story content, so these
// shared labels live here instead of per-character.
const CHROME = {
  zh: {
    label: '角色对话',
    openLabel: '点击进入对话',
    mainAlt: '角色立绘',
    choiceLabel: '做出选择',
    controlsLabel: '对话控制',
    back: '返回全部角色',
    controls: {
      lastChoice: '回到上一个选择',
      lastSentence: '回到上一句',
      backlog: '对话回顾',
      auto: '自动播放',
      autoStop: '停止自动播放',
      nextSentence: '下一句',
      nextChoice: '快进到下一个选择',
    },
    music: { open: '背景音乐', play: '播放音乐', pause: '暂停音乐', volume: '音量', now: '正在播放', close: '关闭音乐面板' },
    backlog: { title: '对话回顾', empty: '还没有可回顾的对话。', jump: '返回这一句', current: '当前', reset: '回到开头', close: '关闭回顾' },
  },
  en: {
    label: 'CHARACTER DIALOGUE',
    openLabel: 'Enter the dialogue',
    mainAlt: 'Character art',
    choiceLabel: 'Make a choice',
    controlsLabel: 'Dialogue controls',
    back: 'Back to the cast',
    controls: {
      lastChoice: 'Back to last choice',
      lastSentence: 'Back to last line',
      backlog: 'Backlog',
      auto: 'Auto play',
      autoStop: 'Stop auto play',
      nextSentence: 'Next line',
      nextChoice: 'Skip to next choice',
    },
    music: { open: 'Background music', play: 'Play music', pause: 'Pause music', volume: 'Volume', now: 'Now playing', close: 'Close music panel' },
    backlog: { title: 'Backlog', empty: 'No dialogue history yet.', jump: 'Jump back here', current: 'Current', reset: 'Back to start', close: 'Close backlog' },
  },
}

// --- Loader ----------------------------------------------------------------

// Pick the still used by cast cards and previews (everything outside the live
// dialogue stage). Prefer `<id>-main-cg.png`, then any `*main-cg.*` file. The
// default expression is only a last resort, so cards never show it.
function pickMainCg(id, defaultExpressionSrc) {
  const dir = path.join(PUBLIC_DIR, id)
  const fallback = defaultExpressionSrc || ''
  if (!fs.existsSync(dir)) return fallback
  const files = fs.readdirSync(dir)
  const named = `${id}-main-cg.png`
  if (files.includes(named)) return `/characters/${id}/${named}`
  const pngMain = files.find((file) => /main-cg\.png$/i.test(file))
  if (pngMain) return `/characters/${id}/${pngMain}`
  const anyMain = files.find((file) => /main-cg\./i.test(file))
  if (anyMain) return `/characters/${id}/${anyMain}`
  const expression = files.find((file) => /^expression-/i.test(file))
  if (expression) return `/characters/${id}/${expression}`
  return fallback
}

export function getCharacters() {
  if (!fs.existsSync(CHARACTERS_DIR)) return []

  const characters = fs.readdirSync(CHARACTERS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const id = entry.name
      const locales = {}
      let defaultExpressionSrc = ''

      LOCALES.forEach((lang) => {
        const file = path.join(CHARACTERS_DIR, id, `${lang}.md`)
        if (!fs.existsSync(file)) return
        const parsed = parseCharacterMarkdown(fs.readFileSync(file, 'utf8'), { id, bgmMap: BGM })
        defaultExpressionSrc = defaultExpressionSrc || parsed.defaultExpressionSrc
        locales[lang] = {
          ...CHROME[lang],
          tracks: TRACK_NAMES[lang],
          title: parsed.title,
          speaker: parsed.speaker,
          body: parsed.body,
          starterNode: parsed.starterNode,
          defaultNode: parsed.defaultNode,
          defaultExpressionSrc: parsed.defaultExpressionSrc,
          defaultBackground: parsed.defaultBackground,
          defaultBgm: parsed.defaultBgm,
          graph: parsed.graph,
          lines: parsed.lines,
        }
      })

      if (!locales.zh && locales.en) locales.zh = locales.en
      if (!Object.keys(locales).length) return null

      return {
        id,
        mainCg: pickMainCg(id, defaultExpressionSrc),
        locales,
      }
    })
    .filter(Boolean)

  // Strip undefined so the objects are safe to pass through getStaticProps.
  return JSON.parse(JSON.stringify(characters))
}
