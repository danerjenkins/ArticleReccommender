import React, { useState, useEffect } from "react";
import Papa from "papaparse";

const App: React.FC = () => {
  const [articles, setArticles] = useState<
    Array<{ title: string; contentId: string }>
  >([]);
  const [contentId, setContentId] = useState("");
  const [collabResults, setCollabResults] = useState(null);
  const [contentResults, setContentResults] = useState<string[]>([]);
  const [azureResults, setAzureResults] = useState<string[]>([]);

  useEffect(() => {
    const fetchTitles = async () => {
      try {
        console.log("Fetching titles from shared_articles.csv...");
        const response = await fetch("/shared_articles.csv");
        // console.log("Response:", response);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        // console.log("Fetched content:", csvText);

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data as Array<Record<string, string>>;
            const parsed = data.map((row) => ({
              title: row["title"] || "(No Title)",
              contentId: row["contentId"] || "",
            }));
            setArticles(parsed);
          },
        });
      } catch (error) {
        console.error("Error fetching titles:", error);
      }
    };

    fetchTitles();
  }, []);

  const fetchRecommendations = async () => {
    console.log("Fetching recommendations for article:", contentId);
    // Fetch collaborative recommendations for the selected contentId
    try {
      const response = await fetch("/collaborativerecommendations.json");
      if (!response.ok) {
        throw new Error(
          `Failed to fetch collaborative recommendations: ${response.status}`
        );
      }

      const data = await response.json();
      // Filter recommendations based on the selected contentId
      const recommendations = data[contentId] || [];
      setCollabResults(recommendations);
    } catch (error) {
      console.error("Error fetching collaborative recommendations:", error);
    }
    // Placeholder logic
    setContentResults(["Item A", "Item B", "Item C"]);
    setAzureResults(["Item X", "Item Y", "Item Z"]);
  };

  return (
    <div>
      <div>
        <h1>Article Recommender</h1>
        <select
          onChange={(e) => setContentId(e.target.value)}
          style={{ marginRight: "1rem", padding: "0.5rem" }}
        >
          <option value="">Select a title</option>
          {articles.map((article, idx) => (
            <option key={idx} value={article.contentId}>
              {article.title}
            </option>
          ))}
        </select>
        <button onClick={fetchRecommendations}>Get Recommendations</button>
      </div>

      <div>
        <h2>Collaborative Filtering</h2>
        {collabResults && (
          <div>
            <h2>Recommended Articles</h2>
            <p>
              <strong>If you liked:</strong> {collabResults["If you liked"]}
            </p>
            <ul>
              {Array.from({ length: 5 }, (_, i) => (
                <li key={i}>
                  <a
                    href={collabResults[`Link ${i + 1}`]}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {collabResults[`Article ${i + 1}`]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div>
        <h2>Azure ML Endpoint</h2>
        <ul>
          {azureResults.map((itemId, idx) => (
            <li key={idx}>{itemId}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
