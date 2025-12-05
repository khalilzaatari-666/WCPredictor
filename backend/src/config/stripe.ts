import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_development';

if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_stripe_key')) {
    console.warn('Warning: Using dummy Stripe key. Payment features will not work.');
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    typescript: true,
});

export const STRIPE_CONFIG = {
    currency: 'mad',
    predictionPrice: 1999, // in cents
};

