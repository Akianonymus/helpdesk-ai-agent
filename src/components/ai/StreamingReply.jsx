import { useState, useEffect } from "react";
import { useAIProcessing } from "../../contexts/AIProcessingContext.jsx";

const StreamingReply = ({ ticketId }) => {
  const { getStreamingReply, clearStreamingReply } = useAIProcessing();
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const streamingText = getStreamingReply(ticketId);

  useEffect(() => {
    if (streamingText && streamingText !== displayText) {
      setIsTyping(true);

      const newContent = streamingText.slice(displayText.length);
      let currentIndex = 0;

      const typeInterval = setInterval(() => {
        if (currentIndex < newContent.length) {
          setDisplayText((prev) => prev + newContent[currentIndex]);
          currentIndex++;
        } else {
          setIsTyping(false);
          clearInterval(typeInterval);
        }
      }, 30);

      return () => clearInterval(typeInterval);
    }
  }, [streamingText, displayText]);

  useEffect(() => {
    return () => {
      clearStreamingReply(ticketId);
    };
  }, [ticketId, clearStreamingReply]);

  if (!streamingText) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700 flex items-center">
          <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full mr-2"></div>
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
          AI Reply Generation
        </h4>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Live
        </span>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-100">
        <div className="relative">
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {displayText}
            {isTyping && (
              <span className="inline-block w-2 h-4 bg-green-500 ml-1 animate-pulse"></span>
            )}
          </p>

          <div className="mt-3 flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-1">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-1 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((displayText.length / Math.max(streamingText.length, 1)) * 100, 100)}%`,
                }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">
              {Math.round(
                (displayText.length / Math.max(streamingText.length, 1)) * 100
              )}
              %
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 flex items-center">
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
        Generating reply in real-time...
      </div>
    </div>
  );
};

export default StreamingReply;
