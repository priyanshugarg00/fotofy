import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  useStripe,
  useElements,
  PaymentElement
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";

interface CheckoutFormProps {
  clientSecret: string;
}

const CheckoutForm = ({ clientSecret }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!stripe || !clientSecret) {
      return;
    }

    // Check if payment was successful after redirect
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) return;

      switch (paymentIntent.status) {
        case "succeeded":
          setPaymentSuccess(true);
          toast({
            title: "Payment Successful",
            description: "Thank you for your booking!",
          });
          setTimeout(() => {
            setLocation("/dashboard/customer");
          }, 2000);
          break;
        case "processing":
          toast({
            title: "Payment Processing",
            description: "Your payment is processing.",
          });
          break;
        case "requires_payment_method":
          // Reset in case it was previously successful
          setPaymentError("Your previous payment attempt failed. Please try again.");
          break;
        default:
          setPaymentError("Something went wrong with your payment.");
          break;
      }
    });
  }, [stripe, clientSecret, setLocation, toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setPaymentError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: "if_required",
    });

    if (error) {
      setPaymentError(error.message || "An unknown error occurred");
      setIsLoading(false);
    } else {
      setPaymentSuccess(true);
      toast({
        title: "Payment Successful",
        description: "Thank you for your booking!",
      });
      setTimeout(() => {
        setLocation("/dashboard/customer");
      }, 2000);
    }
  };

  if (paymentSuccess) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">Payment Successful!</h3>
          <p className="text-green-700 mb-6">
            Your booking has been confirmed. You will be redirected to your dashboard shortly.
          </p>
          <Button 
            variant="outline" 
            className="border-green-500 text-green-600 hover:bg-green-50"
            onClick={() => setLocation("/dashboard/customer")}
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement 
        options={{
          layout: {
            type: 'tabs',
            defaultCollapsed: false,
          }
        }} 
      />
      
      {paymentError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-4">
          <p>{paymentError}</p>
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full mt-6"
        disabled={isLoading || !stripe || !elements}
      >
        {isLoading ? (
          <>
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Pay Now"
        )}
      </Button>
      
      <p className="text-center text-sm text-gray-500 mt-4">
        You won't be charged until the photographer confirms your booking.
      </p>
    </form>
  );
};

export default CheckoutForm;
