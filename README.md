# Janet Rodríguez — site (Spanish)

- Edit content at /admin/ (Sveltia CMS). Sidebar: Website (home page, menu, sections), Blog (one entry per post), Work (one entry per video / audio / writing / pictures piece).
- On every save, the GitHub Action in .github/workflows/deploy.yml builds the lists and publishes the site.
- One-time setup: Settings > Pages > Build and deployment > Source = GitHub Actions.
- Obsolete if present in the repo (safe to delete): admin/config.bilingual.yml, content/site.en.json, content/posts.en.json, content/posts.es.json.
