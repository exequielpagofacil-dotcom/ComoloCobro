import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { isAdminAuthenticated } from "@/lib/auth";

export default async function AdminLoginPage() {
  const authenticated = await isAdminAuthenticated();

  if (authenticated) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <LoginForm />
    </main>
  );
}
