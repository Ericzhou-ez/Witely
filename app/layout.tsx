import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { SettingsModal } from "@/components/settings-modal";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://chat.vercel.ai"),
  title: "Witely",
  description:
    "Never Copy & Paste Again; Witely Gives You the Anwsers You Need, Before You Ask",
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

const geist = Roboto({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

const geistMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

const LIGHT_THEME_COLOR = "hsl(0 0% 100%)";
const DARK_THEME_COLOR = "hsl(240deg 10% 3.92%)";
const PAPER_THEME_COLOR = "hsl(40 40% 96%)";
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    var isPaper = html.classList.contains('paper');
    var color = isPaper ? '${PAPER_THEME_COLOR}' : (isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
    meta.setAttribute('content', color);
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})()`;

/**
 * Root layout component for the Witely application.
 * This layout sets up the foundational structure for the app, including:
 * - Google Fonts (Roboto and Roboto Mono) for consistent typography.
 * - Metadata for SEO and page description.
 * - Viewport configuration to prevent zoom on mobile.
 * - A client-side script to dynamically update the theme-color meta tag based on the current theme (light, dark, paper).
 * - Providers for session management (NextAuth), theming (Next Themes), and toast notifications (Sonner).
 * - The SettingsModal component for user settings access.
 *
 * The layout ensures no hydration mismatches by suppressing warnings on the html element,
 * as required by next-themes.
 *
 * @param {Object} props - The props for the layout component.
 * @param {React.ReactNode} props.children - The child components to be rendered inside the layout.
 * @returns {JSX.Element} The complete HTML document structure with all providers and children.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className={`${geist.variable} ${geistMono.variable}`}
      // `next-themes` injects an extra classname to the body element to avoid
      // visual flicker before hydration. Hence the `suppressHydrationWarning`
      // prop is necessary to avoid the React hydration mismatch warning.
      // https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
      lang="en"
      suppressHydrationWarning
    >
      <head>
        {/* 
          Test: Verify that the theme color script is injected correctly and updates the meta tag
          on theme class changes (e.g., add 'dark' class to html and check meta content).
        */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required"
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased">
        {/* 
          Test: Ensure SessionProvider wraps all content and provides auth context to children.
          Mock NextAuth session in tests to verify prop drilling.
        */}
        <SessionProvider>
          {/* 
            Test: Confirm ThemeProvider applies correct classes based on system/default theme,
            and themes array includes 'light', 'dark', 'paper', 'system'.
            Test disableTransitionOnChange prevents flicker.
          */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
            enableSystem
            themes={["light", "dark", "paper", "system"]}
          >
            {/* 
              Test: Verify Toaster is positioned at top-center and handles multiple toast types.
            */}
            <Toaster position="top-center" />
            {/* 
              Test: Render children within providers and ensure no hydration errors.
              Snapshot test the overall structure.
            */}
            {children}
            {/* 
              Test: Check that SettingsModal is rendered as a portal/outside main flow,
              and opens/closes without affecting layout.
            */}
            <SettingsModal />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
