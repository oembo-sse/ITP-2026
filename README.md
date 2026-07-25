# Presentation

## Requirements

- [Rust](https://rust-lang.org/)
- [cargo-watch](https://github.com/watchexec/cargo-watch): `cargo install cargo-watch`
- [wasm-pack](https://wasm-bindgen.github.io/wasm-pack/)
- [just](https://github.com/casey/just): `cargo install just`
- [nvm/node/npm](https://nodejs.org/en/download)

## Developing

Open the project in vscode, and visit `App.tsx`. It contains the list of slides where one can go and edit their contents.

```bash
just wasm
npm install
npm run dev
```

Visit [http://localhost:5173/ITP-2026/](http://localhost:5173/ITP-2026/) in the browser.
