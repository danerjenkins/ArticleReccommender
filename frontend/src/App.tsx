import React, { useState } from 'react';

const App: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [collabResults, setCollabResults] = useState<string[]>([]);
  const [contentResults, setContentResults] = useState<string[]>([]);
  const [azureResults, setAzureResults] = useState<string[]>([]);

  const fetchRecommendations = async () => {
    // Replace these with actual calls to your endpoints or model APIs
    // Sample placeholder logic below
    const collab = await fetch(`https://localhost:4000/api/collab?userId=${userId}`).then(res => res.json());
    const content = await fetch(`https://localhost:4000/api/content?userId=${userId}`).then(res => res.json());
    const azure = await fetch(`https://localhost:4000/api/azure?userId=${userId}`).then(res => res.json());

    setCollabResults(collab.recommendations || []);
    setContentResults(content.recommendations || []);
    setAzureResults(azure.recommendations || []);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>News Recommendation System</h1>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="userId">Enter User ID: </label>
        <input
          id="userId"
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ marginRight: '1rem' }}
        />
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
