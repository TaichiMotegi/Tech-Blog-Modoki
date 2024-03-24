import { Html, Head, Main, NextScript } from "next/document";

const Index = () => {
  return (
    <Html>
      <Head>
        <link
          rel="stylesheet"
          href={
            "https://fonts.googleapis.com/css2" +
            "?family=Noto+Sans+JP:wght@400;500;700;" +
            "&display=swap"
          }
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};
export default Index;
