import { useNavigate } from "react-router-dom";
import TicketForm from "../../components/tickets/TicketForm.jsx";

const NewTicket = () => {
  const navigate = useNavigate();

  const handleSuccess = (id) => {
    // Redirect to tickets list after successful creation
    navigate(`/tickets/${id}`);
  };

  const handleCancel = () => {
    // Go back to tickets list
    navigate("/tickets");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 mt-4">
      <TicketForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
};

export default NewTicket;
