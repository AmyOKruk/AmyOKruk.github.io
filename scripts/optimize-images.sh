#!/usr/bin/env bash
#
# optimize-images.sh — resize/recompress images in place for the web.
#
# Why: homepage thumbnails render at ~200px wide but the source files are
# full-size (e.g. a 1.2 MB WebP). This downscales them to a sensible max width
# and re-encodes, typically cutting file size by ~90% with no visible quality
# loss at thumbnail size. Filenames and formats are preserved, so references
# from your Google Sheet keep working.
#
# Usage:
#   ./scripts/optimize-images.sh [directory] [max-width]
#
# Examples:
#   ./scripts/optimize-images.sh                     # images/main, 900px
#   ./scripts/optimize-images.sh images/main 800
#   ./scripts/optimize-images.sh projects/images 1200
#
# Requirements (macOS): sips (built in) for PNG/JPEG, cwebp/dwebp for WebP
#   Install WebP tools if missing:  brew install webp
#
# Safety: edits files in place. Commit or stash first so git can restore them.

set -euo pipefail

DIR="${1:-images/main}"
MAX_WIDTH="${2:-900}"
WEBP_QUALITY="${WEBP_QUALITY:-80}"
JPEG_QUALITY="${JPEG_QUALITY:-80}"

if [[ ! -d "$DIR" ]]; then
  echo "Directory not found: $DIR" >&2
  exit 1
fi

have() { command -v "$1" >/dev/null 2>&1; }

human() { # bytes -> human readable
  awk -v b="$1" 'BEGIN{ split("B KB MB GB",u); i=1; while(b>=1024 && i<4){b/=1024;i++} printf "%.1f %s", b, u[i] }'
}

filesize() { stat -f%z "$1" 2>/dev/null || stat -c%s "$1" 2>/dev/null; }

width_of() { sips -g pixelWidth "$1" 2>/dev/null | awk '/pixelWidth/{print $2}'; }

total_before=0
total_after=0
count=0

shopt -s nullglob nocaseglob
for f in "$DIR"/*.{webp,png,jpg,jpeg}; do
  [[ -f "$f" ]] || continue

  w="$(width_of "$f")"
  before="$(filesize "$f")"
  ext="$(echo "${f##*.}" | tr '[:upper:]' '[:lower:]')"

  if [[ -z "$w" ]]; then
    echo "skip  $f (couldn't read dimensions)"
    continue
  fi

  # PNG/JPEG that are already narrow enough gain little from resizing, so skip
  # them. WebP always continues so it can be recompressed (lossy) even at width.
  if (( w <= MAX_WIDTH )) && [[ "$ext" != "webp" ]]; then
    echo "keep  $f (${w}px, $(human "$before"))"
    continue
  fi

  # Target width never upscales: shrink to MAX_WIDTH, else keep native width.
  target=$(( w < MAX_WIDTH ? w : MAX_WIDTH ))

  tmp="$(mktemp -t optimg).${ext}"
  case "$ext" in
    webp)
      if ! have cwebp || ! have dwebp; then
        echo "skip  $f (need cwebp/dwebp: brew install webp)"
        rm -f "$tmp"; continue
      fi
      # Animated WebPs can't be decoded by dwebp; leave them untouched.
      if have webpmux; then
        frames="$(webpmux -info "$f" 2>/dev/null | awk '/Number of frames/{print $NF}')"
        if [[ -n "$frames" && "$frames" -gt 1 ]]; then
          echo "keep  $f (animated, ${frames} frames — re-export manually if needed)"
          rm -f "$tmp"; continue
        fi
      fi
      # Always re-encode WebP (even if not resizing) so poorly-compressed
      # source files get squeezed down to WEBP_QUALITY.
      png_tmp="$(mktemp -t optimg).png"
      dwebp -quiet "$f" -o "$png_tmp"
      cwebp -quiet -q "$WEBP_QUALITY" -resize "$target" 0 "$png_tmp" -o "$tmp"
      rm -f "$png_tmp"
      ;;
    png)
      cp "$f" "$tmp"
      sips --resampleWidth "$MAX_WIDTH" "$tmp" >/dev/null
      ;;
    jpg|jpeg)
      cp "$f" "$tmp"
      sips --resampleWidth "$MAX_WIDTH" -s formatOptions "$JPEG_QUALITY" "$tmp" >/dev/null
      ;;
  esac

  after="$(filesize "$tmp")"
  # Only replace if we actually saved space.
  if (( after > 0 && after < before )); then
    mv "$tmp" "$f"
    saved=$(( before - after ))
    pct=$(awk -v s="$saved" -v b="$before" 'BEGIN{printf "%.0f", (s/b)*100}')
    echo "opt   $f  ${w}px -> ${MAX_WIDTH}px  $(human "$before") -> $(human "$after")  (-${pct}%)"
    total_before=$(( total_before + before ))
    total_after=$(( total_after + after ))
    count=$(( count + 1 ))
  else
    rm -f "$tmp"
    echo "keep  $f (already optimal)"
  fi
done

echo
if (( count > 0 )); then
  echo "Optimized $count file(s): $(human "$total_before") -> $(human "$total_after")"
else
  echo "Nothing to optimize in $DIR (all files <= ${MAX_WIDTH}px)."
fi
