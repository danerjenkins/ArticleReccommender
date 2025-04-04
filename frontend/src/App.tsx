import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import AzureCall from "./AzureCall";

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
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data as Array<Record<string, string>>;

            // Filter out rows where any value is null or empty
            const filteredData = data.filter((row) =>
              Object.values(row).every(
                (value) => value !== null && value !== ""
              )
            );

            const parsed = filteredData.map((row) => ({
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

  const processCsvForTopIndices = async (targetId: string): Promise<any> => {
    try {
      console.log(`Processing CSV to find row for ID: ${targetId}`);
      const response = await fetch("/article_content_filtering.csv");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const csvText = await response.text();
      let top5Indices: string[] = [];

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as Array<Record<string, string>>; // Log the parsed data for debugging

          // Find the row matching the target ID
          const targetRow = data.find((row) => row["contentId"] === targetId);
          if (!targetRow) {
            console.error(`No row found for ID: ${targetId}`);
            return;
          }

          // Convert row values to numbers (excluding the ID and title columns)
          const numericValues = Object.entries(targetRow)
            .filter(([key]) => key !== "contentId")
            .map(([key, value]) => ({ index: key, value: parseFloat(value) }))
            .filter((item) => !isNaN(item.value)); // Filter out non-numeric values

          // Sort values from largest to smallest
          const sortedValues = numericValues.sort((a, b) => b.value - a.value);

          // Pick the top 5 indices
          top5Indices = sortedValues.slice(0, 5).map((item) => item.index);

          console.log("Top 5 indices:", top5Indices);
          // Set the top indices to state for rendering
        },
      });

      setContentResults(top5Indices); // Update the state with the top 5 indices
    } catch (error) {
      console.error("Error processing CSV:", error);
    }
  };

  // Example usage

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
      console.log(recommendations);
      setCollabResults(recommendations);
    } catch (error) {
      console.error("Error fetching collaborative recommendations:", error);
    }
    // Placeholder logic
    await processCsvForTopIndices(contentId);

    console.log("content results:" + contentResults);

    // Call Azure ML endpoint
    try {
      const azureResponse = await AzureCall(parseInt(contentId));

      setAzureResults(["Item X", "Item Y", "Item Z"]);
    } catch (error) {
      console.error("Error calling Azure ML endpoint:", error);
    }
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
        <h2>Content Filtering</h2>
        {contentResults && (
          <div>
            <h3>Recommended Article Ids</h3>
            <ul>
              {contentResults.map((itemId, idx) => {
                return <li key={idx}>{itemId}</li>;
              })}
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
