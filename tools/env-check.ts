import * as Joi from 'joi';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
dotenv.config({ path: resolve(__dirname, '../.env') });

// Define the validation schema
const envVarsSchema = Joi.object({
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_TTL: Joi.string().required(),
  JWT_REFRESH_TTL: Joi.string().required(),
  DATABASE_URL: Joi.string().uri().required(),
  PORT: Joi.number().default(3000),
}).unknown(true); // .unknown(true) allows other environment variables

// Validate environment variables
const { error, value: envVars } = envVarsSchema.validate(process.env);

if (error) {
  console.error(`🔴 Environment variable validation error: ${error.message}`);
  console.error('👉 Please check your .env file and ensure all required variables are set correctly.');
  process.exit(1);
} else {
  console.log('✅ Environment variables are configured correctly.');
  process.exit(0);
}
