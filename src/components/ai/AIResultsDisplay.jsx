import { useAIProcessing } from "../../contexts/AIProcessingContext.jsx";

const AIResultsDisplay = ({ ticketId, ticket }) => {
  const { getTicketAIStatus } = useAIProcessing();
  const aiStatus = getTicketAIStatus(ticketId);

  const getAIResults = () => {
    if (aiStatus?.finalResults) {
      return aiStatus.finalResults;
    }

    return {
      summary: ticket?.aiSummary,
      category: ticket?.aiCategory,
      sentiment: ticket?.aiSentiment,
      suggestedReply: ticket?.aiSuggestedReply,
      citations: ticket?.aiCitations || ticket?.knowledgeBaseCitations || [],
    };
  };

  const results = getAIResults();

  if (
    !results.summary &&
    !results.category &&
    !results.sentiment &&
    !results.suggestedReply &&
    (!results.citations || results.citations.length === 0)
  ) {
    return null;
  }

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200";
      case "negative":
        return "bg-red-100 text-red-800 border-red-200";
      case "frustrated":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "neutral":
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case "technical":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "billing":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "general":
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
        AI Analysis Results
      </h3>

      {results.summary && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <svg
              className="w-4 h-4 text-blue-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            Summary
          </h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            {results.summary}
          </p>
        </div>
      )}

      {(results.category || results.sentiment) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.category && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <svg
                  className="w-4 h-4 text-purple-600 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                Category
              </h4>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(results.category)}`}
              >
                {results.category.charAt(0).toUpperCase() +
                  results.category.slice(1)}
              </span>
            </div>
          )}

          {results.sentiment && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <svg
                  className="w-4 h-4 text-yellow-600 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415zM9 11a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                Customer Sentiment
              </h4>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSentimentColor(results.sentiment)}`}
              >
                {results.sentiment.charAt(0).toUpperCase() +
                  results.sentiment.slice(1)}
              </span>
            </div>
          )}
        </div>
      )}

      {results.citations && results.citations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <svg
              className="w-4 h-4 text-indigo-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Knowledge Base Citations
          </h4>
          <div className="space-y-3">
            {results.citations.map((citation, index) => (
              <div
                key={index}
                className="bg-indigo-50 rounded-lg p-3 border border-indigo-100"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-indigo-600">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-indigo-900">
                      {citation.title || citation.articleTitle}
                    </h5>
                    {citation.category && (
                      <p className="text-xs text-indigo-600 mt-1">
                        Category: {citation.category}
                      </p>
                    )}
                    {citation.snippet && (
                      <p className="text-sm text-indigo-700 mt-2 leading-relaxed">
                        {citation.snippet}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.suggestedReply && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <svg
              className="w-4 h-4 text-green-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
            Reply
          </h4>
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {results.suggestedReply}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIResultsDisplay;
