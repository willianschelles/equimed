#!/usr/bin/env sh
# Downloads the Tailwind CSS standalone CLI (no npm, no node_modules) pinned to one version.
# Usage: tools/setup-tailwind.sh   (writes tools/bin/tailwindcss, ignored by git)
set -eu
VERSION="v4.3.3"
case "$(uname -s)-$(uname -m)" in
  Darwin-arm64) ASSET="tailwindcss-macos-arm64" ;;
  Darwin-x86_64) ASSET="tailwindcss-macos-x64" ;;
  Linux-x86_64) ASSET="tailwindcss-linux-x64" ;;
  Linux-aarch64|Linux-arm64) ASSET="tailwindcss-linux-arm64" ;;
  *) echo "Plataforma não suportada: $(uname -s)-$(uname -m)" >&2; exit 1 ;;
esac
DIR="$(cd "$(dirname "$0")" && pwd)/bin"
mkdir -p "$DIR"
if [ -x "$DIR/tailwindcss" ] && "$DIR/tailwindcss" --help 2>&1 | grep -q "tailwindcss $VERSION"; then
  echo "Tailwind $VERSION já instalado."; exit 0
fi
curl -fsSL -o "$DIR/tailwindcss" "https://github.com/tailwindlabs/tailwindcss/releases/download/$VERSION/$ASSET"
chmod +x "$DIR/tailwindcss"
"$DIR/tailwindcss" --help 2>&1 | head -1
