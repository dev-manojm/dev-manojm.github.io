# Manoj More — Personal Portfolio

This repository contains the static portfolio website for Manoj More. The site is built from `index.html`, `styles.css`, `script.js`, and the curated public profile in `portfolio-data.json`.

## View the site

The GitHub repository page shows this README. The published website is served separately at [https://dev-manojm.github.io](https://dev-manojm.github.io) after the site files are on the publishing branch and GitHub Pages has completed its deployment.

In GitHub, open **Settings → Pages** and set **Build and deployment → Source** to **Deploy from a branch**, then select `main` and `/(root)`. GitHub Pages will publish the root-level `index.html` and site assets whenever changes reach `main`.

## Update public profile content

Edit `portfolio-data.json` with reviewed, public-safe information. Keep the private master profile, resumes, direct contact details, source documents, job-search history, app data, `.env` files, and keys out of this repository. Run `python verify_public_data.py` before committing a profile-data change.

The private-workspace link stays disabled until an authenticated HTTPS URL is configured in `portfolio-config.js`.
