import { Inter } from 'next/font/google';
import localFont from "next/font/local";
import "./globals.css";
const inter = Inter({ subsets: ['latin'] });



const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: 'Log Analytics Platform',
  description: 'Real-time monitoring and analysis of application logs across multiple services',
  icons: {
    icon: [
      { url: '/icons/research3.png' },
      { url: '/icons/research3.png', type: 'image/png' },
    ],
    apple: '/icons/research3.png',
  },
};



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
