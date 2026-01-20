import { useLocation } from "wouter";
import { logout } from "@/auth";

export default function LogoutButton() {
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm underline hover:text-red-500"
    >
      Logout
    </button>
  );
}
