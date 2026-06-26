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
    mainCg: '/characters/work101/main-cg.svg',
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
  }),
  simpleCharacter({
    id: 'clerk',
    mainCg: '/characters/clerk/main-cg.svg',
    zh: {
      label: 'CHARACTER DISPLAY',
      title: '售货员小姐',
      speaker: '售货员小姐',
      choiceLabel: '选择对话主题',
      body: '十年前水果店的老板娘，如今在便利店中清点货物。',
      stateTitle: '便利店的灯',
      response: '欢迎回来。其实这也许只是巧合，我只是刚好旅行到这里，又刚好在你醒来的这一天开门。',
      loopChoice: '询问她为何在这里',
    },
    en: {
      label: 'CHARACTER DISPLAY',
      title: 'The Clerk',
      speaker: 'The Clerk',
      choiceLabel: 'Choose a conversation topic',
      body: 'The fruit-shop owner from ten years ago, now counting goods in a convenience store.',
      stateTitle: 'Store Light',
      response: 'Welcome back. Maybe it is only coincidence. I happened to travel here and happened to open the store on the day you woke.',
      loopChoice: 'Ask why she is here',
    },
  }),
  simpleCharacter({
    id: 'choice',
    mainCg: '/characters/choice/main-cg.svg',
    zh: {
      label: 'CHARACTER DISPLAY',
      title: '选择',
      speaker: '旁白',
      choiceLabel: '选择对话主题',
      body: '继续冬眠前往未知未来，还是在这个时代与越来越少的知己一起生活。',
      stateTitle: '停留或离开',
      response: '每一次醒来都像是站在同一个岔路口。未来被保证会更好，但此刻拥有声音、灯光和一个愿意说话的人。',
      loopChoice: '重新考虑',
    },
    en: {
      label: 'CHARACTER DISPLAY',
      title: 'The Choice',
      speaker: 'Narration',
      choiceLabel: 'Choose a conversation topic',
      body: 'Sleep again and move toward an unknown future, or remain in this age with the few companions who still wake.',
      stateTitle: 'Stay or Leave',
      response: 'Every waking feels like the same fork in the road. The future is promised to be better, but the present has sound, light, and someone willing to speak.',
      loopChoice: 'Consider again',
    },
  }),
]
