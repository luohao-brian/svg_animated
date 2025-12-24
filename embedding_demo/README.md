# Embedding Visualization Demo

A high-quality SVG animation explaining the concept of **Word Embeddings (Word2Vec)** using an intuitive analogy to MBTI personality tests.

## 🎬 Project Overview

This visualization breaks down the abstract concept of high-dimensional vector spaces into three understandable steps:
1.  **Analogy**: Mapping human personality traits (MBTI) to numerical vectors.
2.  **Mechanism**: Explaining how Cosine Similarity measures the "closeness" (semantic similarity) between vectors.
3.  **Application**: Demonstrating how words are embedded in a semantic space where arithmetic operations (e.g., King - Man + Woman = Queen) reveal meaning.

## ✨ Key Features

-   **Scene 1: Digitizing Personality**: Optimized Left-Right layout. Jay (character) on the left, with MBTI results, Radar Chart, and Vector Card stacking vertically on the right for clear sequential data flow.
-   **Scene 1.5: Cosine Similarity**: Interactive demo showing how the angle between vectors determines their similarity score.
-   **Scene 2: Finding Soulmates**: Visualizing vector matching in a coordinate system, with optimized label placement to prevent overlaps.
-   **Scene 3 & 4: Word Personalities & Clustering**: Transitioning from people to words, showing how semantic clusters (Animals, Fruits, Actions) form naturally.
-   **Scene 5: Vector Arithmetic**: The famous "King - Man + Woman = Queen" example, visualized through vector subtraction and addition.

## 🛠 Tech Stack

-   **Framework**: Vue 3 (Composition API)
-   **Styling**: Tailwind CSS
-   **Animation**: Anime.js + Native SVG
-   **Build Tool**: Vite

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Visit `http://localhost:5173` to view the animation.

### 3. Record Video
```bash
npm run record
```
This will generate a high-quality 60fps MP4 video of the animation in the `output` directory (requires FFmpeg).

## 📝 Design & Script

For a detailed breakdown of the storyboard and script, please refer to [embedding_design.md](./embedding_design.md).
