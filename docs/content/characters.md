# Add Characters And Dialogue

Character conversations are rendered by `components/CharacterDisplay.jsx` and arranged by `components/CharacterCarousel.jsx`.

## Folder Layout

Create one data folder and one media folder per character:

```text
data/characters/<character>/
public/characters/<character>/
```

For a full bilingual state-machine character, use this shape:

```text
data/characters/<character>/index.js
data/characters/<character>/zh.json
data/characters/<character>/en.json
public/characters/<character>/main-cg.svg
public/characters/<character>/expression-neutral.svg
```

## Character Index

`index.js` binds media resources and locale JSON:

```js
import zh from './zh.json'
import en from './en.json'

export const myCharacter = {
  id: 'my-character',
  defaultState: 'start',
  mainCg: '/characters/my-character/main-cg.svg',
  background: '/characters/my-character/main-cg.svg',
  expressions: {
    neutral: '/characters/my-character/expression-neutral.svg',
  },
  locales: { zh, en },
}
```

Then export the character from:

```text
data/characters/index.js
```

## Dialogue State Machine

Each locale JSON owns visible text and choices:

```json
{
  "label": "CHARACTER DISPLAY",
  "title": "Qi: Before the Convenience Store",
  "speaker": "Qi",
  "choiceLabel": "Choose a conversation topic",
  "controlsLabel": "Dialogue controls",
  "openLabel": "Click the CG to start",
  "body": "Short character description.",
  "mainAlt": "Main CG alt text",
  "controls": {
    "back": "Back to last choice",
    "auto": "Auto play",
    "reset": "Back to start",
    "skip": "Skip typing",
    "next": "Skip to next choice"
  },
  "states": {
    "start": {
      "title": "Opening",
      "expression": "neutral",
      "expressionAlt": "Neutral portrait",
      "response": "Dialogue text.",
      "choices": [
        { "label": "Ask about the city", "next": "city" }
      ]
    },
    "city": {
      "title": "City",
      "expression": "neutral",
      "expressionAlt": "Neutral portrait",
      "response": "Another response.",
      "choices": [
        { "label": "Return", "next": "start" }
      ]
    }
  }
}
```

Choices can loop or branch. The widget keeps a history stack so the user can return to the last choice.
