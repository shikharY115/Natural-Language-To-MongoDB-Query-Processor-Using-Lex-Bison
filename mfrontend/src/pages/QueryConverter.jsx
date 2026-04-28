import React, { useState, useEffect } from 'react';
import ResultDisplay from '../components/ResultDisplay.jsx';

const QueryConverter = () => {
  const [query, setQuery] = useState('');
  const [mongoQuery, setMongoQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/history');
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const handleSubmit = async () => {
    if (!query.trim()) return;
    setError('');
    setMongoQuery('');
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setMongoQuery(data.query);   // backend returns { query, results }
      setResult(data.results);
      fetchHistory();
    } catch (err) {
      setError('Failed to convert query: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="query-converter">
      <h2 className="section-title">Natural Language to MongoDB Query</h2>

      <div className="input-group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., show all from employees find age greater than 30"
          className="query-input"
          disabled={loading}
        />

        <button
          onClick={handleSubmit}
          className={`convert-button ${loading || !query.trim() ? 'disabled' : ''}`}
          disabled={loading || !query.trim()}
        >
          {loading ? 'Converting...' : 'Convert'}
        </button>
      </div>

      <ResultDisplay mongoQuery={mongoQuery} error={error} result={result} />

      <div className="query-history">
        <h3 className="history-title">Query</h3>
        {history.length > 0 ? (
          <ul className="history-list">
            {history.map((item, index) => (
              <li key={item._id || index} className="history-item">
                <span><strong>Input:</strong> {item.query_text}</span>
                <span><strong>MongoDB Query:</strong> {item.generated_query}</span>
                <span><strong>Time:</strong> {new Date(item.generated_at).toLocaleString()}</span>
                {item.result && item.result.length > 0 && (
                  <pre>Result: {JSON.stringify(item.result, null, 2)}</pre>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-history">No queries yet.</p>
        )}
      </div>
    </div>
  );
};

export default QueryConverter;
