import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "../App";

const API = "https://socialapp-u7hp.onrender.com";

type Props = {
  onLogin: (token: string, user: User) => void;
};

type Mode = "login" | "register";

export default function AuthPage({ onLogin }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = new FormData(e.currentTarget);

    try {
      const endpoint = mode === "login" ? `${API}/login` : `${API}/register`;
      const body =
        mode === "login"
          ? { username: data.get("username"), password: data.get("password") }
          : {
            username: data.get("username"),
            visibility: "public",
            display_name: data.get("display_name"),
            email: data.get("email"),
            phone: data.get("phone"),
            birthdate: data.get("birthdate"),
            password: data.get("password"),
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.message ?? "Something went wrong");
        return;
      }

      onLogin(json.token, json.user);
    } catch {
      setError("Network error — is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-blue-100">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-center text-3xl font-bold tracking-tight text-purple-600">Sofie Socialapp</h1>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-purple-700">
              {mode === "login" ? "Welcome back 👋" : "Create your account ✨"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="yourname"
                  autoComplete="username"
                  required
                />
              </div>
              {mode === "register" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="display_name">Display name</Label>
                    <Input id="display_name" name="display_name" required />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" placeholder="+467..." required />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="birthdate">Birthdate</Label>
                    <Input id="birthdate" name="birthdate" type="date" required />
                  </div>
                </>
              )}

              {mode === "register" && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" disabled={loading} className="w-full">
                {loading
                  ? "Loading…"
                  : mode === "login"
                    ? "Sign in"
                    : "Create account"}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button type="button" onClick={toggle} className="underline text-foreground">
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
