import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-6">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Welcome to Helpdesk AI
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500">
            Your intelligent helpdesk solution powered by AI. Create tickets,
            get instant insights, and resolve issues faster.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Hey, {user?.email}!
                </h3>
                <div className="mt-5 flex justify-center space-x-4">
                  <Link
                    to="/tickets/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create New Ticket
                  </Link>
                  <Link
                    to="/tickets"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Tickets
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
