import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every web page during static rendering.
// The contents of this function only run in Node.js environments and do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* App Info */}
        <title>Buch AI - AI-Powered Story Generator</title>
        <meta name="description" content="Your personal AI-powered short story ideation and illustration companion" />
        <meta name="author" content="Buch AI Team" />
        {/* TODO: Add keywords for better SEO */}
        <meta name="keywords" content="AI, reading, stories, books, artificial intelligence, companion" />

        {/* Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicons - Multiple sizes for better browser support */}
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/favicon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon.png" />
        <link rel="icon" type="image/png" sizes="128x128" href="/assets/images/favicon@128.png" />
        <link rel="icon" type="image/png" sizes="256x256" href="/assets/images/favicon@256.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/assets/images/favicon@512.png" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="128x128" href="/assets/images/favicon@128.png" />
        <link rel="apple-touch-icon" sizes="256x256" href="/assets/images/favicon@256.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/assets/images/favicon@512.png" />
        
        {/* Apple Web App Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Buch AI" />
        
        {/* Android/Chrome Web App Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Buch AI" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/assets/images/favicon@256.png" />
        
        {/* Theme Colors */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-navbutton-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Open Graph Meta Tags for Social Sharing */}
        <meta property="og:title" content="Buch AI - AI-Powered Story Generator" />
        <meta property="og:description" content="Your personal AI-powered short story ideation and illustration companion" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/assets/images/favicon@512.png" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Buch AI - AI-Powered Story Generator" />
        <meta name="twitter:description" content="Your personal AI-powered short story ideation and illustration companion" />
        <meta name="twitter:image" content="/assets/images/favicon@512.png" />

        {/* 
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native. 
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`; 