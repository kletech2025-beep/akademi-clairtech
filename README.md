# Akademi Clairtech

Site vitrine statique pour des cours et astuces autour de l'IA, pour les niveaux amateur et pro.

## Stack

- HTML, CSS et JavaScript natifs — aucun build, aucune dépendance.
- Hébergement statique (GitHub Pages via GitHub Actions).
- Vidéo de hero scrubbée au scroll, avec poster et repli statique.

## Structure

```
.
├── index.html                  # Structure et contenu fixe
├── styles.css                  # Design, motion system, responsive
├── app.js                      # Hero, cours, astuces, newsletter, interactions
├── assets/
│   ├── favicon.svg
│   ├── hero-poster.jpg         # Première image de la vidéo
│   └── hero-scrub.mp4          # 8 s, 1728×972, sans audio
├── .github/workflows/deploy.yml
└── .nojekyll
```

## Lancer en local

Un serveur local est nécessaire pour le chargement de la vidéo et le scrubbing.

```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

## Contenu

Les données sont dans `app.js` :

- `COURSES` : six cours, répartis entre les parcours `amateur` et `pro`.
- `TIPS` : douze astuces, catégories `prompting`, `tools`, `workflow`, `code`.
- Les cartes sont générées au chargement ; aucun CMS ni backend n'est branché.

La newsletter et les liens marqués `data-soon` sont des démonstrations. Ils affichent
un message « bientôt disponible » et doivent être branchés avant une mise en production.

## Vidéo du hero

Le hero utilise une vidéo de 8 secondes lue image par image selon le scroll
(600vh de section, scène sticky). Si la vidéo est remplacée :

1. Conserver un MP4 sans audio, adapté au scrubbing.
2. Garder le même ratio et une première image identique à `hero-poster.jpg`.
3. Mettre à jour `VIDEO_BYTES` dans `app.js` (valeur de repli avant `Content-Length`).

Le hero vidéo est désactivé sur mobile, en portrait, sur pointeur grossier en paysage
bas, et avec `prefers-reduced-motion: reduce`. Un hero statique prend alors le relais.

## Accessibilité et mouvement

- Lien d'évitement, focus visible, libellés ARIA et régions `aria-live`.
- Les révélations et animations respectent `prefers-reduced-motion`, y compris les
  changements de préférence à chaud.
- Les animations sont limitées à `transform`, `translate` et `opacity`.
- Les animations décoratives se mettent en pause hors écran et onglet masqué.

## Déploiement GitHub Pages

Le workflow `.github/workflows/deploy.yml` publie le site à chaque push sur `main`.

1. Créer le dépôt et pousser le projet sur la branche `main`.
2. Dans **Settings → Pages**, choisir **Source : GitHub Actions**.
3. Le workflow prépare `_site/` avec uniquement les fichiers publics, puis déploie.

Le workflow peut aussi être lancé manuellement depuis l'onglet **Actions**.

### Après le premier déploiement

Décommenter le bloc de déploiement dans `<head>` de `index.html` et remplacer
`https://example.com` par l'URL réelle :

- `og:image` (utiliser `assets/hero-poster.jpg`),
- `og:url`,
- `canonical`.

## Avant une mise en production

- Brancher la newsletter à un service d'e-mailing.
- Remplacer les liens `data-soon` par les vraies destinations.
- Vérifier les mentions légales et la politique de confidentialité.
- Tester le site sur mobile, au clavier, et avec `prefers-reduced-motion: reduce`.
