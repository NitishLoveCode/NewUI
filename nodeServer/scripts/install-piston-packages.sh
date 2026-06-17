#!/usr/bin/env sh
# Install Piston language packages after the stack is up.
# Usage: ./scripts/install-piston-packages.sh [host]
# Default host: http://localhost:2000

set -eu

HOST="${1:-http://localhost:2000}"

PACKAGES="
python=3.10.0
javascript=20.5.1
java=15.0.2
"

echo "Waiting for Piston at ${HOST}..."
for i in $(seq 1 30); do
  if curl -fsS "${HOST}/api/v2/runtimes" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo "Installing language packages..."
echo "${PACKAGES}" | while IFS= read -r line; do
  [ -z "${line}" ] && continue
  lang="${line%=*}"
  ver="${line#*=}"
  echo "  -> ${lang}@${ver}"
  curl -fsS -X POST "${HOST}/api/v2/packages" \
    -H "Content-Type: application/json" \
    -d "{\"language\":\"${lang}\",\"version\":\"${ver}\"}" \
    || echo "     (failed: ${lang}@${ver})"
done

echo "Done. Installed runtimes:"
curl -fsS "${HOST}/api/v2/runtimes" | head -c 4000
echo
