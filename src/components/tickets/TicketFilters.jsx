import { useRef } from "react";
import { useTickets } from "../../contexts/TicketsContext.jsx";
import { AI_PROCESSING_STATUS } from "../../types/ticket.js";

const TicketFilters = () => {
  const statusRef = useRef();

  const { filters, updateFilters } = useTickets();

  const handleFilterChange = () => {
    const newFilters = {
      status: statusRef.current.value,
    };
    updateFilters(newFilters);
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4 gap-8">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>

        <select
          ref={statusRef}
          id="status"
          defaultValue={filters.status}
          onChange={handleFilterChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">All Statuses</option>
          <option value={AI_PROCESSING_STATUS.PENDING}>Pending</option>
          <option value={AI_PROCESSING_STATUS.PROCESSING}>Processing</option>
          <option value={AI_PROCESSING_STATUS.COMPLETED}>Completed</option>
          <option value={AI_PROCESSING_STATUS.FAILED}>Failed</option>
          <option value={AI_PROCESSING_STATUS.RETRY}>Retry</option>
        </select>
      </div>
    </div>
  );
};

export default TicketFilters;
