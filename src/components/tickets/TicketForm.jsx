import { useRef, useState } from "react";
import { useTickets } from "../../contexts/TicketsContext.jsx";

const TicketForm = ({ onSuccess, onCancel }) => {
  const titleRef = useRef();
  const descriptionRef = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const { createTicket, error, clearError } = useTickets();

  const validateForm = () => {
    const errors = {};

    if (!titleRef.current.value.trim()) {
      errors.title = "Title is required";
    } else if (titleRef.current.value.trim().length < 5) {
      errors.title = "Title must be at least 5 characters";
    }

    if (!descriptionRef.current.value.trim()) {
      errors.description = "Description is required";
    } else if (descriptionRef.current.value.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const ticketData = {
        title: titleRef.current.value.trim(),
        description: descriptionRef.current.value.trim(),
      };

      const ticket = await createTicket(ticketData);

      // Clear form
      titleRef.current.value = "";
      descriptionRef.current.value = "";

      // Clear validation errors
      setValidationErrors({});

      if (onSuccess) {
        onSuccess(ticket._id);
      }
    } catch (err) {
      // Error is already set in the context
      console.error("Ticket creation error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create New Ticket</h2>
        <p className="mt-2 text-sm text-gray-600">
          Submit a new support request. Our AI will analyze and categorize your
          ticket automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Ticket Title *
          </label>
          <input
            ref={titleRef}
            type="text"
            id="title"
            name="title"
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 text-sm ${
              validationErrors.title
                ? "border-red-300 focus:border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
            placeholder="Brief description of your issue"
          />
          {validationErrors.title && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.title}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description *
          </label>
          <textarea
            ref={descriptionRef}
            id="description"
            name="description"
            rows={5}
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10 text-sm resize-vertical ${
              validationErrors.description
                ? "border-red-300 focus:border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
            placeholder="Please provide detailed information about your issue..."
          />
          {validationErrors.description && (
            <p className="mt-1 text-sm text-red-600">
              {validationErrors.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </div>
            ) : (
              "Create Ticket"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketForm;
