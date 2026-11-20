"use strict";
// Only the bundled module runs. Its scratch buffer is used synchronously after loading.
let melodicaModule;
async function melodicaCodec(bytes, key, decrypt) {
    melodicaModule ||= fetch("melodica-wire.wasm").then(r => {
        if (!r.ok) throw Error("Melodica codec could not load");
        return r.arrayBuffer();
    }).then(b => WebAssembly.instantiate(b)).then(m => m.instance.exports);
    const m = await melodicaModule;
    const start = Number(m.__heap_base.value);
    const keyBytes = new TextEncoder().encode(key);
    const keyAt = start + bytes.length;
    const required = keyAt + keyBytes.length;
    if (required > m.memory.buffer.byteLength) m.memory.grow(Math.ceil((required - m.memory.buffer.byteLength) / 65536));
    const memory = new Uint8Array(m.memory.buffer);
    memory.set(bytes, start);
    memory.set(keyBytes, keyAt);
    try {
        if (!m.melodica_wire_blocks(start, bytes.length, keyAt, keyBytes.length, Number(decrypt))) throw Error("Invalid Melodica request");
        return memory.slice(start, keyAt);
    } finally { memory.fill(0, start, required); }
}
async function encrypt(text) {
    const plain = new TextEncoder().encode(text);
    const bytes = new Uint8Array(Math.ceil(plain.length / 8) * 8);
    bytes.set(plain);
    return Array.from(await melodicaCodec(bytes, "6#26FRL$ZWD", false), b => b.toString(16).padStart(2, "0")).join("");
}
async function decryptTime(text) {
    if (!/^(?:[0-9a-f]{16})+$/i.test(text)) throw Error("Invalid tuner clock");
    const bytes = Uint8Array.from(text.match(/../g), h => parseInt(h, 16));
    return melodicaCodec(bytes, "R=U!LH$O2B#", true);
}
