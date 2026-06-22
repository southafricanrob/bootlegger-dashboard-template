import { requireUser } from "@/lib/session";
import { APP_NAME } from "@/lib/config";
import { TopNav } from "@/components/top-nav";
import { UserMenu } from "@/components/user-menu";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const isAdmin = user.role === "admin";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <span className="font-semibold">{APP_NAME}</span>
            <TopNav isAdmin={isAdmin} />
          </div>
          <UserMenu name={user.name} email={user.email} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
