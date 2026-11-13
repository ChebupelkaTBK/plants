import AuthCard from "@/app/components/auth/AuthCard";
import RegisterForm from "@/app/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Создайте аккаунт"
      description="Соберите все свои растения и напоминания об уходе в одном месте."
    >
      <RegisterForm />
    </AuthCard>
  );
}
