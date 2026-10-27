# Janet Rodríguez — site

1. Create a GitHub repo, upload these files, and turn on Settings → Pages → Deploy from branch (main, root).
2. Edit `admin/config.yml`: set `repo` and `site_url`.
3. Open `https://YOUR-USERNAME.github.io/YOUR-REPO/admin/` and sign in with GitHub (a personal access token works; no server needed).
4. Edit content in the CMS. Each save is a commit and the site updates in a minute or two.

## Spanish only (for now)
The site currently shows Spanish only (`LANGS=['es']` in `index.html`; CMS reads `content/site.es.json`). English files are kept in `content/`.
To bring back EN/ES: set `LANGS=['en','es']` in `index.html` and replace `admin/config.yml` with `admin/config.bilingual.yml`.
