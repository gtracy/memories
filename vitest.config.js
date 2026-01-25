
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            'twilio': path.resolve(process.cwd(), '__mocks__/twilio.js'),
            'googleapis': path.resolve(process.cwd(), '__mocks__/googleapis.js'),
            '@aws-sdk/client-s3': path.resolve(process.cwd(), '__mocks__/@aws-sdk/client-s3.js'),
            '@aws-sdk/s3-request-presigner': path.resolve(process.cwd(), '__mocks__/@aws-sdk/s3-request-presigner.js'),
        },
    },
    test: {
        globals: true,
        environment: 'node',
    },
});
