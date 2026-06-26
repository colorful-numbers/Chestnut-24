import zh from './zh.json'
import en from './en.json'

export const qiCharacter = {
  id: 'qi',
  defaultState: 'waking',
  mainCg: '/characters/qi/main-cg.svg',
  background: '/characters/qi/main-cg.svg',
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
