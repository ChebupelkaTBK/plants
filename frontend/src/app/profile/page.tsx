import AccountDashboard from "@/app/components/account/AccountDashboard";
import plants from "@/app/plants.json";

export default function ProfilePage() {
  return <AccountDashboard plants={plants} />;
}
