import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { APP_NAME } from "@/lib/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { SignInForm } from "./sign-in-form";
import { Logo } from "@/components/logo";

export default async function SignInPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const microsoftEnabled = Boolean(
    process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET,
  );

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center gap-2">
            <Logo className="text-2xl" />
            <span className="bg-brand h-0.5 w-10 rounded-full" />
          </div>
          <CardDescription className="pt-1">Sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm appName={APP_NAME} microsoftEnabled={microsoftEnabled} />
        </CardContent>
      </Card>
    </main>
  );
}
