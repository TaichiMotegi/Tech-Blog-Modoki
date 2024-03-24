import dayjs from "dayjs";
import Link from "next/link";
import { FunctionComponent } from "react";
import { Post } from "@/pages";
import styles from "./index.module.css";

export const PostComponent: FunctionComponent<{
  post: Post;
}> = ({ post }) => {
  return (
    <div className={styles.post} key={post.id}>
      <h1 className={styles.title}>
        <Link href={`/post/${encodeURIComponent(post.slug ?? "")}`}>
          {post.title}
        </Link>
      </h1>
      <div className={styles.timestampWrapper}>
        <div>
          <div className={styles.timestamp}>
            作成日時: {dayjs(post.createdTs).format("YYYY-MM-DD HH:mm:ss")}
          </div>
          <div className={styles.timestamp}>
            更新日時: {dayjs(post.lastEditedTs).format("YYYY-MM-DD HH:mm:ss")}
          </div>
        </div>
      </div>
    </div>
  );
};
