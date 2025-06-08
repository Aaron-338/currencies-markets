"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Github, Mail } from "lucide-react"

export default function AuthPage() {
  const [accountType, setAccountType] = useState<"retail" | "business">("retail")
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupCompanyName, setSignupCompanyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("http://localhost:3002/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Assuming your backend returns an access_token
      localStorage.setItem("access_token", data.access_token);
      setSuccess("Login successful!");
      // Redirect or update UI as needed, e.g., router.push("/dashboard");
      console.log("Login successful:", data);
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error("Login error:", err);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (signupPassword !== signupConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const payload: any = {
        firstName: signupFirstName,
        lastName: signupLastName,
        email: signupEmail,
        password: signupPassword,
      };

      if (accountType === "business") {
        payload.companyName = signupCompanyName;
      }

      const response = await fetch("http://localhost:3002/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Signup failed");
        return;
      }

      setSuccess("Signup successful! Please login.");
      // Optionally switch to login tab after successful signup
      // setTabValue("login");
      console.log("Signup successful:", data);
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error("Signup error:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <div className="mt-6 mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant={accountType === "retail" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setAccountType("retail")}
              >
                Retail Trader
              </Button>
              <Button
                variant={accountType === "business" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setAccountType("business")}
              >
                Business Client
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {accountType === "retail"
                ? "For individual traders and investors"
                : "For institutions and business partners"}
            </p>
          </div>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login to your account</CardTitle>
                <CardDescription>
                  Enter your credentials to access your {accountType === "retail" ? "personal" : "business"} account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="name@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <Input id="password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}
                <Button className="w-full" onClick={handleLogin}>Login</Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                  <Button variant="outline">
                    <Github className="mr-2 h-4 w-4" />
                    Meta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                  Enter your details to create your {accountType === "retail" ? "personal" : "business"} account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {accountType === "business" && (
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input id="company" placeholder="Acme Inc." value={signupCompanyName} onChange={(e) => setSignupCompanyName(e.target.value)} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" value={signupFirstName} onChange={(e) => setSignupFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" value={signupLastName} onChange={(e) => setSignupLastName(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="name@example.com" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} />
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="terms" className="h-4 w-4 rounded border-gray-300" />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the{" "}
                    <a href="#" className="text-primary hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}
                <Button className="w-full" onClick={handleSignup}>Create Account</Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                  <Button variant="outline">
                    <Github className="mr-2 h-4 w-4" />
                    Meta
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <a href="#" className="text-primary hover:underline">
                    Login
                  </a>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
