import React from 'react';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  AlertTriangle,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const InsightsPanel = ({ insights = [] }) => {
  const getInsightIcon = (type) => {
    switch (type) {
      case 'opportunity':
        return TrendingUp;
      case 'optimization':
        return Target;
      case 'trend':
        return Lightbulb;
      case 'anomaly':
        return AlertTriangle;
      default:
        return Lightbulb;
    }
  };

  const getInsightColor = (impact) => {
    switch (impact) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getIconColor = (impact) => {
    switch (impact) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-blue-600';
    }
  };

  if (!insights || insights.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
        </div>
        <div className="text-center py-8">
          <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No insights available at the moment.</p>
          <p className="text-sm text-gray-400 mt-2">
            Insights will appear as we gather more data about your financial performance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
        <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
          {insights.length}
        </span>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {insights.map((insight, index) => {
          const IconComponent = getInsightIcon(insight.type);
          
          return (
            <div
              key={index}
              className={`border rounded-lg p-4 transition-all hover:shadow-md ${getInsightColor(insight.impact)}`}
            >
              <div className="flex items-start">
                <div className={`p-2 rounded-lg mr-3 ${getIconColor(insight.impact)} bg-white`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {insight.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                        insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {insight.impact} impact
                      </span>
                      {insight.confidence && (
                        <span className="text-xs text-gray-500">
                          {insight.confidence}% confidence
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">
                    {insight.description}
                  </p>
                  
                  {insight.recommendations && insight.recommendations.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-600 mb-2">Recommendations:</p>
                      <ul className="space-y-1">
                        {insight.recommendations.slice(0, 3).map((recommendation, recIndex) => (
                          <li key={recIndex} className="flex items-start text-xs text-gray-600">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{recommendation}</span>
                          </li>
                        ))}
                        {insight.recommendations.length > 3 && (
                          <li className="text-xs text-gray-500 italic">
                            +{insight.recommendations.length - 3} more recommendations
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {insights.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all insights
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default InsightsPanel;
