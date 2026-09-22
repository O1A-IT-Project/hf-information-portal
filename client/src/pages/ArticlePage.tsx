import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getArticles } from '../services/umbraco'

export type Article = {
  id: string;
  name: string;
  pageTitle: string;
  overview: string;
  category: string;
  visibility: string[];
  bodyContent: string;
  created: string;
  updated: string;
  path: string;
};

function ArticlePage() {
  const { articlePath } = useParams<{ articlePath: string }>();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArticles()
      .then((articles) => {
        const foundArticle = articles.find(
          (article) => article.path === `/${articlePath}/`
        );

        setArticle(foundArticle ?? null);
      })
      .catch((error) => {
        console.error("Error loading article:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [articlePath]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!article) {
    return <p>Article not found.</p>;
  }

  const bodyContent = article.bodyContent.replace(
    /src="\/media\//g,
    'src="https://localhost:44343/media/'
  );

  return (
    <main className="container mt-4">
      <h1>{article.pageTitle}</h1>

      <p>{article.overview}</p>

      <div
        dangerouslySetInnerHTML={{
          __html: bodyContent,
        }}
      />
    </main>
  );
}

export default ArticlePage;

