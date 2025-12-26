# Speculative Decoding Demo

A visualization of LLM Speculative Decoding, demonstrating how a smaller "Draft Model" and a larger "Target Model" work together to accelerate text generation.

## Features
- **Visualized Workflow**: Step-by-step animation of drafting, verification, and correction.
- **Dual Model Representation**: Clear distinction between the fast draft model and accurate target model.
- **Parallel Verification**: Shows how the target model verifies multiple tokens at once.

## Usage

### Development
```bash
npm install
npm run dev
```

### Recording
To generate a 60fps video:
```bash
npm run record
```
The output will be saved to `../video_records/speculative_decoding_demo.mp4`.

## Tech Stack
- Vue 3
- Anime.js
- Tailwind CSS
- Puppeteer (for recording)
