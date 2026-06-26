import { qiCharacter } from './qi/index.js'

function simpleCharacter({ id, mainCg, zh, en }) {
  return {
    id,
    defaultState: 'intro',
    mainCg,
    background: mainCg,
    expressions: {
      neutral: mainCg,
    },
    locales: {
      zh: {
        ...zh,
        controlsLabel: '对话控制',
        openLabel: '点击 CG 开始对话',
        mainAlt: zh.title,
        controls: {
          back: '回到上一个选择',
          auto: '自动播放',
          reset: '回到开头',
          skip: '跳过打字',
          next: '前往下一个选择',
        },
        states: {
          intro: {
            title: zh.stateTitle,
            expression: 'neutral',
            expressionAlt: zh.title,
            response: zh.response,
            choices: [{ label: zh.loopChoice, next: 'intro' }],
          },
        },
      },
      en: {
        ...en,
        controlsLabel: 'Dialogue controls',
        openLabel: 'Click the CG to start',
        mainAlt: en.title,
        controls: {
          back: 'Back to last choice',
          auto: 'Auto play',
          reset: 'Back to start',
          skip: 'Skip typing',
          next: 'Skip to next choice',
        },
        states: {
          intro: {
            title: en.stateTitle,
            expression: 'neutral',
            expressionAlt: en.title,
            response: en.response,
            choices: [{ label: en.loopChoice, next: 'intro' }],
          },
        },
      },
    },
  }
}

export const characters = [
  qiCharacter,
  simpleCharacter({
    id: 'work101',
    mainCg: '/characters/work101/piece101-main-cg.png',
    zh: {
      label: 'CHARACTER DISPLAY',
      title: '作品101',
      speaker: '作品101',
      choiceLabel: '选择对话主题',
      body: '由记忆拼凑、由人类养大的独立 AI。她像预言，也像参考答案。',
      stateTitle: '远处的回声',
      response: '如果一个灵魂由别人的记忆开始生长，它仍然可以拥有自己的明天。只是我还不知道，器会不会把我称作朋友。',
      loopChoice: '继续听她说',
    },
    en: {
      label: 'CHARACTER DISPLAY',
      title: 'Work 101',
      speaker: 'Work 101',
      choiceLabel: 'Choose a conversation topic',
      body: 'An independent AI assembled from memory and raised in a human-like environment. She is part prophecy, part answer key.',
      stateTitle: 'Distant Echo',
      response: 'If a soul begins with someone else’s memory, it can still have its own tomorrow. I only do not know whether Qi will call me a friend.',
      loopChoice: 'Keep listening',
    },
  })
]
