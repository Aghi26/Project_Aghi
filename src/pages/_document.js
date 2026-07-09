import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        <title>Jakarta Events — Portal Event Terbaik di Jakarta</title>
        <meta name="description" content="Temukan dan abadikan setiap momen di Jakarta. Portal event terbaik untuk konser, comedy, theater, dan festival." />
        <meta name="keywords" content="jakarta, events, konser, concert, comedy, theater, festival" />
        <meta name="theme-color" content="#2563EB" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta property="og:title" content="Jakarta Events — Portal Event Terbaik di Jakarta" />
        <meta property="og:description" content="Temukan dan abadikan setiap momen di Jakarta. Portal event terbaik untuk konser, comedy, theater, dan festival." />
        <meta property="og:image" content="/og-image.svg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Jakarta Events — Portal Event Terbaik di Jakarta" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jakarta-events.vercel.app" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Jakarta Events — Portal Event Terbaik di Jakarta" />
        <meta name="twitter:description" content="Temukan dan abadikan setiap momen di Jakarta" />
        <meta name="twitter:image" content="/og-image.svg" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
