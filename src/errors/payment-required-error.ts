import { ApplicationError } from '@/protocols';

export function paymentRequiredError(): ApplicationError {
  return {
    name: 'PaymentRequired',
    message: 'Maybe your ticket is not paid yet, isRemote or doesnt includes hotel! Please, check and try again!',
  };
}
