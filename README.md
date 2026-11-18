# Pressure Atlas
Boodi Puneeth Reddy’s independent SupeRR Selector Season 2 entry. Explore the frozen v1.6 IPL pressure rankings, compare cutoff sensitivity, and replay three complete qualifying overs.

## Run locally
Open dist/index.html in a modern browser. To serve it over HTTP, run:
```
python -m http.server 8000 --directory dist
```
Then open http://localhost:8000. To make a single offline file including the report, run:
```
python build_offline.py Pressure-Atlas.html
```

## Files
- dist/index.html — semantic page, scorebox, player index, cutoff comparison and method.
- dist/style.css — RR-inspired palette, responsive grids, focus states and reduced-motion styles.
- dist/instruments.js — shared interval chart, delivery arithmetic and spotlight motion.
- dist/app.js — profile selection, cutoff switch, replay playback and scrubbing.
- dist/data.js — selected frozen results and descriptive over summaries.
- dist/stadium.jpg — illustrative generated stadium artwork.
- dist/report.pdf — submission report with methods and source tables.
- build_offline.py — standard-library offline packager.

## Reading the site
Intervals and floors use runs of impact per six pressure balls. Ranks are determined by the 20th percentile of modeled impact (floor). Percentages are rounded for display. The two batting cutoff views are separate frozen results. Replay score changes use actual team runs and wickets. The selected overs are each player's best complete qualifying Crunch over. Their impact includes the six-run wicket term. The held-out backtest was inconclusive.

All interactivity runs in the browser. Publish dist/ with any static host. GitHub repository visibility and website hosting are separate settings.
