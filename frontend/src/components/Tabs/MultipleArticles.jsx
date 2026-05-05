import React, { useState } from 'react';
import { generateHeadlineHF, improveHeadlineGemini } from '../../services/api';
import { Sparkles, Loader2, AlertCircle, Plus, Trash2 } from 'lucide-react';

const MultipleArticles = () => {
  const [articles, setArticles] = useState([{ id: Date.now(), text: '' }]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [improvingId, setImprovingId] = useState(null);
  const [error, setError] = useState('');

  const addArticle = () => {
    setArticles([...articles, { id: Date.now(), text: '' }]);
  };

  const removeArticle = (id) => {
    if (articles.length > 1) {
      setArticles(articles.filter(a => a.id !== id));
    }
  };

  const updateArticle = (id, text) => {
    setArticles(articles.map(a => a.id === id ? { ...a, text } : a));
  };

  const handleGenerate = async () => {
    const validArticles = articles.filter(a => a.text.trim() !== '');
    if (validArticles.length === 0) {
      setError("Please enter at least one article with content.");
      return;
    }

    setLoading(true);
    setError('');
    let generatedResults = [];

    // Process sequentially or in parallel. In HF inference API async is fine but may get rate limited.
    // Doing sequentially to be safer.
    try {
      for (const article of validArticles) {
        const res = await generateHeadlineHF(article.text);
        if (res && res.length > 0) {
          generatedResults.push({
            id: article.id,
            articleText: article.text,
            original: res[0].generated_text,
            improved: null
          });
        }
      }
      setResults(generatedResults);
    } catch (err) {
      setError(err.message || "Failed to generate some headlines.");
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async (id, articleText, originalText) => {
    setImprovingId(id);
    setError('');

    try {
      const improvedText = await improveHeadlineGemini(articleText, originalText);
      setResults(prev => 
        prev.map(r => r.id === id ? { ...r, improved: improvedText } : r)
      );
    } catch (err) {
      setError(`Gemini API Error: ` + (err.message || "Failed to improve."));
    } finally {
      setImprovingId(null);
    }
  };

  return (
    <div className="tab-pane">
      <div className="articles-list">
        {articles.map((article, index) => (
          <div key={article.id} className="article-input-group">
            <div className="group-header">
              <label>Article {index + 1}</label>
              <button 
                onClick={() => removeArticle(article.id)} 
                className="icon-btn text-red"
                disabled={articles.length === 1}
                title="Remove article"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <textarea 
              rows="4" 
              value={article.text} 
              onChange={(e) => updateArticle(article.id, e.target.value)}
              placeholder="Paste article content here..."
            />
          </div>
        ))}
      </div>

      <div className="actions-row">
        <button className="btn-secondary" onClick={addArticle}>
          <Plus size={16} /> Add Another Article
        </button>
        <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? <><Loader2 size={18} className="spin" /> Generating All...</> : "Generate All Headlines"}
        </button>
      </div>

      {error && <div className="error-alert mt-4"><AlertCircle size={16} /> {error}</div>}

      {results.length > 0 && (
        <div className="results-list mt-8">
          <h3>Generated Headlines</h3>
          {results.map((result, index) => (
            <div key={result.id} className="result-card list-item">
              <div className="badge">Article {articles.findIndex(a => a.id === result.id) + 1}</div>
              <p className="headline-text mt-2">{result.original}</p>
              
              {result.improved && (
                <div className="improved-section mt-2">
                  <h4><Sparkles size={14} className="icon-inline text-blue" /> Improved by Gemini:</h4>
                  <p className="headline-text improved-text">{result.improved}</p>
                </div>
              )}

              {!result.improved && (
                <button 
                  className="btn-secondary btn-sm mt-3" 
                  onClick={() => handleImprove(result.id, result.articleText, result.original)} 
                  disabled={improvingId === result.id}
                >
                  {improvingId === result.id ? (
                    <><Loader2 size={14} className="spin" /> Improving...</>
                  ) : (
                    <><Sparkles size={14} /> Fix & Improve</>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultipleArticles;