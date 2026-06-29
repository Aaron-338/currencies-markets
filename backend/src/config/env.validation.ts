import 'dotenv/config';

export function validateEnvironmentVariables() {
  const requiredEnvVars = [
    'JWT_SECRET',
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'FMP_API_KEY',
    'FRED_API_KEY',
    'MARKETAUX_API_TOKEN',
    'ALPHAVANTAGE_API_KEY',
    'NEWS_API_KEY',
  ];

  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`,
    );
  }

  console.log('✅ Environment variables validated successfully.');
}
