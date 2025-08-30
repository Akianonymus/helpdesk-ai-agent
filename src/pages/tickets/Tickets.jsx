import { Link } from "react-router-dom";
import TicketFilters from "../../components/tickets/TicketFilters.jsx";
import TicketList from "../../components/tickets/TicketList.jsx";
import Pagination from "../../components/common/Pagination.jsx";

const Tickets = () => {
  return (
    <div className="min-h-screen w-full bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Support Tickets
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage and track your support requests
              </p>
            </div>
            <Link
              to="/tickets/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create New Ticket
            </Link>
          </div>
        </div>

        <TicketFilters />

        <div className="mb-6">
          <TicketList />
        </div>

        <Pagination />
      </div>
    </div>
  );
};

export default Tickets;
