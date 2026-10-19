"""Lossless public summary transport below GitHub's 4 KiB annotation limit."""
import base64
import gzip
import json
import zlib


def chunks(value):
    text = base64.b64encode(gzip.compress(json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode(), mtime=0)).decode()
    return [text[i:i+2800] for i in range(0, len(text), 2800)]


def unpack(parts):
    assert 0 < len(parts) <= 100 and all(len(part) <= 2800 for part in parts)
    decoder = zlib.decompressobj(31)
    raw = decoder.decompress(base64.b64decode("".join(parts), validate=True), 2_000_000)
    assert decoder.eof and not decoder.unconsumed_tail and not decoder.unused_data, "Incomplete or oversized evidence"
    return json.loads(raw)
