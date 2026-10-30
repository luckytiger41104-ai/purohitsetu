import { ConfirmationResult } from 'firebase/auth';

declare global {
  interface Window {
    Razorpay?: any;
    Capacitor?: any;
    OneSignalDeferred?: any[];
    recaptchaVerifier?: any;
    confirmationResult?: ConfirmationResult;
    adminRecaptchaVerifier?: any;
    adminConfirmationResult?: ConfirmationResult;
  }
}

export {};