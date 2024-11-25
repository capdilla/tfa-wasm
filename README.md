# 2FA Authenticator Web App

## Motivation

So, there I was, bored out of my mind and in desperate need of a 2FA app to secure my accounts. Naturally, like any reasonable person, I thought, “Why pay $15 for a perfectly functional app when I could spend an entire day learning WebAssembly, Rust, and building my own web app instead?” I mean, who wouldn’t jump at the chance to turn a simple problem into a wildly overcomplicated project? Money saved, right? Totally worth it. 🙃

## How to run

1. Install wasm and rust
2. npm install
3. npm run wasm:dev // this build the wasm for dev mode
4. npm run dev

## Build

build wasm for prod

```bash
 npm run wasm:build
```

build nextjs app

```
npm run build
```


### Notes

This implementation uses totp_rs, but since the library doesn’t support WebAssembly (WASM), I had to create [this fork](https://github.com/capdilla/totp-rs/commit/c451715d93a15fab584aedeae24bb6c1d5bddb6f) to make it work.

### Demo 

[You can check the demo here](https://tfa.capdilla.io/)