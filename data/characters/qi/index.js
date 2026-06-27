import zh from './zh.json'
import en from './en.json'

// Demo scene backgrounds reuse existing story-media art for testing scene
// transitions. Swap these for dedicated CGs when artwork is ready.
const SCENE = {
  ruins: '/story-media/fragment-awake.png',
  blade: '/story-media/fragment-blade.png',
  tower: '/story-media/hero-sylph.png',
  street: '/story-media/fragment-street.png',
}

// BGM tracks are Apple Music embeds. Cross-origin embeds only play once the site
// is deployed to a real domain; that is acceptable for local preview.
const BGM = {
  main: { id: 'main', src: 'https://embed.music.apple.com/us/song/kimi-ga-umareta-hi-feat-hatsune-miku/409345971' },
  silent: { id: 'silent', src: 'https://embed.music.apple.com/us/song/nuit/1335309747' },
}

// Language-neutral story graph. Most nodes are plain sentence nodes that auto
// advance through `next`; decision nodes carry two or more `choices` and pause
// auto-play. `background` / `bgm` are only set on nodes where the scene changes.
const graph = {
  'wake-1': { expression: 'uncertain', background: SCENE.ruins, bgm: BGM.main, next: 'wake-2' },
  'wake-2': { expression: 'uncertain', next: 'wake-3' },
  'wake-3': { expression: 'neutral', next: 'look' },
  look: { expression: 'neutral', choices: [{ to: 'blade-1' }, { to: 'tower-1' }] },
  'blade-1': { expression: 'focused', background: SCENE.blade, next: 'blade-2' },
  'blade-2': { expression: 'focused', next: 'blade-3' },
  'blade-3': { expression: 'uncertain', choices: [{ to: 'artifact101-1' }, { to: 'tower-1' }] },
  'artifact101-1': { expression: 'uncertain', next: 'artifact101-2' },
  'artifact101-2': { expression: 'neutral', next: 'tower-1' },
  'tower-1': { expression: 'neutral', background: SCENE.tower, next: 'tower-2' },
  'tower-2': { expression: 'neutral', next: 'tower-3' },
  'tower-3': { expression: 'focused', choices: [{ to: 'shop-1' }, { to: 'wake-3' }] },
  'shop-1': { expression: 'focused', background: SCENE.street, bgm: BGM.silent, next: 'shop-2' },
  'shop-2': { expression: 'neutral', next: 'shop-3' },
  'shop-3': { expression: 'neutral' },
}

export const qiCharacter = {
  id: 'qi',
  defaultState: 'wake-1',
  mainCg: '/characters/qi/qi-main-cg.png',
  background: SCENE.ruins,
  defaultBgm: BGM.main,
  expressions: {
    neutral: '/characters/qi/expression-neutral.svg',
    uncertain: '/characters/qi/expression-uncertain.svg',
    focused: '/characters/qi/expression-focused.svg',
  },
  graph,
  locales: { zh, en },
}
