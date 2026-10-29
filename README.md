# Dzieła zebrane Dominika Komendy

Statyczna strona z antologią 432 tytułów bugów założonych przez Dominika Komendę w Azure DevOps (U4TETA, styczeń 2025 – październik 2026).

Sekcje: przegląd ze statystykami i wykresem, trzy epoki z wyborem tytułów, poemat-cento, słowniczek, gra „Dokończ tytuł”, quiz z pytaniami i pełny katalog z wyszukiwarką.

## Pliki

- `index.html` – struktura i treść sekcji
- `styles.css` – style, motyw jasny i ciemny
- `app.js` – routing po hashu, wykres, gra, quiz, katalog
- `data.js` – 432 rekordy `[id, data, obszar, stan, tytuł]`

Brak builda i zależności. Czcionki ładowane z Google Fonts.

## Uruchomienie lokalne

Otwórz `index.html` w przeglądarce albo:

```
npx serve .
```

## Wdrożenie

1. `git init`, commit, push do nowego repozytorium na GitHubie.
2. Na Vercelu „Add New Project”, wskaż repozytorium, framework „Other”, katalog główny `.`. Bez komendy builda.

## Odświeżenie danych

Dane pobrano zapytaniem WIQL `WorkItemType = 'Bug' AND CreatedBy CONTAINS 'Komenda'` przez Boards API i zapisano do `data.js`. Lista tytułów rymowanych (`RYM` w `app.js`) i wybór do epok są ręczne.
