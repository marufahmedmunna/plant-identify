"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { signOut, updateEmail, updateProfile } from "firebase/auth";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }
      if (email !== user.email) {
        await updateEmail(user, email);
      }
      toast({
        title: "Profile Updated",
        description: "Your information has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
      await user.reload();
    }
  };
 
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold font-headline mb-4 text-center">
        My Profile
      </h1>
      <div className="flex flex-col items-center space-y-4 mb-8">
        <Avatar className="h-24 w-24">
          <AvatarImage
            src={
              user?.photoURL ||
              user?.providerData?.[0]?.photoURL ||
              "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
              
            }
            // placeholder link image
            alt="User avatar"
          />
          <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="text-xl font-semibold">{user?.displayName}</p>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600"
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="animate-spin" /> : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <Button variant="destructive" className="w-full bg-red-500" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Log Out
      </Button>
    </div>
  );
}
