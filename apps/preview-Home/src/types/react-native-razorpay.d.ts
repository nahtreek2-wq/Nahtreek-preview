declare module 'react-native-razorpay' {
  export type RazorpayCheckoutOptions = {
    key: string;
    subscription_id?: string;
    order_id?: string;
    amount?: number;
    currency?: string;
    name?: string;
    description?: string;
    theme?: {color?: string};
    [key: string]: unknown;
  };
  const RazorpayCheckout: {
    open: (options: RazorpayCheckoutOptions) => Promise<Record<string, unknown>>;
  };
  export default RazorpayCheckout;
}
