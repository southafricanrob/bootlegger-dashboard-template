import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { APP_NAME } from "@/lib/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignInForm } from "./sign-in-form";

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
          <CardTitle className="text-xl">{APP_NAME}</CardTitle>
          <CardDescription>Sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm appName={APP_NAME} microsoftEnabled={microsoftEnabled} />
        </CardContent>
      </Card>
    </main>
  );
}
