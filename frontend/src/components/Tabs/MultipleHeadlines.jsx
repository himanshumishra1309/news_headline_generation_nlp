import React, { useState } from 'react';
import { generateHeadlineHF, improveHeadlineGemini } from '../../services/api';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

const MultipleHeadlines = () => {
  const [article, setArticle] = useState('');
  const [count, setCount] = useState(3);
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [improvingId, setImprovingId] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!article.trim()) {
      setError("Please enter the article text.");
      return;
    }

    setLoading(true);
    setError('');
    setHeadlines([]);

    try {
      const result = await generateHeadlineHF(article, {
        num_return_sequences: Number(count),
        do_sample: true,
        top_k: 50,
        top_p: 0.95
      });
      
      if (result && result.length > 0) {
        setHeadlines(result.map((h, i) => ({ id: i, original: h.generated_text, improved: null })));
      }
    } catch (err) {
      setError(err.message || "Failed to generate headlines.");
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async (id, originalText) => {
    setImprovingId(id);
    setError('');

    try {
      const improvedText = await improveHeadlineGemini(article, originalText);
      setHeadlines(prev => 
        prev.map(h => h.id === id ? { ...h, improved: improvedText } : h)
      );
    } catch (err) {
      setError(`Gemini API Error (Headline ${id + 1}): ` + (err.message || "Failed to improve."));
    } finally {
      setImprovingId(null);
    }
  };

  return (
    <div className="tab-pane">
      <div className="form-group">
        <label>Article Content</label>
        <textarea 
          rows="8" 
          value={article} 
          onChange={(e) => setArticle(e.target.value)}
          placeholder="Paste the news article here..."
        />
      </div>

      <div className="form-group row-align">
        <label htmlFor="count">Number of headlines:</label>
        <select id="count" value={count} onChange={(e) => setCount(e.target.value)} className="small-select">
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </div>

      <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
        {loading ? <><Loader2 size={18} className="spin" /> Generating...</> : "Generate Headlines"}
      </button>

      {error && <div className="error-alert"><AlertCircle size={16} /> {error}</div>}

      {headlines.length > 0 && (
        <div className="results-list">
          <h4>Generated Headlines:</h4>
          {headlines.map((headline) => (
            <div key={headline.id} className="result-card list-item">
              <p className="headline-text">{headline.original}</p>
              
              {headline.improved && (
                <div className="improved-section mt-2">
                  <h4><Sparkles size={14} className="icon-inline text-blue" /> Improved by Gemini:</h4>
                  <p className="headline-text improved-text">{headline.improved}</p>
                </div>
              )}

              {!headline.improved && (
                <button 
                  className="btn-secondary btn-sm mt-3" 
                  onClick={() => handleImprove(headline.id, headline.original)} 
                  disabled={improvingId === headline.id}
                >
                  {improvingId === headline.id ? (
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

export default MultipleHeadlines;