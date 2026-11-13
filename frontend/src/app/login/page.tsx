import AuthCard from "@/app/components/auth/AuthCard";
import LoginForm from "@/app/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthCard
      title="С возвращением!"
      description="Войдите, чтобы продолжить заботиться о своих растениях."
    >
      <LoginForm />
    </AuthCard>
  );
}
