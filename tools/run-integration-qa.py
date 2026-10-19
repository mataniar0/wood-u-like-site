"""Compatibility entry point: current portable full QA, artifacts outside Git."""
import sys
from qa import main

if __name__ == "__main__":
    raise SystemExit(main(["--mode", "full", *sys.argv[1:]]))
