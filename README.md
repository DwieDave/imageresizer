# Light ImageResizer

A lightweight, browser-based image processing application that runs completely in your browser without needing a server.

## Features

- **No server required** - All processing happens locally in your browser
- **Parallel processing** - Multiple images processed simultaneously using Web Workers
- **Image manipulation** - Resize, compress, and convert images to various formats (JPEG, PNG, WebP, AVIF, GIF, SVG)
- **Real-time progress** - Live progress updates as images are processed
- **Batch download** - Results automatically packaged as a ZIP file

## Architecture

The application uses a pragmatic, flat architecture optimized for browser-based image processing:

### Directory Structure

```
src/
├── lib/              # Core business logic
│   ├── types.ts      # Domain types (Image, Configuration, ImageId, etc.)
│   ├── state.ts      # Atom definitions for reactive state
│   ├── imagemagick.ts # ImageMagick WASM service
│   ├── worker-pool.ts # Worker pool orchestration
│   ├── worker.ts      # Web Worker implementation
│   ├── download.ts    # Download and ZIP functionality
│   └── utils.ts       # Shared utilities
├── components/       # React UI components
│   ├── settings/     # Configuration panels
│   └── ui/           # Reusable UI components
├── hooks/            # React hooks
└── test/             # Test files
```

### Core Components

- **types.ts** - Discriminated union types for Image state (processed/unprocessed)
- **state.ts** - Pure Atom definitions for UI state management with no business logic
- **imagemagick.ts** - WASM service wrapper with proper error handling and initialization
- **worker-pool.ts** - Dynamic worker pool that scales based on CPU cores and image count
- **worker.ts** - Web Worker that processes individual images using ImageMagick WASM

### Technology Stack

- **[Effect](https://github.com/Effect-TS/effect)** - Functional effect system for composable async operations
- **[React](https://react.dev/)** - UI framework
- **[ImageMagick WASM](https://github.com/dlemstra/magick-wasm)** - Image processing library compiled to WebAssembly
- **[Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)** - Parallel processing without blocking UI
- **Vite** - Fast build tool and dev server

### Why This Architecture?

This is a browser-only application, not a distributed system:

- **No layers** - No need for domain/application/infrastructure separation
- **No circular dependencies** - Clear data flow from state → components → effects
- **Flat organization** - All core logic in `/src/lib/` focused on specific concerns
- **No overengineering** - Simple enough to maintain, powerful enough to scale

## Development

### Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173 and upload images to get started.

### Testing

```bash
# Run all tests
npm test

# Unit tests cover:
# - Worker pool sizing calculations
# - Image input preparation
# - Edge cases (empty inputs, all processed, scaling)
```

**Note:** ImageMagick WASM tests require a browser environment. Verify functionality by:

1. Running the dev server: `npm run dev`
2. Uploading test images via the UI
3. Checking browser DevTools console for any errors
4. Verifying output files download correctly

### Building

```bash
npm run build
```

The build produces optimized chunks:

- **effect-*.js** (252KB) - Effect library chunk for better caching
- **index-*.js** (717KB) - Application and dependencies
- **magick-*.wasm** (14.4MB) - ImageMagick WASM binary
- **worker-*.js** (462KB) - Web Worker code

## Performance

- **Dynamic worker pool** - Automatically scales from 1 to N workers based on CPU cores
- **Real-time progress** - Progress updates stream as each image completes, not waiting for all
- **Parallel processing** - Multiple images processed simultaneously
- **Lazy loading** - WASM module loads on-demand when first image is processed

## Error Handling

User-friendly error messages with actionable advice:

- **WASM errors** - Suggests refreshing the page
- **Worker errors** - Indicates processing worker issue
- **Memory errors** - Suggests processing fewer/smaller images
- **Debug info** - Console logs available via DevTools (F12)
