# Dzieła zebrane Dominika Komendy

Statyczna strona z antologią 432 tytułów bugów założonych przez Dominika Komendę w Azure DevOps (U4TETA, styczeń 2025 – październik 2026).

Sekcje: przegląd ze statystykami i wykresem, trzy epoki z wyborem tytułów, poemat-cento, słowniczek, gra „Dokończ tytuł”, quiz z pytaniami, głosowanie na najlepszy tytuł i pełny katalog z wyszukiwarką.

## Pliki

- `index.html` – struktura i treść sekcji
- `styles.css` – style, motyw jasny i ciemny
- `app.js` – routing po hashu, wykres, gra, quiz, katalog
- `data.js` – 432 rekordy `[id, data, obszar, stan, tytuł]`
- `api/votes.js` – funkcja serverless Vercela do głosowania (Upstash Redis przez REST)

Brak builda i zależności. Czcionki ładowane z Google Fonts.

## Uruchomienie lokalne

Otwórz `index.html` w przeglądarce albo:

```
npx serve .
```

## Wdrożenie

1. `git init`, commit, push do nowego repozytorium na GitHubie.
2. Na Vercelu „Add New Project”, wskaż repozytorium, framework „Other”, katalog główny `.`. Bez komendy builda.

## Głosowanie

Głosy są wspólne dopiero po podłączeniu bazy. Bez niej strona działa w trybie lokalnym (głosy tylko w przeglądarce głosującego) i pokazuje o tym komunikat.

1. W projekcie na Vercelu: Storage → Create Database → Upstash Redis (plan Free) → Connect Project. Vercel sam doda zmienne `KV_REST_API_URL` i `KV_REST_API_TOKEN` (funkcja akceptuje też `UPSTASH_REDIS_REST_URL` i `UPSTASH_REDIS_REST_TOKEN`).
2. Zrób redeploy.

Każda przeglądarka ma 3 głosy (identyfikator głosującego w `localStorage`), kliknięcie w zaznaczony tytuł cofa głos. Dane w Redisie: hash `votes` (id → liczba głosów) i zbiory `voter:<id>`. Wyzerowanie rankingu: usuń te klucze w konsoli Upstash.

## Odświeżenie danych

Dane pobrano zapytaniem WIQL `WorkItemType = 'Bug' AND CreatedBy CONTAINS 'Komenda'` przez Boards API i zapisano do `data.js`. Lista tytułów rymowanych (`RYM` w `app.js`) i wybór do epok są ręczne.
