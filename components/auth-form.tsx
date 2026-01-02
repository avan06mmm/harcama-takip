"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setError("Kayıt başarılı! Giriş yapabilirsiniz.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9ff] dark:bg-[#0f1115] px-4 overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />

      <Card className="w-full max-w-md glass-card shadow-2xl border-white/20 relative z-10 animate-in fade-in zoom-in duration-500">
        <CardHeader className="space-y-1 text-center pb-8 border-b border-border/50">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-3xl bg-primary/10 text-primary float-animation">
              <Wallet className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            {isSignUp ? "Aramıza Katılın" : "Tekrar Hoş Geldiniz"}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {isSignUp ? "Hemen ücretsiz hesabınızı oluşturun" : "Finansal yolculuğunuza devam edin"}
          </p>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold tracking-wide ml-1">E-POSTA</label>
              <Input
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-background/50 border-border/50 focus:ring-2 focus:ring-primary/20 transition-all rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold tracking-wide ml-1">ŞİFRE</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                className="h-12 bg-background/50 border-border/50 focus:ring-2 focus:ring-primary/20 transition-all rounded-2xl"
              />
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base font-semibold rounded-2xl gradient-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all" disabled={loading}>
              {loading ? "Bağlanılıyor..." : isSignUp ? "Kayıt Ol" : "Giriş Yap"}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-medium">veya</span>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {isSignUp ? "Zaten hesabınız var mı?" : "Henüz bir hesabınız yok mu?"}{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary font-bold hover:underline transition-all"
              >
                {isSignUp ? "Giriş Yapın" : "Kayıt Olun"}
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );

}
