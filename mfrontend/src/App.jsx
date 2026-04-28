import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import DatabaseList from './pages/DatabaseList.jsx';
import QueryConverter from './pages/QueryConverter.jsx';
import CreateDatabase from './pages/CreateDatabase.jsx';
import ViewTable from './pages/ViewTable.jsx'; // New import
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <div className="main-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/databases" element={<DatabaseList />} />
              <Route path="/query" element={<QueryConverter />} />
              <Route path="/view-table/:tableName" element={<ViewTable />} />
              <Route path="/" element={<DatabaseList />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
