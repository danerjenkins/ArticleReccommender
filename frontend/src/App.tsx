import React, { useState, useEffect } from "react";
import Papa from "papaparse";

const App: React.FC = () => {
  const [titles, setTitles] = useState<string[]>([]);
  const [userId, setUserId] = useState("");
  const [collabResults, setCollabResults] = useState<string[]>([]);
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
            const titleList = data.map((row) => row["title"] || "(No Title)");
            setTitles(titleList);
          },
        });
      } catch (error) {
        console.error("Error fetching titles:", error);
      }
    };

    fetchTitles();
  }, []);

  const fetchRecommendations = async () => {
    console.log("Fetching recommendations for user:", userId);
    // Placeholder logic
    setCollabResults(["Item 1", "Item 2", "Item 3"]);
    setContentResults(["Item A", "Item B", "Item C"]);
    setAzureResults(["Item X", "Item Y", "Item Z"]);
  };

  return (
    <div>
      <div>
        <h1>Article Recommender</h1>
        <select
          onChange={(e) => setUserId(e.target.value)}
          style={{ marginRight: "1rem", padding: "0.5rem" }}
        >
          <option value="">Select a title</option>
          {titles.map((title, idx) => (
            <option key={idx} value={title}>
              {title}
            </option>
          ))}
        </select>
        <button onClick={fetchRecommendations}>Get Recommendations</button>
      </div>

      <div>
        <h2>Collaborative Filtering</h2>
        <ul>
          {collabResults.map((itemId, idx) => (
            <li key={idx}>{itemId}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Content Filtering</h2>
        <ul>
          {contentResults.map((itemId, idx) => (
            <li key={idx}>{itemId}</li>
          ))}
        </ul>
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
