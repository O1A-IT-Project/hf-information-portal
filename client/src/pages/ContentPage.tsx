import styles from "./ContentPage.module.css";

import type { Role } from "../App";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getContent } from "../services/umbraco";
import ContentTemplate from "../templates/ContentTemplate";

type Props = {
  activeRole: Role | null;
};

type Content = {
  id: string;
  name: string;
  pageTitle: string;
  overview: string;
  category: string;
  type: string;
  visibility: string[];
  bodyContent: string;
  author: string;
  created: string;
  updated: string;
  path: string;
};

function ContentPage({ activeRole }: Props) {
  const { contentPath } = useParams<{ contentPath: string }>();

  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch content based on the active role and content path whenever they change
  useEffect(() => {
    getContent(activeRole)
      .then((contents) => {
        const foundContent = contents.find(
          (content) => content.path === `/${contentPath}/`,
        );

        setContent(foundContent ?? null);
      })
      .catch((error) => {
        console.error("Error loading content:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [contentPath, activeRole]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!content) {
    return <p>Content not found.</p>;
  }

  const bodyContent = content.bodyContent.replace(
    /src="\/media\//g,
    'src="https://localhost:8443/media/',
  );

return (
  <main className="container mt-4">
    <article>
      <header className={styles.contentHeader}>
        <h1>{content.pageTitle || content.name}</h1>

        <div className={styles.contentMeta}>
          <span><strong>Author:</strong> {content.author}</span>
          <span><strong>Category:</strong> {content.category}</span>
          <span><strong>Type:</strong> {content.type}</span>
        </div>

        <p className={styles.contentOverview}>{content.overview}</p>
        <hr />
      </header>

      <div
        className={styles.contentBody}
        dangerouslySetInnerHTML={{ __html: bodyContent }}
      />
    </article>
  </main>
);
}

export default ContentPage;