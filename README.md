# Lucky Lotto

Lucky Lotto suggests Powerball and Mega Millions numbers from New York Open Data draw history. The draw requests are public and do not send an app token.

Powerball is `/`. Mega Millions is `/MegaMillions`. Each page shows a least-drawn combination (the five white balls and the special ball that appear least often in the loaded history) and five random lines. Random lines are sampled uniformly from the current matrix: Powerball is 5 numbers from 1–69 plus a Powerball from 1–26, and Mega Millions is 5 numbers from 1–70 plus a Mega Ball from 1–24. A line that has already won is not shown.

Draws are loaded newest first. The recent draw date and numbers match the first row of the history table. Display Data and Display History open those tables.

There is no login and no ticket retailer link.

## Run

Requires Node 22. This app still uses react-scripts 1.1.4, so the dev server needs the OpenSSL legacy provider. Do not expose the dev server. webpack-dev-server 2.9.4 is only for local development.

```
npm ci
NODE_OPTIONS=--openssl-legacy-provider npm start
```

Open http://localhost:3000.
