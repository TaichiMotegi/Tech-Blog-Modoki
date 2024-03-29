import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import prism from "prismjs";
import { useEffect } from "react";
import { Post, getPostContents, getPosts } from "..";
import { Layout } from "../../../lib/component/Layout";
import styles from "../../styles/Home.module.css";
import dayjs from "dayjs";

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
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.timestampWrapper}>
          <div>
            <div className={styles.timestamp}>
              Created: {dayjs(post.createdTs).format("YYYY/MM/DD")}
            </div>
            <div className={styles.timestamp}>
              Updated: {dayjs(post.lastEditedTs).format("YYYY/MM/DD")}
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
                if (content.url) {
                  return (
                    <a
                      key={key}
                      href={content.url}
                      className={styles.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {content.text}
                    </a>
                  );
                } else {
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
                return <hr key={key}></hr>;

              case "image":
                return <img key={key} src={content.url} alt="img" />;

              case "list":
                if (content.url) {
                  return (
                    <li key={key} className={styles.list}>
                      <a
                        href={content.url}
                        className={styles.link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {content.text}
                      </a>
                    </li>
                  );
                } else {
                  return (
                    <li key={key} className={styles.list}>
                      {content.text}
                    </li>
                  );
                }
            }
          })}
        </div>
      </div>{" "}
    </Layout>
  );
};

export default PostPage;
