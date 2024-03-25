import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useProgressBarAtTransition } from "@/hooks/useProgressBarAtTransition";

export default function App({ Component, pageProps }: AppProps) {
  useProgressBarAtTransition();
  return <Component {...pageProps} />;
}
