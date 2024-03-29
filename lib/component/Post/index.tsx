import { FunctionComponent } from "react";
import { Post } from "@/pages";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import styles from "./index.module.css";

export const PostComponent: FunctionComponent<{
  post: Post;
}> = ({ post }) => {
  return (
    <div className={styles.itemWrapper} key={post.id}>
      <Link href={`/post/${encodeURIComponent(post.slug ?? "")}`}>
        <div className={styles.imageWrapper}>
          <Image
            width={500}
            height={500}
            className={styles.image}
            src={post.thumbnail}
            alt="Thumbnail"
          />
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
