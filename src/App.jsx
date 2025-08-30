import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { TicketsProvider } from "./contexts/TicketsContext.jsx";
import { AIProcessingProvider } from "./contexts/AIProcessingContext.jsx";
import Navigation from "./components/layout/Navigation.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Tickets from "./pages/tickets/Tickets.jsx";
import NewTicket from "./pages/tickets/NewTicket.jsx";
import TicketDetailPage from "./pages/tickets/TicketDetail.jsx";

function App() {
  return (
    <AuthProvider>
      <AIProcessingProvider>
        <TicketsProvider>
          <Router>
            <div className="min-h-[100vh] flex flex-col">
              <Navigation />
              <main>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tickets"
                    element={
                      <ProtectedRoute>
                        <Tickets />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tickets/new"
                    element={
                      <ProtectedRoute>
                        <NewTicket />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tickets/:id"
                    element={
                      <ProtectedRoute>
                        <TicketDetailPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </Router>
        </TicketsProvider>
      </AIProcessingProvider>
    </AuthProvider>
  );
}

export default App;
