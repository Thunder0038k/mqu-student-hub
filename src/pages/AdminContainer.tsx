import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminDashboard from "./AdminDashboard";

export default function AdminContainer() {
  return (
    <ProtectedRoute requireAdmin={true}>
      {() => <AdminDashboard />}
    </ProtectedRoute>
  );
}