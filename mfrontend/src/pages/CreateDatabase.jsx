import React, { useState } from 'react';

const CreateDatabase = () => {
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState([{ name: '', type: 'TEXT' }]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleColumnChange = (index, field, value) => {
    const newColumns = [...columns];
    newColumns[index][field] = value;
    setColumns(newColumns);
  };

  const addColumn = () => {
    setColumns([...columns, { name: '', type: 'TEXT' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:5000/create-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName, columns }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setMessage(data.message);
      setTableName('');
      setColumns([{ name: '', type: 'TEXT' }]);
    } catch (err) {
      setError('Failed to create table: ' + err.message);
    }
  };

  return (
    <div className="query-converter">
      <h2 className="section-title">Create New Database Table</h2>

      <form onSubmit={handleSubmit} className="input-group">
        <div>
          <label htmlFor="tableName" className="block-label">Table Name:</label>
          <input
            type="text"
            id="tableName"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            className="query-input"
            placeholder="e.g., customers"
            required
          />
        </div>

        <div>
          <label className="block-label">Columns:</label>
          {columns.map((col, index) => (
            <div key={index} className="column-row">
              <input
                type="text"
                value={col.name}
                onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                className="query-input"
                placeholder="Column name"
                required
              />
              <select
                value={col.type}
                onChange={(e) => handleColumnChange(index, 'type', e.target.value)}
                className="query-input"
              >
                <option value="TEXT">Text</option>
                <option value="INTEGER">Integer</option>
                <option value="REAL">Real</option>
              </select>
            </div>
          ))}
          <button type="button" onClick={addColumn} className="action-button mt-2">
            Add Column
          </button>
        </div>

        <button type="submit" className="convert-button" disabled={!tableName || columns.some(c => !c.name)}>
          Create Table
        </button>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </form>
    </div>
  );
};

export default CreateDatabase;
