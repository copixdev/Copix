# Copix public site

This branch redirects [https://copixdev.github.io/copix/](https://copixdev.github.io/copix/) to [https://copixdev.github.io/](https://copixdev.github.io/).

JavaScript sends the visitor to the new site and keeps the path, query, and hash (`#install`, `#demo`). A meta refresh is the fallback, and the script rewrites that refresh URL to the same target.

The site source now lives in [copixdev/copixdev.github.io](https://github.com/copixdev/copixdev.github.io).
