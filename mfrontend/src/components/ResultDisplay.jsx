import React from 'react';

const ResultDisplay = ({ mongoQuery, error, result }) => {
  if (!mongoQuery && !error && !result) return null;

  return (
    <div className="result-display">
      {error && <p className="error-message">{error}</p>}

      {mongoQuery && (
        <div className="db-output">
          <h3 className="db-output-title">Generated MongoDB Query:</h3>
          <pre className="db-code">{mongoQuery}</pre>
        </div>
      )}

      {result && result.length > 0 && (
        <div className="result-output">
          <h3 className="result-output-title">Results ({result.length} document{result.length !== 1 ? 's' : ''}):</h3>
          <pre className="result-code">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {result && result.length === 0 && (
        <div className="result-output">
          <h3 className="result-output-title">Results:</h3>
          <p className="no-history">No documents matched.</p>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;
