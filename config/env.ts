import Constants, { AppOwnership } from 'expo-constants';

// Define the shape of our environment variables
interface Environment {
  GOOGLE_CLOUD_API_KEY: string;
  API_URL: string;
}

// Get the environment variables from Expo Constants
const ENV = Constants.expoConfig?.extra as Environment;

// Validate required environment variables
const requiredVariables = ['GOOGLE_CLOUD_API_KEY', 'API_URL'];

for (const variable of requiredVariables) {
  if (!ENV[variable as keyof Environment]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

export default {
  GOOGLE_CLOUD_API_KEY: ENV.GOOGLE_CLOUD_API_KEY,
  API_URL: ENV.API_URL,
  
  // Add any computed configuration values here
  isProduction: Constants.appOwnership === AppOwnership
};