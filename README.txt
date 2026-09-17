FANDI HASIB - PERSONAL GITHUB PAGES TEMPLATE
=============================================

Repository target:
https://github.com/fandihasib/github.io

Expected GitHub Pages address:
https://fandihasib.github.io/github.io/

The package is intentionally arranged without an extra parent directory inside
the ZIP. Upload or extract every file and folder directly into the repository
root on the main branch.

DEPLOYMENT
----------
1. Open the repository on GitHub.
2. Upload all extracted files and folders to the repository root.
3. Commit the files to the main branch.
4. Open Settings > Pages.
5. Under Build and deployment, choose Deploy from a branch.
6. Select main and / (root), then save.

ARTICLE PUBLISHING COMPATIBILITY
--------------------------------
This template is compatible with:
D:\publish_plugin\item_github.py

The integration depends on the following paths and behavior:

agent/publish-config.json
  - Identifies the GitHub Pages target.
  - contentSource must remain data/articles.json.
  - basePath must remain empty while the site lives at the repository root.

data/articles.json
  - Stores the article archive and complete article bodies.
  - New published entries are written here by the publishing integration.

assets/
  - Stores the portrait, engagement images and images added with articles.

article.html?id=ARTICLE_ID
  - Displays the published article matching ARTICLE_ID.

The home page and article archive read data/articles.json automatically, show
published entries only and sort the current article set from newest to oldest.
No article card needs to be edited manually after publication.

SUPPORTED ARTICLE STRUCTURE
---------------------------
Each article must include:
id, title, category, summary, readTime, date, tags, body and status.

The body object supports:
intro, heading1, section1, quote, heading2, section2 and close.

The article renderer safely supports paragraphs, strong and emphasized text,
links, lists and article images stored directly under assets/.

LOCAL PREVIEW
-------------
Use a local web server instead of opening index.html directly because browsers
block JSON requests from file:// pages.

No framework, package installation, build command or database is required.

CONTENT MAINTENANCE
-------------------
- Update personal profile data in data/profile.json.
- Update speaking appearances in data/appearances.json and speaking.html.
- Use data/articles.json or the publishing integration for articles.
- Keep factual claims, dates and contact information under human review.
