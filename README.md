# Relevant XKCD

A simple search engine for XKCD comics, based on openai embeddings.

## Indexing

```bash
curl -X POST "http://localhost:3000/api/index-day?day=1&endDay=3056" (protected by randomized key if set up in .dev)
```

## Searching

```bash
curl "http://localhost:3000/api/search?q=xkcd"
```
