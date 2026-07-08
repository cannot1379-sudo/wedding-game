import "./globals.css";
import IABWarning from "@/components/IABWarning";

export const metadata = {
  title: "婚禮互動問答遊戲",
  description: "一起來參與我們的婚禮問答吧！",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body>
        <IABWarning />
        {children}
      </body>
    </html>
  );
}
