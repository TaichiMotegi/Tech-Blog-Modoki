import dayjs from "dayjs";
import Link from "next/link";
import { FunctionComponent } from "react";
import { Post } from "@/pages";
import styles from "./index.module.css";

export const PostComponent: FunctionComponent<{
  post: Post;
}> = ({ post }) => {
  return (
    <div className={styles.itemWrapper} key={post.id}>
      <Link href={`/post/${encodeURIComponent(post.slug ?? "")}`}>
        <div className={styles.imageWrapper}>
          <img className={styles.image} src={post.thumbnail} alt="Thumbnail" />
        </div>
      </Link>
      <h1 className={styles.title}>{post.title}</h1>
      <div className={styles.timestampWrapper}>
        <div>
          <div className={styles.timestamp}>
            Created：{dayjs(post.createdTs).format("YYYY/MM/DD")}
          </div>
          <div className={styles.timestamp}>
            Updated：{dayjs(post.lastEditedTs).format("YYYY/MM/DD")}
          </div>
        </div>
      </div>
    </div>
  );
};
