#!/usr/bin/env sh
# Install Piston language packages after the stack is up.
# Usage: ./scripts/install-piston-packages.sh [host]
# Default host: http://localhost:2000
#
# To see available packages: curl http://localhost:2000/api/v2/packages
# To see installed runtimes: curl http://localhost:2000/api/v2/runtimes
#
# Common language identifiers:
#  - python (not python3)
#  - node (not javascript)
#  - java
#  - cpp, c
#  - go, rust, ruby, php, etc.

set -eu

HOST="${1:-http://localhost:2000}"

# Note: Use 'node' for JavaScript/Node.js runtime
# Use stable versions that are widely available in Piston
PACKAGES="
python=3.10.0
node=18.15.0
java=15.0.2
cpp=10.2.0
c=10.2.0
"

echo "Waiting for Piston at ${HOST}..."
for i in $(seq 1 30); do
  if curl -fsS "${HOST}/api/v2/runtimes" >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo "Installing language packages..."
failed_packages=""
echo "${PACKAGES}" | while IFS= read -r line; do
  [ -z "${line}" ] && continue
  lang="${line%=*}"
  ver="${line#*=}"
  echo "  -> ${lang}@${ver}"
  if ! curl -fsS -X POST "${HOST}/api/v2/packages" \
    -H "Content-Type: application/json" \
    -d "{\"language\":\"${lang}\",\"version\":\"${ver}\"}"; then
    echo "     ✗ FAILED: ${lang}@${ver}"
    failed_packages="${failed_packages} ${lang}@${ver}"
  else
    echo "     ✓ Success"
  fi
done

echo ""
echo "Done. Installed runtimes:"
curl -fsS "${HOST}/api/v2/runtimes" | head -c 4000
echo ""

if [ -n "${failed_packages}" ]; then
  echo ""
  echo "⚠️  Some packages failed to install:${failed_packages}"
  echo "To see all available packages, run:"
  echo "  curl ${HOST}/api/v2/packages"
fi
