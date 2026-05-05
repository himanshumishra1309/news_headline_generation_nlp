import React, { useState } from 'react';
import SingleHeadline from './components/Tabs/SingleHeadline.jsx';
import MultipleHeadlines from './components/Tabs/MultipleHeadlines.jsx';
import MultipleArticles from './components/Tabs/MultipleArticles.jsx';
import { Newspaper } from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('single');

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo">
          <Newspaper size={28} />
          <h1>News Headline Generator</h1>
        </div>
      </header>

      <main className="main-content">
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`}
            onClick={() => setActiveTab('single')}
          >
            1 Article → 1 Headline
          </button>
          <button 
            className={`tab-btn ${activeTab === 'multi-headline' ? 'active' : ''}`}
            onClick={() => setActiveTab('multi-headline')}
          >
            1 Article → Multiple Headlines
          </button>
          <button 
            className={`tab-btn ${activeTab === 'multi-article' ? 'active' : ''}`}
            onClick={() => setActiveTab('multi-article')}
          >
            Multiple Articles → 1 Headline Each
          </button>
        </div>

        <div className="tab-content border-box mt-4">
          {activeTab === 'single' && <SingleHeadline />}
          {activeTab === 'multi-headline' && <MultipleHeadlines />}
          {activeTab === 'multi-article' && <MultipleArticles />}
        </div>
      </main>
    </div>
  );
}

export default App;
