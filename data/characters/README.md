# Characters

Each character display binds one data folder to one media folder.

Data folder pattern:

- `data/characters/<character>/index.js`

Media folder pattern:

- `public/characters/<character>/`

Each character data file should define:

- main CG path
- expression image paths
- `zh.json` and `en.json` locale files
- dialogue states
- predefined choices that jump to the next dialogue state
- predefined answers for each state

The first demo is `qi`, used by `components/CharacterDisplay.jsx`.
