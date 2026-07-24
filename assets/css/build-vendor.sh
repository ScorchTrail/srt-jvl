#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

cat \
  "$ROOT_DIR/base/variables.css" \
  "$ROOT_DIR/base/reset.css" \
  "$ROOT_DIR/base/layout.css" \
  "$ROOT_DIR/utilities/reveal.css" \
  "$ROOT_DIR/utilities/placeholders.css" \
  "$ROOT_DIR/components/buttons.css" \
  "$ROOT_DIR/components/navbar.css" \
  "$ROOT_DIR/sections/hero.css" \
  "$ROOT_DIR/components/floating-review.css" \
  "$ROOT_DIR/components/section-header.css" \
  "$ROOT_DIR/sections/services.css" \
  "$ROOT_DIR/components/service-card.css" \
  "$ROOT_DIR/sections/gallery.css" \
  "$ROOT_DIR/components/form.css" \
  "$ROOT_DIR/sections/reviews.css" \
  "$ROOT_DIR/components/reviewer.css" \
  "$ROOT_DIR/sections/about.css" \
  "$ROOT_DIR/sections/footer.css" \
  > "$ROOT_DIR/vendor.css"

# Create a minified production bundle.
perl -0777 -pe 's!/\*.*?\*/!!gs; s/[\n\r\t]+/ /g; s/\s{2,}/ /g; s/\s*([{}:;,>])\s*/$1/g; s/;}/}/g; s/^\s+|\s+$//g' "$ROOT_DIR/vendor.css" > "$ROOT_DIR/vendor.min.css"

echo "vendor.css and vendor.min.css rebuilt from module files."
