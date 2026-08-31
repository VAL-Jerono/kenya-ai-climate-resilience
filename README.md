# AI Climate Resilience Decision Engine — Kenya

A single-page decision-support dashboard for county climate adaptation
funding, built on the KHS 2023/24 model outputs (HistGradientBoosting +
DEA-BCC/CACI). Includes a county choropleth and a Groq-powered (Llama 3.3
70B) RAG assistant grounded on the 47-county dataset.

## What's in this project (5 files, on purpose)

```
index.html            -> the whole UI (map, KPIs, table, chat) — static
counties.json          -> the 47-county model output, used by the UI
kenya_counties.geojson  -> county boundary polygons, used by the choropleth
api/chat.js             -> serverless function: RAG endpoint calling Groq (llama-3.3-70b-versatile)
package.json             -> tells Vercel this is an ES module project
```

No framework, no build step, no database. Vercel serves `index.html`,
`counties.json` and `kenya_counties.geojson` as static files, and
`api/chat.js` as a serverless function at `/api/chat`.

## Deploy in 5 minutes

1. **Get a free Groq API key**
   Go to https://console.groq.com/keys and create a key (generous free tier, no credit card).

2. **Push this folder to a GitHub repo**
   ```bash
   cd kenya-ai-climate-resilience
   git init
   git add .
   git commit -m "Initial deployment"
   git branch -M main
   git remote add origin <your-empty-github-repo-url>
   git push -u origin main
   ```

3. **Import into Vercel**
   - Go to https://vercel.com/new
   - Import the GitHub repo you just pushed
   - Framework preset: leave as "Other" (no build command needed)
   - Click Deploy

4. **Add the environment variable**
   - In the Vercel project → Settings → Environment Variables
   - Add `GROQ_API_KEY` = *(the key from step 1)*
   - Redeploy (Deployments tab → ⋯ → Redeploy) so the function picks it up

5. **Open the deployed URL** — the map, KPIs and table work immediately;
   the chat assistant works once the key is set.

## Updating the data later

To refresh with new model outputs, just replace `counties.json` with a
new export in the same shape (see the field names inside the file) and
push again — no code changes needed. The choropleth and chat both read
from that one file.

## Extending later

- Swap `llama-3.3-70b-versatile` for another Groq model by editing one line
  in `api/chat.js` (see https://console.groq.com/docs/models).
- Add more metrics to the map: extend `METRIC_META` in `index.html` and
  add the matching field to `counties.json`.
- Add authentication or per-county drill-downs by adding more files
  under `/api/` — Vercel picks up any new file there automatically.
