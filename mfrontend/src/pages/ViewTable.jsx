import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ViewTable = () => {
  const { tableName } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/view-table/${tableName}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError('Failed to load table data: ' + err.message);
      } finally {
        setLoading(false);
     }
    };

    fetchTableData();
  }, [tableName]);
  
  if (loading) return <p>Loading data...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="query-converter">
      <h2 className="section-title">Viewing Collection: {tableName}</h2>

      {data.length > 0 ? (
        <table className="table-display">
          <thead>
            <tr>
              {Object.keys(data[0])
                .filter(key => key !== "_id")
                .map((key) => (
                  <th key={key}>{key}</th>
                ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {Object.entries(row)
                  .filter(([key]) => key !== "_id")
                  .map(([key, value], i) => (
                    <td key={i}>
                      {typeof value === 'object'
                        ? JSON.stringify(value)
                        : value}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No data in this collection.</p>
      )}
    </div>
  );
};

export default ViewTable;
