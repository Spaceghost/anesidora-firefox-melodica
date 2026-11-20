#!/bin/sh
set -eu
cd "$(dirname "$0")/source"
"${CC:-clang}" --target=wasm32 -nostdlib -Os -Wl,--no-entry -Wl,--export=melodica_wire_blocks -Wl,--export=__heap_base -Wl,--export-memory wire.c blowfish.c -o ../../common/melodica-wire.wasm
