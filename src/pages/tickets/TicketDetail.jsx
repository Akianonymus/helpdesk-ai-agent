import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTickets } from "../../contexts/TicketsContext.jsx";
import TicketDetail from "../../components/tickets/TicketDetail.jsx";

const TicketDetailPage = () => {
  const { id } = useParams();
  const { currentTicket, getTicket, loading, error, setCurrentTicket } =
    useTickets();

  useEffect(() => {
    setCurrentTicket(null);
    if (id) {
      getTicket(id);
    }
  }, [id]);

  if (loading && !currentTicket) {
    return (
      <div className="min-h-screen w-full bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading ticket details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 py-8 px-6 max-w-7xl mx-auto">
      <TicketDetail ticket={currentTicket} />
    </div>
  );
};

export default TicketDetailPage;
