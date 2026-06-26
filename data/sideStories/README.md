# Side Stories

Place side-story fragments for the front-page random carousel here.

Edit `data/sideStories/index.js` to add a new fragment. Each fragment should include:

- `id`: stable unique id
- `time`: in-world time shown on the card
- `media`: image path under `public/story-media/`
- `zh`: Chinese `kicker`, `title`, and `body`
- `en`: English `kicker`, `title`, and `body`

The homepage randomly selects at most five fragments on each refresh.
