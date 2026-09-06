import { lazy, Suspense } from "react";
import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PricesProvider } from "./context/PricesProvider";
import { NotificationsProvider } from "./context/NotificationsProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Sidebar from "./components/Sidebar";
import TopBarActions from "./components/TopBarActions";
import ErrorBoundary from "./components/ErrorBoundary";
import RouteLoading from "./components/RouteLoading";

// Each page is its own chunk, fetched on first visit — the initial bundle
// no longer has to ship Admin (and everything else) up front.
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const CreateAccount = lazy(() => import("./pages/CreateAccount"));
const MyWallet = lazy(() => import("./pages/MyWallet"));
const AddBankAccount = lazy(() => import("./pages/AddBankAccount"));
const Analyze = lazy(() => import("./pages/Analyze"));
const Exchange = lazy(() => import("./pages/Exchange"));
const Profile = lazy(() => import("./pages/Profile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const Settings = lazy(() => import("./pages/Settings"));
const Admin = lazy(() => import("./pages/Admin"));

// The signed-in app shell. `Outlet` renders whichever child route matched;
// keying it by pathname replays the fade on navigation and, along with it,
// remounts the boundary/suspense pair so a crashed or mid-load page doesn't
// stick around after the user navigates away.
function DashboardLayout() {
  const location = useLocation();
  return (
    <PricesProvider>
      <NotificationsProvider>
        <div className="app-shell">
          <Sidebar />
          <div className="main-content">
            <TopBarActions />
            <div key={location.pathname} className="route-fade">
              <ErrorBoundary>
                <Suspense fallback={<RouteLoading />}>
                  <Outlet />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </div>
        <Toaster
          position="top-right"
          theme="dark"
          style={{
            "--normal-bg": "var(--card-bg-alt)",
            "--normal-border": "var(--border)",
            "--normal-text": "var(--text)",
            "--success-bg": "var(--card-bg-alt)",
            "--success-border": "var(--wash-green-line)",
            "--success-text": "var(--text)",
            "--error-bg": "var(--card-bg-alt)",
            "--error-border": "var(--wash-red-line)",
            "--error-text": "var(--text)",
          }}
        />
      </NotificationsProvider>
    </PricesProvider>
  );
}

function ProtectedShell() {
  return (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  );
}

function AdminShell() {
  return (
    <AdminRoute>
      <DashboardLayout />
    </AdminRoute>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<CreateAccount />} />

              <Route element={<ProtectedShell />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/wallet" element={<MyWallet />} />
                <Route path="/wallet/bank/new" element={<AddBankAccount />} />
                <Route path="/analyze" element={<Analyze />} />
                <Route path="/exchange" element={<Exchange />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/edit" element={<EditProfile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              <Route element={<AdminShell />}>
                <Route path="/admin" element={<Admin />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
