import zh from './zh.json'
import en from './en.json'

export const qiCharacter = {
  id: 'qi',
  defaultState: 'waking',
  mainCg: '/characters/qi/qi-main-cg.png',
  background: '/characters/qi/qi-main-cg.png',
  expressions: {
    neutral: '/characters/qi/expression-neutral.svg',
    uncertain: '/characters/qi/expression-uncertain.svg',
    focused: '/characters/qi/expression-focused.svg',
  },
  locales: {
    zh,
    en,
  },
}
