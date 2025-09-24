import { ProtectedRoute } from "@/components/ProtectedRoute";
import { NutritionistDashboard } from '@/components/Nutritionist/NutritionistDashboard';

export default function NutritionistPage() {
  return (
    <ProtectedRoute requiredUserType="nutritionist" redirectTo="/">
      <NutritionistDashboard />
    </ProtectedRoute>
  );
}