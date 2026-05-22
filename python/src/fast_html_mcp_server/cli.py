"""
CLI entry point for fast-html-mcp-server.

Delegates to the Node.js server via ``npx @aimino/fast-html-mcp-server``.
"""

import subprocess
import sys
import shutil


def main() -> None:
    """Run the Node.js MCP server via npx."""
    npx = shutil.which("npx")
    if npx is None:
        print(
            "Error: npx not found. Install Node.js >= 20 from https://nodejs.org",
            file=sys.stderr,
        )
        sys.exit(1)

    cmd = [npx, "-y", "@aimino/fast-html-mcp-server"]
    try:
        proc = subprocess.run(cmd)
        sys.exit(proc.returncode)
    except KeyboardInterrupt:
        sys.exit(0)
    except FileNotFoundError:
        print(
            "Error: npx not found. Install Node.js >= 20 from https://nodejs.org",
            file=sys.stderr,
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
