import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DatabaseList = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('http://localhost:5000/collections');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setCollections(data);
      } catch (err) {
        setError('Failed to load collections: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (loading) return <p>Loading collections...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="database-list">
      <h2 className="section-title">Collections</h2>

      <div className="database-grid">
        {collections.length > 0 ? (
          collections.map((col) => (
            <div key={col.id} className="database-card">
              <div>
                <h3 className="database-name">{col.name}</h3>
                <p className="database-meta">Collection</p>
              </div>

              <div>
                <button
                  className="action-button mr-2"
                  onClick={() => navigate(`/view-table/${col.name}`)}
                >
                  Open
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No collections available.</p>
        )}
      </div>
    </div>
  );
};

export default DatabaseList;
