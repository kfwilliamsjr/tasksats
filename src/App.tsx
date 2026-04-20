import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth";
import { ProtectedRoute } from "./ProtectedRoute";
import { ActivityPage } from "./pages/ActivityPage";
import { HomePage } from "./pages/HomePage";
import { InvoicePreviewPage } from "./pages/InvoicePreviewPage";
import { MerchantPage } from "./pages/MerchantPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OfferPage } from "./pages/OfferPage";
import { RequestPage } from "./pages/RequestPage";
import { LeadsPage } from "./pages/LeadsPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { SignInPage } from "./pages/SignInPage";
import { StrategyPage } from "./pages/StrategyPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/offers/:slug" element={<OfferPage />} />
          <Route path="/request" element={<RequestPage />} />
          <Route path="/strategy" element={<StrategyPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/invoice-preview" element={<InvoicePreviewPage />} />
          <Route path="/invoice-preview/:invoiceId" element={<InvoicePreviewPage />} />
          <Route
            path="/activity"
            element={
              <ProtectedRoute allowedRoles={["merchant", "admin"]}>
                <ActivityPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/merchant"
            element={
              <ProtectedRoute allowedRoles={["merchant", "admin"]}>
                <MerchantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <LeadsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={["merchant", "admin"]}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
