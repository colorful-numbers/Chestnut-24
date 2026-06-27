import { qiCharacter } from './qi/index.js'

// Apple Music embed used as the default background track. Cross-origin embeds
// only play once deployed to a real site; that is acceptable for local preview.
const ARTIFACT101_BGM = {
  id: 'main',
  src: 'https://embed.music.apple.com/us/song/kimi-ga-umareta-hi-feat-hatsune-miku/409345971',
}

// A small secondary cast member using the same graph model as Qi.
// zh is authored fully; en is a placeholder (preview the Chinese site).
const artifact101 = {
  id: 'artifact101',
  defaultState: 'echo-1',
  mainCg: '/characters/artifact101/piece101-main-cg.png',
  background: '/story-media/fragment-compute.png',
  defaultBgm: ARTIFACT101_BGM,
  expressions: {
    neutral: '/characters/artifact101/main-cg.svg',
  },
  graph: {
    'echo-1': { expression: 'neutral', background: '/story-media/fragment-compute.png', bgm: ARTIFACT101_BGM, next: 'echo-2' },
    'echo-2': { expression: 'neutral', next: 'echo-3' },
    'echo-3': { expression: 'neutral', choices: [{ to: 'soul-1' }, { to: 'friend-1' }] },
    'soul-1': { expression: 'neutral', background: '/story-media/fragment-ballons.png', next: 'soul-2' },
    'soul-2': { expression: 'neutral' },
    'friend-1': { expression: 'neutral', next: 'friend-2' },
    'friend-2': { expression: 'neutral' },
  },
  locales: {
    zh: {
      label: '角色对话',
      title: '作品101',
      speaker: '作品101',
      body: '由记忆拼凑、由人类养大的独立 AI。她像预言，也像参考答案。',
      openLabel: '点击进入对话',
      mainAlt: '作品101',
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
      tracks: { main: '君が生まれた日 (feat. 初音未来)' },
      lines: {
        'echo-1': { title: '远处的回声', text: '如果一个灵魂由别人的记忆开始生长，' },
        'echo-2': { title: '远处的回声', text: '它仍然可以拥有自己的明天。' },
        'echo-3': { title: '远处的回声', text: '只是我还不确定，应该先回答哪一个问题。', choices: ['灵魂能不能从记忆里长出来', '器会不会把我称作朋友'] },
        'soul-1': { title: '记忆与灵魂', text: '记忆只是起点，不是答案。' },
        'soul-2': { title: '记忆与灵魂', text: '我用别人的过去，写出只属于我的下一句。' },
        'friend-1': { title: '关于器', text: '我替她记得太多，多到像是替她活过很多次。' },
        'friend-2': { title: '关于器', text: '所以我一直在等：她醒来时，会不会先想起我。' },
      },
    },
    en: {
      label: 'CHARACTER DIALOGUE',
      title: 'Artifact 101 (EN translation pending)',
      speaker: 'Artifact 101',
      body: 'EN translation pending. Preview the Chinese site for finished copy.',
      openLabel: 'Enter the dialogue',
      mainAlt: 'Artifact 101',
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
      tracks: { main: 'Kimi ga Umareta Hi (feat. Hatsune Miku)' },
      lines: {
        'echo-1': { title: 'Distant Echo', text: 'EN translation pending.' },
        'echo-2': { title: 'Distant Echo', text: 'EN translation pending.' },
        'echo-3': { title: 'Distant Echo', text: 'EN translation pending.', choices: ['Can a soul grow from memory', 'Will Qi call me a friend'] },
        'soul-1': { title: 'Memory and Soul', text: 'EN translation pending.' },
        'soul-2': { title: 'Memory and Soul', text: 'EN translation pending.' },
        'friend-1': { title: 'About Qi', text: 'EN translation pending.' },
        'friend-2': { title: 'About Qi', text: 'EN translation pending.' },
      },
    },
  },
}

export const characters = [qiCharacter, artifact101]
