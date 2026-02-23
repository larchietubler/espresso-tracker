# Espresso Tracker

A simple web app for dialling in your espresso machine. Log each shot, track your parameters, and spot patterns as you zero in on the perfect cup.

## What it does

Log a shot with:

- **Blend** — the coffee you're using
- **Grind setting** — whatever scale your grinder uses
- **Dose** — coffee in (grams)
- **Yield** — espresso out (grams), with the brew ratio calculated automatically
- **Extraction time** — in seconds
- **Flavour profile** — rate acidity, sweetness, bitterness, and body on a 1–5 slider
- **Notes** — anything else worth remembering

Your shot history is shown below the form, newest first. Blend, grind setting, and dose are remembered between shots so you only need to change what's different.

## Getting started

No install or build step needed — it's just HTML, CSS, and JavaScript.

1. Clone or download the repo
2. Open `index.html` in your browser
3. Start pulling shots

Everything is saved in your browser's `localStorage`, so your history sticks around between sessions.

## Dialling in tips

- Aim for a **1:2 ratio** (e.g. 18 g dose → 36 g yield) as a starting point
- A good extraction usually falls between **25–35 seconds**
- Too bitter or long? **Coarsen** the grind
- Too sour or short? **Fine** the grind
- Use the notes field freely — small observations add up

## Files

```
index.html   — the app UI
app.js       — all the logic (storage, rendering, form handling)
style.css    — styles
```
