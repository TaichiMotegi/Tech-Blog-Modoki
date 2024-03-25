import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import prism from "prismjs";
import { useEffect } from "react";
import { Post, getPostContents, getPosts } from "..";
import { Layout } from "../../../lib/component/Layout";
import styles from "../../styles/Home.module.css";
import dayjs from "dayjs";
import Link from "next/link";

type StaticPathsParams = {
  slug: string;
};

type StaticProps = {
  post?: Post;
};

export const getStaticPaths: GetStaticPaths<StaticPathsParams> = async () => {
  const posts = await getPosts();
  const paths: {
    params: { slug: string };
  }[] = [];
  posts.forEach((post) => {
    const slug = post.slug;
    if (slug) {
      paths.push({
        params: {
          slug,
        },
      });
    }
  });
  return { paths, fallback: "blocking" };
};

export const getStaticProps: GetStaticProps<
  StaticProps,
  StaticPathsParams
> = async ({ params, preview }) => {
  const notFoundProps = {
    props: {},
    redirect: {
      destination: "/404",
    },
  };
  if (!params) {
    return notFoundProps;
  }
  const { slug } = params;
  const posts = await getPosts(slug);
  const post = posts.shift();
  if (!post) {
    return notFoundProps;
  }
  const contents = await getPostContents(post);
  post.contents = contents;
  return {
    props: {
      post,
    },
    revalidate: 60,
  };
};

const PostPage: NextPage<StaticProps> = ({ post }) => {
  useEffect(() => {
    prism.highlightAll();
  }, []);

  if (!post) return null;

  return (
    <Layout>
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
        <div>
          {post.contents.map((content, index) => {
            const key = `${post.id}_${index}`;
            switch (content.type) {
              case "heading_2":
                return (
                  <h2 key={key} className={styles.heading2}>
                    {content.text}
                  </h2>
                );
              case "heading_3":
                return (
                  <h3 key={key} className={styles.heading3}>
                    {content.text}
                  </h3>
                );
              case "paragraph":
                if (content.annotations === true) {
                  return (
                    <p key={key} className={styles.paragraphBold}>
                      {content.text}
                    </p>
                  );
                } else {
                  return (
                    <p key={key} className={styles.paragraph}>
                      {content.text}
                    </p>
                  );
                }

              case "code":
                return (
                  <pre
                    key={key}
                    className={`
                                        ${styles.code}
                                        lang-${content.language} 
                                    `}
                  >
                    <code>{content.text}</code>
                  </pre>
                );
              case "quote":
                return (
                  <blockquote key={key} className={styles.quote}>
                    {content.text}
                  </blockquote>
                );
              case "divider":
                return <hr></hr>;
              case "image":
                return <img src={content.url} alt="img" />;
            }
          })}
        </div>
      </div>{" "}
    </Layout>
  );
};

export default PostPage;
