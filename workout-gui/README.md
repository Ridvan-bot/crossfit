# Workout GUI

Två vyer för träning. Starta alltid via väljaren:

```bash
open workout-gui/index.html
```

| Fil | Läge |
| --- | --- |
| `index.html` | Välj mellan GUI |
| `phone.html` | Telefon / porträtt – en del i taget |
| `tavla.html` | Landscape tavla (chalk) – full bredd + timer + vikter |

## Telefon (`phone.html`)

- Välj pass (#007, #008)
- En del i taget (Warmup → Teknik → Styrka → Metcon)
- Timer: nedräkning, stoppur, EMOM

## Tavla (`tavla.html`)

- Designad för **liggande skärm** (landscape), kant till kant
- Ser ut som CrossFit-tavla (vit “krita” på svart)
- Format (AMRAP / FOR TIME), rörelser och **vikter i parentes**
- Stor timer till höger: START / PAUS / RESET

## Lokal server (telefon över Wi‑Fi)

```bash
cd workout-gui && python3 -m http.server 8765
```

Besök `http://<din-dator-ip>:8765` från telefonen.

## Uppdatera pass

Passdata ligger i respektive HTML (`const PASSES = [...]`).  
Källa till sanning: `docs/training-log.md`.
