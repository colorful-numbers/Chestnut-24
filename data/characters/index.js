import fs from 'fs'
import path from 'path'
import { parseCharacterMarkdown } from '../../lib/characters'

const CHARACTERS_DIR = path.join(process.cwd(), 'data', 'characters')
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'characters')
const LOCALES = ['zh', 'en']

// --- Global settings (shared by every character) ---------------------------

// Background-music tracks. Referenced by name from character markdown via
// `- [BGM](main)`. `src` is a local file played by an <audio> element; `embed`
// keeps the original Apple Music embed URL for future use (see BgmPlayer).
// Local tracks are public-domain recordings from Wikimedia Commons.
const BGM = {
  main: {
    id: 'main',
    src: '/music/Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg',
    embed: 'https://embed.music.apple.com/us/song/kimi-ga-umareta-hi-feat-hatsune-miku/409345971',
  },
  silent: {
    id: 'silent',
    src: "/music/Ludwig_van_Beethoven_-_sonata_no._14_in_c_sharp_minor_'moonlight',_op._27_no._2_-_i._adagio_sostenuto.ogg",
    embed: 'https://embed.music.apple.com/us/song/nuit/1335309747',
  },
}

// Display names for each BGM track, per locale.
const TRACK_NAMES = {
  zh: { main: 'Gymnopédie No.1 · Erik Satie', silent: '月光奏鸣曲 第一乐章 · Beethoven' },
  en: { main: 'Gymnopédie No.1 · Erik Satie', silent: 'Moonlight Sonata, Mvt. I · Beethoven' },
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
    music: { open: '背景音乐', play: '播放音乐', pause: '暂停音乐', volume: '音量', mute: '静音', unmute: '取消静音', now: '正在播放', close: '关闭音乐面板' },
    backlog: { title: '对话回顾', empty: '还没有可回顾的对话。', jump: '返回这一句', current: '当前', reset: '回到开头', close: '关闭回顾' },
    hints: {
      open: '快捷键与设置',
      title: '快捷键与设置',
      close: '关闭',
      keys: [
        { key: '空格 / 滚轮', desc: '下一句' },
        { key: '向上滚轮', desc: '上一句' },
        { key: '按住 Ctrl', desc: '快速跳过对话' },
        { key: 'A', desc: '自动播放' },
        { key: '右键', desc: '隐藏 / 显示界面，欣赏立绘' },
        { key: 'Esc', desc: '打开 / 关闭此菜单' },
      ],
      speed: '文字速度',
      speeds: { slow: '慢', normal: '正常', fast: '快', instant: '瞬间' },
      save: '存档 / 读档：暂未支持',
      restore: '右键恢复界面',
    },
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
    music: { open: 'Background music', play: 'Play music', pause: 'Pause music', volume: 'Volume', mute: 'Mute', unmute: 'Unmute', now: 'Now playing', close: 'Close music panel' },
    backlog: { title: 'Backlog', empty: 'No dialogue history yet.', jump: 'Jump back here', current: 'Current', reset: 'Back to start', close: 'Close backlog' },
    hints: {
      open: 'Shortcuts & settings',
      title: 'Shortcuts & settings',
      close: 'Close',
      keys: [
        { key: 'Space / Scroll', desc: 'Next line' },
        { key: 'Scroll up', desc: 'Previous line' },
        { key: 'Hold Ctrl', desc: 'Fast-skip the dialogue' },
        { key: 'A', desc: 'Auto play' },
        { key: 'Right-click', desc: 'Hide / show the UI to view the art' },
        { key: 'Esc', desc: 'Open / close this menu' },
      ],
      speed: 'Text speed',
      speeds: { slow: 'Slow', normal: 'Normal', fast: 'Fast', instant: 'Instant' },
      save: 'Save / Load: not supported yet',
      restore: 'Right-click to restore the UI',
    },
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
