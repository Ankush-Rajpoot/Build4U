import React, { useEffect, useState } from 'react';
import { portfolioService } from '../../services/portfolioService';

const WorkerPortfolioGallery = ({ workerId }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workerId) {
      fetchPortfolio();
    }
    // eslint-disable-next-line
  }, [workerId]);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const response = await portfolioService.getPortfolio(workerId);
      setPortfolio(response.data || []);
    } catch {
      setPortfolio([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-xs text-gray-400 py-2">Loading portfolio...</div>;
  if (!portfolio.length) return <div className="text-xs text-gray-400 py-2">No past work uploaded yet.</div>;

  return (
    <div className="mt-2">
      <h4 className="text-xs font-semibold text-gray-700 mb-1">Past Work</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {portfolio.map((entry, idx) => (
          <div key={idx} className="bg-white border border-blue-100 rounded-lg p-2 flex flex-col shadow-sm hover:shadow-md transition-shadow">
            <div className="font-medium text-xs text-indigo-900 mb-0.5 truncate">{entry.title}</div>
            <div className="flex flex-wrap items-center gap-1 text-[10px] mb-1">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                Start: {entry.startDate ? new Date(entry.startDate).toLocaleDateString() : 'N/A'}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                Finish: {entry.completedDate ? new Date(entry.completedDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="text-[11px] text-gray-500 mb-1 line-clamp-2">{entry.description}</div>
            <div className="flex flex-wrap gap-1 mb-1">
              {entry.images?.slice(0,3).map((img, i) => (
                <img key={i} src={img} alt="Work" className="h-10 w-10 object-cover rounded border border-gray-200" />
              ))}
            </div>
            {entry.review && (entry.review.text || entry.review.rating) && (
              <div className="mt-1 p-1.5 rounded bg-gradient-to-r from-green-50 to-blue-50 border border-green-100">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[10px] font-semibold text-green-700">Review</span>
                  {entry.review.rating && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-bold">★ {entry.review.rating.toFixed(1)}</span>
                  )}
                </div>
                {entry.review.text && (
                  <div className="text-[10px] text-gray-700 italic">"{entry.review.text}"</div>
                )}
              </div>
            )}
            <div className="text-[10px] text-gray-400 mt-auto">{entry.completedDate ? new Date(entry.completedDate).toLocaleDateString() : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkerPortfolioGallery;
