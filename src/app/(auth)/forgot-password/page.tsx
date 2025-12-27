'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Loader2, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsSent(true);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <form onSubmit={handleReset}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Forgot Password</CardTitle>
          <CardDescription>
            {!isSent
              ? 'Enter your email to receive a password reset link.'
              : "Check your inbox for a password reset link."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {isSent ? (
            <div className="flex flex-col items-center justify-center text-center p-4">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <p className="text-muted-foreground">If an account exists for {email}, a reset link has been sent.</p>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading}/>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {!isSent && (
            <Button type="submit" className="w-full bg-secondary hover:bg-green-600 text-black" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
            </Button>
          )}
          <div className="text-center text-sm">
              <Link href="/login" className="underline">
                Back to Log in
              </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
