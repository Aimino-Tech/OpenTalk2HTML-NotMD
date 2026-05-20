#!/usr/bin/env bash
# Fast HTML MCP Server wrapper
# Detects the best available Node.js version (>=20 required)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Try to find a suitable node binary (>=20)
find_node() {
  # Check if current node in PATH works (>=20)
  if command -v node &>/dev/null; then
    local ver
    ver=$(node -e "console.log(process.version.slice(1).split('.')[0])" 2>/dev/null)
    if [ "$ver" -ge 20 ] 2>/dev/null; then
      echo "node"
      return 0
    fi
  fi

  # Scan NVM directory if it exists
  if [ -n "${NVM_DIR-}" ] && [ -d "$NVM_DIR/versions/node" ]; then
    for dir in "$NVM_DIR/versions/node"/*; do
      if [ -f "$dir/bin/node" ]; then
        local ver
        ver=$("$dir/bin/node" -e "console.log(process.version.slice(1).split('.')[0])" 2>/dev/null)
        if [ "$ver" -ge 20 ] 2>/dev/null; then
          echo "$dir/bin/node"
          return 0
        fi
      fi
    done
  fi

  # Scan ~/.nvm if it exists
  if [ -d "$HOME/.nvm/versions/node" ]; then
    for dir in "$HOME/.nvm/versions/node"/*; do
      if [ -f "$dir/bin/node" ]; then
        local ver
        ver=$("$dir/bin/node" -e "console.log(process.version.slice(1).split('.')[0])" 2>/dev/null)
        if [ "$ver" -ge 20 ] 2>/dev/null; then
          echo "$dir/bin/node"
          return 0
        fi
      fi
    done
  fi

  # Check mise-managed node versions
  if command -v mise &>/dev/null; then
    local mise_node
    mise_node="$(mise which node 2>/dev/null || true)"
    if [ -n "$mise_node" ] && [ -x "$mise_node" ]; then
      local ver
      ver=$("$mise_node" -e "console.log(process.version.slice(1).split('.')[0])" 2>/dev/null)
      if [ "$ver" -ge 20 ] 2>/dev/null; then
        echo "$mise_node"
        return 0
      fi
    fi
  fi

  echo "node"  # fallback
}

NODE_BIN=$(find_node)
exec "$NODE_BIN" "$SCRIPT_DIR/dist/index.js"
