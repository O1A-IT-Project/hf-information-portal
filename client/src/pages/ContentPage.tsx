import { useState } from "react";

import { Link } from "react-router-dom";

import { getPosts } from "../services/umbraco";

import type { Post } from "../services/umbraco";

import styles from "./ContentPage.module.css";

function ContentPage() {
  const [searchText, setSearchText] = useState("");

  const [type, setType] = useState("all");

  const [sort, setSort] = useState("newest");

  const [groupByYear, setGroupByYear] = useState(false);

  const [selectedYear, setSelectedYear] = useState("all");

  const [results, setResults] = useState<Post[]>([]);

  const [loading, setLoading] = useState(false);

  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);

    try {
      const data = await getPosts();

      let filtered = data.filter((item) => {
        const matchesText = item.title
          .toLowerCase()
          .includes(searchText.toLowerCase());

        const matchesType = type === "all" || item.contentType === type;

        return matchesText && matchesType;
      });

      if (sort === "newest") {
        filtered = filtered.sort(
          (a, b) =>
            new Date(b.createDate || "").getTime() -
            new Date(a.createDate || "").getTime(),
        );
      } else if (sort === "oldest") {
        filtered = filtered.sort(
          (a, b) =>
            new Date(a.createDate || "").getTime() -
            new Date(b.createDate || "").getTime(),
        );
      } else if (sort === "az") {
        filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
      }

      setResults(filtered);

      setSelectedYear("all");

      setSearched(true);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (contentType: string) => {
    switch (contentType) {
      case "videoPage":
        return "Video";

      case "conditionPage":
        return "Condition";

      case "contentPage":
        return "Article";

      case "newsPage":
        return "News";

      default:
        return contentType;
    }
  };

  const getYearLabel = (createDate?: string) => {
    if (!createDate) return "Unknown";

    const year = new Date(createDate).getFullYear();

    return isNaN(year) ? "Unknown" : String(year);
  };

  const sortYearsDescending = (years: string[]) => {
    return years.sort((a, b) => {
      if (a === "Unknown") return 1;
      if (b === "Unknown") return -1;

      return Number(b) - Number(a);
    });
  };

  const groupResultsByYear = (items: Post[]) => {
    const groups = new Map<string, Post[]>();

    for (const item of items) {
      const year = getYearLabel(item.createDate);

      if (!groups.has(year)) {
        groups.set(year, []);
      }

      groups.get(year)!.push(item);
    }

    const sortedYears = sortYearsDescending(Array.from(groups.keys()));

    return sortedYears.map(
      (year) => [year, groups.get(year)!] as [string, Post[]],
    );
  };

  const availableYears = groupByYear
    ? sortYearsDescending(
        Array.from(
          new Set(results.map((item) => getYearLabel(item.createDate))),
        ),
      )
    : [];

  const renderResultCard = (item: Post) => (
    <Link
      key={item.id}
      to={item.route?.path || "#"}
      className={styles.resultLink}
    >
      <div className={styles.resultCard}>
        <div>
          <h3>{item.title}</h3>

          {typeof item.properties?.overview === "string" && (
            <p>{item.properties.overview}</p>
          )}
        </div>

        <span className={styles.resultBadge}>
          {getTypeLabel(item.contentType)}
        </span>
      </div>
    </Link>
  );

  const groupedResults = groupResultsByYear(results).filter(
    ([year]) => selectedYear === "all" || year === selectedYear,
  );

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchCard}>
        <h2>Content Search</h2>

        <div className={styles.searchForm}>
          <div className={styles.searchGroup}>
            <input
              type="text"
              placeholder="Search content..."
              className={styles.searchInput}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />
          </div>

          <div
            className={styles.searchGroup}
            style={{
              flexDirection: "row",
              gap: "0.5rem",
            }}
          >
            <select
              className={styles.searchSelect}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="all">All Types</option>

              <option value="videoPage">Video</option>

              <option value="conditionPage">Condition</option>

              <option value="contentPage">Article</option>

              <option value="newsPage">News</option>
            </select>

            <select
              className={styles.searchSelect}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              disabled={groupByYear}
            >
              <option value="newest">Newest First</option>

              <option value="oldest">Oldest First</option>

              <option value="az">A-Z</option>
            </select>
          </div>

          <div className={styles.groupControls}>
            <label className={styles.groupToggle}>
              <input
                type="checkbox"
                checked={groupByYear}
                onChange={(e) => {
                  setGroupByYear(e.target.checked);
                  setSelectedYear("all");
                }}
              />
              Group by year
            </label>

            {groupByYear && availableYears.length > 0 && (
              <select
                className={styles.searchSelect}
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="all">All Years</option>

                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            className={styles.searchBtn}
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>

          <div className={styles.resultsGroup}>
            {searched && results.length === 0 && <p>No results found</p>}

            {searched &&
              results.length > 0 &&
              !groupByYear &&                     
              results.map((item) => (
                <Link
                  key={item.id}
                  to={`/content${item.route?.path || ""}`}
                  className={styles.resultLink}
                >
                  <div className={styles.resultCard}>
                    <div>
                      <h3>{item.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}

            {searched &&
              results.length > 0 &&
              groupByYear &&
              groupedResults.map(([year, items]) => (
                <div key={year} className={styles.yearGroup}>
                  <h3 className={styles.yearHeading}>{year}</h3>
                  {items.map(renderResultCard)}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentPage;
