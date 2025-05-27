/**
 * @file google-auth.helper
 * @description Helper for authenticating with the Google Calendar API using user OAuth2 tokens.
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import { env } from '@/config/env/env.config';

/**
 * Loads Google OAuth2 credentials from credentials.json.
 * @returns Google API credentials object.
 */
function loadOAuth2Credentials(): any {
    const credentialsPath = env.CREDENTIALS_PATH;
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    return credentials.installed || credentials.web;
}

/**
 * Loads an OAuth2 token for a specific user (by email).
 * @param email User's Google account email address.
 * @returns Parsed OAuth2 token object.
 * @throws Error if the token file does not exist.
 */
function loadUserToken(email: string): any {
    const safeEmail = email.replace(/[@.]/g, '_');
    const tokenPath = path.resolve(
        process.cwd(),
        'private',
        'tokens',
        `${safeEmail}_token.json`,
    );
    if (!fs.existsSync(tokenPath)) {
        throw new Error(`Token file not found for ${email} at ${tokenPath}`);
    }
    return JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
}

/**
 * Returns an authenticated Google OAuth2 client for the given user.
 * @param email Google account email (used to identify the token file).
 * @returns Google Auth OAuth2 client instance.
 */
export function getUserGoogleAuth(email: string): any {
    const credentials = loadOAuth2Credentials();
    const tokens = loadUserToken(email);

    const oauth2Client = new google.auth.OAuth2(
        credentials.client_id,
        credentials.client_secret,
        credentials.redirect_uris[0] || 'http://localhost',
    );
    oauth2Client.setCredentials(tokens);
    return oauth2Client;
}
