import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EVLAB — EV Design & Simulation Platform',
  description: 'Design, simulate and optimize electric vehicle powertrains with an interactive, high-fidelity engineering platform.',
  keywords: ['EV', 'Electric Vehicle', 'Powertrain', 'Simulation', 'Automotive Engineering', 'Battery', 'PMSM', 'WLTP', 'Design'],
  authors: [{ name: 'EVLAB Engineering' }],
  openGraph: {
    title: 'EVLAB — EV Design & Simulation Platform',
    description: 'Design, simulate and optimize electric vehicle powertrains with an interactive, high-fidelity engineering platform.',
    type: 'website',
    locale: 'en_US',
    siteName: 'EVLAB',
  },
};

export const viewport: Viewport = {
  themeColor: '#090D14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var raw = localStorage.getItem('evlab_preferences');
                  var theme = 'dark';
                  if (raw) {
                    var parsed = JSON.parse(raw);
                    if (parsed && (parsed.theme === 'light' || parsed.theme === 'dark')) {
                      theme = parsed.theme;
                    }
                  }
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);
                  document.documentElement.style.colorScheme = theme;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-electric-500/20 selection:text-electric-400">
        {children}
      </body>
    </html>
  );
}
