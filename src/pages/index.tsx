import { Client } from "@notionhq/client";
import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import { GetServerSideProps, NextPage } from "next";
import prism from "prismjs";
import { useEffect } from "react";
import styles from "../../lib/component/Post/index.module.css";
import { PostComponent } from "../../lib/component/Post";
import { Layout } from "../../lib/component/Layout";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// APIのレスポンスをPost型に整形
export type Content =
  | {
      type: "quote" | "heading_2" | "heading_3";
      text: string | null;
    }
  | {
      type: "paragraph";
      text: string | null;
      url: string | null;
      annotations: boolean | null;
    }
  | {
      type: "code";
      text: string | null;
      language: string | null;
    }
  | {
      type: "divider";
    }
  | {
      type: "image";
      url: string;
    }
  | {
      type: "list";
      text: string | null;
      url: string | null;
    };

export type Post = {
  id: string;
  title: string | null;
  thumbnail: string;
  slug: string | null;
  createdTs: string | null;
  lastEditedTs: string | null;
  contents: Content[];
};

type Props = {
  posts: Post[];
};

export const getPosts = async (slug?: string) => {
  let database: QueryDatabaseResponse | undefined = undefined;
  if (slug) {
    database = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID || "",
      filter: {
        and: [
          {
            property: "Slug",
            rich_text: {
              equals: slug,
            },
          },
        ],
      },
    });
  } else {
    database = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID || "",
      filter: {
        and: [
          {
            property: "Published",
            checkbox: {
              equals: true,
            },
          },
        ],
      },
      sorts: [
        {
          timestamp: "created_time",
          direction: "descending",
        },
      ],
    });
  }
  if (!database) return [];
  const posts: Post[] = [];
  database.results.forEach((page, index) => {
    if (!("properties" in page)) {
      posts.push({
        id: page.id,
        title: null,
        thumbnail:
          "https://res.cloudinary.com/dtrrnrtdr/image/upload/v1711335083/noImage_h6fp92.png",
        slug: null,
        createdTs: null,
        lastEditedTs: null,
        contents: [],
      });
      return;
    }

    let title: string | null = null;
    if (page.properties["Title"].type === "title") {
      title = page.properties["Title"].title[0]?.plain_text ?? null;
    }
    let thumbnail: string =
      "https://res.cloudinary.com/dtrrnrtdr/image/upload/v1711335083/noImage_h6fp92.png";
    if (page.properties["Thumbnail"].type === "files") {
      const thumbnailFile = page.properties["Thumbnail"].files[0];
      if (thumbnailFile?.type === "file" && thumbnailFile.file) {
        thumbnail = thumbnailFile.file.url;
      }
    }
    let slug: string | null = null;
    if (page.properties["Slug"].type === "rich_text") {
      slug = page.properties["Slug"].rich_text[0]?.plain_text ?? null;
    }

    posts.push({
      id: page.id,
      title,
      thumbnail,
      slug,
      createdTs: page.created_time,
      lastEditedTs: page.last_edited_time,
      contents: [],
    });
  });
  return posts;
};

export const getPostContents = async (post: Post) => {
  const blockResponse = await notion.blocks.children.list({
    block_id: post.id,
  });
  // console.dir(blockResponse.results, { depth: null });
  const contents: Content[] = [];
  blockResponse.results.forEach((block: any) => {
    //typeごとに分岐してContent型のcontentsに追加
    if (!("type" in block)) {
      return;
    }
    switch (block.type) {
      case "paragraph":
        for (let i = 0; i < block.paragraph.rich_text.length; i++) {
          contents.push({
            type: "paragraph",
            text: block.paragraph.rich_text[i]?.plain_text ?? null,
            url: block.paragraph.rich_text[i]?.href ?? null,
            annotations: block.paragraph.rich_text[i]?.annotations.bold ?? null,
          });
        }
        break;
      case "heading_2":
        contents.push({
          type: "heading_2",
          text: block.heading_2.rich_text[0]?.plain_text ?? null,
        });
        break;
      case "heading_3":
        contents.push({
          type: "heading_3",
          text: block.heading_3.rich_text[0]?.plain_text ?? null,
        });
        break;
      case "quote":
        contents.push({
          type: "quote",
          text: block.quote.rich_text[0]?.plain_text ?? null,
        });
        break;
      case "code":
        contents.push({
          type: "code",
          text: block.code.rich_text[0]?.plain_text ?? null,
          language: block.code.language,
        });
        break;
      case "divider":
        contents.push({
          type: "divider",
        });
        break;
      case "image":
        if (block.image.type === "file") {
          contents.push({
            type: "image",
            url: block.image.file.url ?? null,
          });
        }
        break;
      case "bulleted_list_item":
        contents.push({
          type: "list",
          text: block.bulleted_list_item.rich_text[0]?.plain_text ?? null,
          url: block.bulleted_list_item.rich_text[0]?.href ?? null,
        });
        break;
    }
  });
  return contents;
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const posts = await getPosts();
  const contentsList = await Promise.all(
    posts.map((post) => {
      return getPostContents(post);
    })
  );
  posts.forEach((post, index) => {
    post.contents = contentsList[index];
  });

  return {
    props: { posts },
  };
};

const Home: NextPage<Props> = ({ posts }) => {
  useEffect(() => {
    prism.highlightAll();
  }, []);

  return (
    <Layout>
      <div className={styles.wrapper}>
        {posts.map((post) => (
          <PostComponent post={post} key={post.id} />
        ))}
      </div>
    </Layout>
  );
};

export default Home;
