# Lucky Lotto

Lucky Lotto suggests Powerball and Mega Millions numbers from New York Open Data draw history. The draw requests are public and do not send an app token.

Powerball is `/`. Mega Millions is `/MegaMillions`. Each page shows a least-drawn combination (the five white balls and the special ball that appear least often in the loaded history) and five random lines. Random lines are sampled uniformly from the current matrix: Powerball is 5 numbers from 1–69 plus a Powerball from 1–26, and Mega Millions is 5 numbers from 1–70 plus a Mega Ball from 1–24. A line that has already won is not shown.

Draws are loaded newest first. The recent draw date and numbers match the first row of the history table. Display Data and Display History open those tables.

There is no login and no ticket retailer link.

## Run

Requires Node 22. Do not expose the dev server.

```
npm ci
BROWSER=none npm start
```

Open http://localhost:3000.

`.npmrc` sets `install-strategy=nested` so ESLint's ajv 6 does not hide the ajv 8 copy that webpack-dev-server needs. Node 22 starts this toolchain without `NODE_OPTIONS=--openssl-legacy-provider`.
