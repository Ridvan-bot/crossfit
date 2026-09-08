# Troubleshooting Log - Crossfit

## 0) Quick status

- Problem: Efter "Pass klart" syns passet fortfarande som ej utfört i GUI.
- Orsak: Session sparades och status blev `done` i DB, men listan `/workouts` revaliderades inte och client refresh saknades.
- Nästa steg: Verifiera i GUI efter deploy/reload — #008 ska stå som Genomfört.

## 4) Experiments and results

### 2026-09-08 - Cache/revalidate

- Bekräftat i DB: Pass #008 `status=done`, session med score sparad.
- Fix: `revalidatePath("/workouts")`, felkoll på status-update, `router.refresh()` efter sparning, svensk statusetikett.

## 1) Problem

Användaren fyller i Pass klart-formuläret men passlistan/dashboard visar fortfarande planned.

## 2) Hypoteser

1. `revalidatePath("/workouts")` saknas efter `logSession`.
2. Client-sheet anropar inte `router.refresh()` efter sparning.
3. Status-update misslyckas tyst (inga fel kollas).
