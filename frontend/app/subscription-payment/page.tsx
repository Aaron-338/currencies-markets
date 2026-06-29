"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Upload, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getActiveSubscriptions, cancelSubscription } from "@/lib/api";

type PaymentMethod = "mpesa" | "ecocash" | "skrill" | "paypal";

const merchantDetails: Record<
  PaymentMethod,
  { merchantNumber: string; merchantName: string }
> = {
  mpesa: { merchantNumber: "53031435", merchantName: "Cletus Lieta" },
  ecocash: { merchantNumber: "62495272", merchantName: "Kopano Mabusa" },
  skrill: { merchantNumber: "kopanogibsonmabusa@gmail.com", merchantName: "Kopano Mabusa" },
  paypal: { merchantNumber: "gibsonmabusa.ivrex@gmail.com", merchantName: "Kopano Mabusa" },
};

export default function SubscriptionPaymentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <SubscriptionPaymentPageContent />
    </Suspense>
  );
}

function SubscriptionPaymentPageContent() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      window.location.href = "/auth";
    },
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const serviceName = searchParams.get("service") || "IVREX Pro";
  const servicePrice = searchParams.get("price") || "$99/mo";

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingSubscriptions, setExistingSubscriptions] = useState<any[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);

  // Initialize full name from session
  useEffect(() => {
    if (session?.user?.name) setFullName(session.user.name);
  }, [session]);

  // Load existing subscriptions
  useEffect(() => {
    if (session?.accessToken) fetchExistingSubscriptions();
  }, [session]);

  const fetchExistingSubscriptions = async () => {
    setLoadingSubscriptions(true);
    try {
      const subscriptions = await getActiveSubscriptions();
      setExistingSubscriptions(subscriptions);
    } catch {
      toast({
        title: "Notice",
        description: "Unable to check existing subscriptions. You can still proceed with your purchase.",
        variant: "default",
      });
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      await cancelSubscription(subscriptionId);
      toast({ title: "Subscription Cancelled", description: "Your subscription has been cancelled." });
      fetchExistingSubscriptions();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Cancellation Failed",
        description: error.response?.data?.message || "Unable to cancel subscription.",
      });
    }
  };

  const getSubscriptionType = (serviceName: string) => {
    const mapping: Record<string, string> = {
      "Trading Signals": "trading_signals",
      "Copy Trading Access": "copy_trading",
      "Advanced Analytics": "advanced_analytics",
      "Personal Coaching": "personal_coaching",
      "IVREX Pro": "ivrex_pro",
      "Shares Challenge Consultation": "shares_challenge",
    };
    return mapping[serviceName] || "ivrex_pro";
  };

  const currentServiceType = getSubscriptionType(serviceName);
  const hasExistingSubscription = existingSubscriptions.some(
    sub => sub.type === currentServiceType && sub.status === "active"
  );

  // Redirect if subscription already exists
  useEffect(() => {
    if (!loadingSubscriptions && hasExistingSubscription) {
      toast({
        title: "Already Subscribed",
        description: `You already have an active subscription for ${serviceName}. Redirecting...`,
      });
      const serviceUrls: Record<string, string> = {
        trading_signals: "/dashboard?tab=signals",
        copy_trading: "/dashboard?tab=copy-trading",
        advanced_analytics: "/dashboard?tab=analytics",
        personal_coaching: "/dashboard?tab=coaching",
        shares_challenge: "/dashboard?tab=challenges",
        ivrex_pro: "/dashboard",
      };
      const timeout = setTimeout(() => router.push(serviceUrls[currentServiceType] || "/dashboard"), 2000);
      return () => clearTimeout(timeout);
    }
  }, [loadingSubscriptions]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: "Please upload a receipt smaller than 5MB." });
      return;
    }

    setReceiptImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = session?.accessToken;
      const res = await fetch("/api/subscriptions", {
        method: "POST",
              body: JSON.stringify({
        serviceName,
        type: currentServiceType,
        price: servicePrice.replace(/[^0-9.]/g, ""),
        paymentMethod,
        paymentPhoneNumber: phoneNumber,
        fullName,
        email: session?.user?.email,
      }),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create subscription.");
      }

      toast({ title: "Subscription Submitted", description: "Payment is being verified." });
      router.push("/dashboard");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Submission Failed", description: error.message || "Try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || loadingSubscriptions) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-3xl text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p>{status === "loading" ? "Loading session..." : "Checking subscription status..."}</p>
        </div>
      </div>
    );
  }

  if (hasExistingSubscription) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-3xl text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold">Already Subscribed!</h2>
          <p className="text-muted-foreground max-w-md">
            You already have an active subscription for {serviceName}. Redirecting...
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Subscription Payment</h1>

      {/* Service Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
          <CardDescription>You're subscribing to this service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-xl">{serviceName}</h2>
              <p className="text-muted-foreground">{servicePrice}</p>
            </div>
            <div className="text-xl font-bold">{servicePrice}</div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods & Merchant */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Select a payment method</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {["mpesa", "ecocash", "skrill", "paypal"].map(method => (
              <div
                key={method}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  paymentMethod === method ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
                onClick={() => setPaymentMethod(method as PaymentMethod)}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{method.charAt(0).toUpperCase() + method.slice(1)}</div>
                  <div className={`w-4 h-4 rounded-full ${paymentMethod === method ? "bg-primary" : "border border-gray-400"}`}></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Merchant Details</CardTitle>
            <CardDescription>Send payment to this account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Merchant Number / Email</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={merchantDetails[paymentMethod].merchantNumber}
                  readOnly
                  className="font-mono bg-muted"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(merchantDetails[paymentMethod].merchantNumber);
                    toast({ title: "Copied to clipboard!" });
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
            <div>
              <Label>Merchant Name</Label>
              <Input value={merchantDetails[paymentMethod].merchantName} readOnly className="bg-muted" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Confirmation Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Payment Confirmation</CardTitle>
            <CardDescription>Fill in your details </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number Used</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="+254..."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Account Email</Label>
              <Input id="email" type="email" value={session?.user?.email || ""} readOnly className="bg-muted" />
              <p className="text-xs text-muted-foreground">This email is tied to your account.</p>
            </div>



            <Alert className="bg-primary/5 border-primary/20">
              <Info className="h-4 w-4 text-primary" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription className="text-sm">
                Your subscription will be activated once payment is verified.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || loadingSubscriptions || !phoneNumber || !fullName || hasExistingSubscription}
            >
              {isSubmitting ? "Submitting..." : hasExistingSubscription ? "Cancel Existing Subscription First" : "Confirm & Submit Receipt"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
