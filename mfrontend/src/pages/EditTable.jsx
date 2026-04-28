import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const EditTable = () => {
  const { tableName } = useParams();
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('TEXT');
  const [rowData, setRowData] = useState({});
  const [rowId, setRowId] = useState('');
  const [columnsToKeep, setColumnsToKeep] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [newColumns, setNewColumns] = useState([{ name: '', value: '' }]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/view-table/${tableName}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        setTableData(result.data);
        setColumnsToKeep(Object.keys(result.data[0] || {}).filter(col => col !== 'id'));
        if (result.data.length > 0) {
          setNewColumns(Object.keys(result.data[0]).filter(col => col !== 'id').map(col => ({ name: col, value: '' })));
        }
      } catch (err) {
        setError('Failed to load table data: ' + err.message);
      }
    };
    fetchTableData();
  }, [tableName]);

  const handleAddColumn = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!columnName) return setError('Column name is required');
    try {
      const response = await fetch(`http://localhost:5000/edit-table/${tableName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addColumn', columnName, columnType }),
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setMessage(data.message);
      setColumnName('');
      const refreshResponse = await fetch(`http://localhost:5000/view-table/${tableName}`);
      const refreshedData = await refreshResponse.json();
      setTableData(refreshedData.data);
      setColumnsToKeep(Object.keys(refreshedData.data[0] || {}).filter(col => col !== 'id'));
      setNewColumns([...newColumns, { name: columnName, value: '' }]);
    } catch (err) {
      setError('Failed to add column: ' + err.message);
    }
  };

  const handleAddRow = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    const validRowData = newColumns.reduce((acc, col) => {
      if (col.name) acc[col.name] = col.value;
      return acc;
    }, {});
    if (Object.keys(validRowData).length === 0) {
      return setError('At least one column and value are required');
    }
    try {
      const response = await fetch(`http://localhost:5000/edit-table/${tableName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addRow', rowData: validRowData }),
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setMessage(data.message);
      setNewColumns([{ name: '', value: '' }]);
      const refreshResponse = await fetch(`http://localhost:5000/view-table/${tableName}`);
      const refreshedData = await refreshResponse.json();
      setTableData(refreshedData.data);
      setColumnsToKeep(Object.keys(refreshedData.data[0] || {}).filter(col => col !== 'id'));
      if (refreshedData.data.length > 0) {
        setNewColumns(Object.keys(refreshedData.data[0]).filter(col => col !== 'id').map(col => ({ name: col, value: '' })));
      }
    } catch (err) {
      setError('Failed to add row: ' + err.message);
    }
  };

  const handleDeleteRow = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!rowId) return setError('Row ID is required');
    try {
      const response = await fetch(`http://localhost:5000/edit-table/${tableName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteRow', rowId }),
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setMessage(data.message);
      setRowId('');
      const refreshResponse = await fetch(`http://localhost:5000/view-table/${tableName}`);
      const refreshedData = await refreshResponse.json();
      setTableData(refreshedData.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteColumn = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (columnsToKeep.length === 0) return setError('At least one column must be kept');
    try {
      const response = await fetch(`http://localhost:5000/edit-table/${tableName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteColumn', columnsToKeep }),
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setMessage(data.message);
      setColumnsToKeep([]);
      const refreshResponse = await fetch(`http://localhost:5000/view-table/${tableName}`);
      const refreshedData = await refreshResponse.json();
      setTableData(refreshedData.data);
      setColumnsToKeep(Object.keys(refreshedData.data[0] || {}).filter(col => col !== 'id'));
      setNewColumns(Object.keys(refreshedData.data[0] || {}).filter(col => col !== 'id').map(col => ({ name: col, value: '' })));
    } catch (err) {
      setError('Failed to delete column: ' + err.message);
    }
  };

  return (
    <div className="query-converter">
      <h2 className="section-title">Edit Table: {tableName}</h2>

      <div className="edit-sections">
        <details className="edit-section">
          <summary>Add Column</summary>
          <form onSubmit={handleAddColumn} className="input-group">
            <div>
              <label htmlFor="columnName" className="block-label">New Column Name:</label>
              <input
                type="text"
                id="columnName"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                className="query-input"
                placeholder="e.g., address"
                required
              />
            </div>
            <div>
              <label htmlFor="columnType" className="block-label">Column Type:</label>
              <select
                id="columnType"
                value={columnType}
                onChange={(e) => setColumnType(e.target.value)}
                className="query-input"
              >
                <option value="TEXT">Text</option>
                <option value="INTEGER">Integer</option>
                <option value="REAL">Real</option>
              </select>
            </div>
            <button type="submit" className="convert-button" disabled={!columnName}>
              Add Column
            </button>
          </form>
        </details>

        <details className="edit-section">
          <summary>Add Row</summary>
          <form onSubmit={handleAddRow} className="input-group">
            <div>
              <label className="block-label">New Row Data:</label>
              <table className="table-display">
                <tbody>
                  {newColumns.map((col, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          value={col.name}
                          onChange={(e) => {
                            const updated = [...newColumns];
                            updated[index] = { ...col, name: e.target.value };
                            setNewColumns(updated);
                          }}
                          className="query-input"
                          placeholder="Column Name"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={col.value}
                          onChange={(e) => {
                            const updated = [...newColumns];
                            updated[index] = { ...col, value: e.target.value };
                            setNewColumns(updated);
                          }}
                          className="query-input"
                          placeholder={col.name || `Value ${index + 1}`}
                          required
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="convert-button mr-2"
                          onClick={() => setNewColumns(newColumns.filter((_, i) => i !== index))}
                          disabled={newColumns.length <= 1}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                className="convert-button mt-2"
                onClick={() => setNewColumns([...newColumns, { name: '', value: '' }])}
              >
                Add Column-Value Pair
              </button>
            </div>
            <button type="submit" className="convert-button" disabled={newColumns.some(col => !col.name)}>
              Add Row
            </button>
          </form>
        </details>

        <details className="edit-section">
          <summary>Delete Row</summary>
          <form onSubmit={handleDeleteRow} className="input-group">
            <div>
              <label htmlFor="rowId" className="block-label">Row ID to Delete:</label>
              <input
                type="number"
                id="rowId"
                value={rowId}
                onChange={(e) => setRowId(e.target.value)}
                className="query-input"
                placeholder="e.g., 1"
                required
              />
            </div>
            <button type="submit" className="convert-button" disabled={!rowId}>
              Delete Row
            </button>
          </form>
        </details>

        <details className="edit-section">
          <summary>Delete Column</summary>
          <form onSubmit={handleDeleteColumn} className="input-group">
            <div>
              <label className="block-label">Columns to Keep:</label>
              {Object.keys(tableData[0] || {}).filter(col => col !== 'id').map((col) => (
                <div key={col} className="column-row">
                  <input
                    type="checkbox"
                    checked={columnsToKeep.includes(col)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setColumnsToKeep([...columnsToKeep, col]);
                      } else {
                        setColumnsToKeep(columnsToKeep.filter(c => c !== col));
                      }
                    }}
                  />
                  <span>{col}</span>
                </div>
              ))}
            </div>
            <button type="submit" className="convert-button" disabled={columnsToKeep.length === 0}>
              Delete Unselected Columns
            </button>
          </form>
        </details>
      </div>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default EditTable;