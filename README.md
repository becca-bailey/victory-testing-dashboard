# Victory Testing Dashboard

This is an example project built with [Next.js](https://nextjs.org) used to test Victory with different rendering methods and amounts of data. Right now, it contains a data dashboard at the root, and a series of non-Victory examples. Each page is configured to use query params for configuration.

This app is deployed at https://victory-testing-dashboard.netlify.app/.

Example query params:

- `animate` - true/false, corresponds to Victory's animate prop
- `canvas` - true/false, enables VictoryCanvas components rather than SVG.

## Examples

- [SVG](https://victory-testing-dashboard.netlify.app/examples/population-svg)
- [Canvas](https://victory-testing-dashboard.netlify.app/examples/population-canvas)
- [Canvas + OffscreenCanvas](https://victory-testing-dashboard.netlify.app/examples/population-offscreen-canvas)

Check out [this blog post](https://formidable.com/blog/2021/data-viz-1/) to learn more!

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
