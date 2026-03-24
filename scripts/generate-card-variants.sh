#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="${1:-$ROOT_DIR/assets/cards}"
OUT_DIR="${2:-$ROOT_DIR/assets/cards-low}"
MAX_EDGE_PX="${3:-640}"

if [[ ! -d "$SRC_DIR" ]]; then
  echo "Source directory not found: $SRC_DIR" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

render_with_sips() {
  local source_path="$1"
  local output_path="$2"
  sips -s format png -Z "$MAX_EDGE_PX" "$source_path" --out "$output_path" >/dev/null
}

render_with_magick() {
  local source_path="$1"
  local output_path="$2"
  magick "$source_path" -resize "${MAX_EDGE_PX}x${MAX_EDGE_PX}>" "$output_path"
}

renderer=""
if command -v sips >/dev/null 2>&1; then
  renderer="sips"
elif command -v magick >/dev/null 2>&1; then
  renderer="magick"
else
  echo "Missing image tool: install 'sips' (macOS) or ImageMagick ('magick')." >&2
  exit 1
fi

count=0
shopt -s nullglob
for source_file in "$SRC_DIR"/*.png; do
  base_name="$(basename "$source_file")"
  out_file="$OUT_DIR/$base_name"
  if [[ "$renderer" == "sips" ]]; then
    render_with_sips "$source_file" "$out_file"
  else
    render_with_magick "$source_file" "$out_file"
  fi
  count=$((count + 1))
done
shopt -u nullglob

echo "Generated $count variants in $OUT_DIR (max edge ${MAX_EDGE_PX}px)."
