import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PAYMENT_METHOD_DETAILS } from "@/lib/constants";
import { 
  CreditCard, 
  Smartphone, 
  Building, 
  Bitcoin, 
  Apple,
  Chrome,
  Zap,
  Clock,
  Shield,
  ArrowRight
} from "lucide-react";
import { FaPaypal, FaGoogle } from "react-icons/fa";

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodSelect: (method: string) => void;
  amount: number;
  currency: string;
  onProceedToPayment: () => void;
  isProcessing?: boolean;
}

const paymentIcons = {
  "credit-card": CreditCard,
  "paypal": FaPaypal,
  "smartphone": Smartphone,
  "building": Building,
  "bitcoin": Bitcoin,
  "apple": Apple,
  "google": FaGoogle
};

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodSelect,
  amount,
  currency,
  onProceedToPayment,
  isProcessing = false
}: PaymentMethodSelectorProps) {
  const [showAllMethods, setShowAllMethods] = useState(false);

  const popularMethods = ['stripe', 'paypal', 'revolut'];
  const allMethods = Object.keys(PAYMENT_METHOD_DETAILS);
  const displayMethods = showAllMethods ? allMethods : popularMethods;

  const getIcon = (iconName: string) => {
    const IconComponent = paymentIcons[iconName as keyof typeof paymentIcons] || CreditCard;
    return <IconComponent className="w-5 h-5" />;
  };

  const getProcessingTimeIcon = (time: string) => {
    return time === "Instant" ? <Zap className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-yellow-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-neutral-dark mb-2">Choose Payment Method</h3>
        <p className="text-muted-foreground">
          Complete your payment of <span className="font-semibold">{currency} {amount}</span> to receive your valuation
        </p>
      </div>

      <RadioGroup value={selectedMethod} onValueChange={onMethodSelect} className="space-y-3">
        {displayMethods.map((methodKey) => {
          const method = PAYMENT_METHOD_DETAILS[methodKey as keyof typeof PAYMENT_METHOD_DETAILS];
          if (!method.supported) return null;

          return (
            <div key={methodKey}>
              <Label htmlFor={methodKey} className="cursor-pointer">
                <Card 
                  className={`transition-all duration-200 hover:shadow-md ${
                    selectedMethod === methodKey 
                      ? 'ring-2 ring-primary border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value={methodKey} id={methodKey} className="mt-1" />
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-neutral-100">
                            {getIcon(method.icon)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-neutral-dark">{method.name}</h4>
                              {popularMethods.includes(methodKey) && (
                                <Badge variant="secondary" className="text-xs">Popular</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-sm">
                          {getProcessingTimeIcon(method.processingTime)}
                          <span className="text-muted-foreground">{method.processingTime}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{method.fees}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      {!showAllMethods && (
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => setShowAllMethods(true)}
            className="text-primary hover:text-primary/80"
          >
            Show more payment options
          </Button>
        </div>
      )}

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4" />
          <span>Secure 256-bit SSL encryption</span>
        </div>

        <Button 
          onClick={onProceedToPayment}
          disabled={!selectedMethod || isProcessing}
          className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3"
          size="lg"
        >
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>
                Pay {currency} {amount} with {selectedMethod ? PAYMENT_METHOD_DETAILS[selectedMethod as keyof typeof PAYMENT_METHOD_DETAILS]?.name : 'Selected Method'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </Button>

        <div className="text-xs text-center text-muted-foreground">
          By proceeding, you agree to our terms of service and privacy policy.
          <br />
          Your payment is processed securely and your data is protected.
        </div>
      </div>
    </div>
  );
}