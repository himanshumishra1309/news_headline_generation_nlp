import React, { useState } from 'react';
import { generateHeadlineHF, improveHeadlineGemini } from '../../services/api';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

const SingleHeadline = () => {
  const [article, setArticle] = useState('');
  const [headline, setHeadline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [improving, setImproving] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!article.trim()) {
      setError("Please enter the article text.");
      return;
    }

    setLoading(true);
    setError('');
    setHeadline(null);

    try {
      const result = await generateHeadlineHF(article);
      if (result && result.length > 0) {
        setHeadline({ original: result[0].generated_text, improved: null });
      }
    } catch (err) {
      setError(err.message || "Failed to generate headline.");
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!headline || !headline.original) return;

    setImproving(true);
    setError('');

    try {
      const improvedText = await improveHeadlineGemini(article, headline.original);
      setHeadline(prev => ({ ...prev, improved: improvedText }));
    } catch (err) {
      setError("Gemini API Error: " + (err.message || "Failed to improve headline."));
    } finally {
      setImproving(false);
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

      <button 
        className="btn-primary" 
        onClick={handleGenerate} 
        disabled={loading}
      >
        {loading ? <><Loader2 size={18} className="spin" /> Generating...</> : "Generate Headline"}
      </button>

      {error && <div className="error-alert"><AlertCircle size={16} /> {error}</div>}

      {headline && (
        <div className="result-card">
          <h4>Generated Headline:</h4>
          <p className="headline-text">{headline.original}</p>
          
          {headline.improved && (
            <div className="improved-section">
              <h4><Sparkles size={16} className="icon-inline text-blue" /> Improved by Gemini:</h4>
              <p className="headline-text improved-text">{headline.improved}</p>
            </div>
          )}

          {!headline.improved && (
            <button 
              className="btn-secondary" 
              onClick={handleImprove} 
              disabled={improving}
            >
              {improving ? <><Loader2 size={16} className="spin" /> Improving...</> : <><Sparkles size={16} /> Fix & Improve Headline with Gemini</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SingleHeadline;