export type Env = {
  ENVIRONMENT: string;
  FIREBASE_PROJECT_ID: string;
  CORS_ORIGIN: string;
  FIREBASE_SERVICE_ACCOUNT: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  S3_BUCKET?: string;
  BEELY_API_KEY?: string;
  APP_URL?: string;
  WALLET_JWT_SECRET?: string;
};
