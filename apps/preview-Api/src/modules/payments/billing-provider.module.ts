import {Module} from '@nestjs/common';
import {RazorpayProvider} from './razorpay.provider';

// Shared Razorpay REST client. Imported by PaymentsModule and
// MembershipsModule so neither feature module depends on the other for it.
@Module({
  providers: [RazorpayProvider],
  exports: [RazorpayProvider],
})
export class BillingProviderModule {}
