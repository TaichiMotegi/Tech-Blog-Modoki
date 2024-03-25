import { FunctionComponent, ReactNode } from "react";
import Link from "next/link";
import styles from "./index.module.css";

export const Layout: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <div>
      <header className={styles.headerWrapper}>
        <div className={styles.headerItem}>
          <Link className={styles.headerLink} href="/">
            TechBlog Modoki
          </Link>
        </div>
      </header>
      <div className={styles.wrapper}>
        {children}
        {/* フッター */}
        <footer className={styles.footer}>
          <div>Copyright © All rights reserved | TechBlog Modoki</div>
        </footer>
      </div>
    </div>
  );
};
