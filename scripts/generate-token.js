/**
 * @file generate-token.js
 * @description Script to generate and store OAuth2 tokens for Google Calendar API per user, requesting the full redirect URL for easy code extraction.
 * @usage node scripts/generate-token.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.resolve(__dirname, '../private/credentials.json');
const TOKEN_DIR = path.resolve(__dirname, '../private/tokens');

/**
 * Loads OAuth2 credentials from the credentials.json file.
 * @returns {object} The OAuth2 credentials.
 * @throws {Error} If credentials.json is not found.
 */
function getCredentials() {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        throw new Error(`credentials.json not found at: ${CREDENTIALS_PATH}`);
    }
    const content = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
    return JSON.parse(content).installed || JSON.parse(content).web;
}

/**
 * Creates an OAuth2 client using the loaded credentials.
 * @returns {import('googleapis').auth.OAuth2} OAuth2 client instance.
 */
function getOAuth2Client() {
    const credentials = getCredentials();
    return new google.auth.OAuth2(
        credentials.client_id,
        credentials.client_secret,
        credentials.redirect_uris[0] || 'http://localhost',
    );
}

/**
 * Prompts the user for input in the terminal.
 * @param {string} query - The prompt message to display.
 * @returns {Promise<string>} User input.
 */
function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) =>
        rl.question(query, (ans) => {
            rl.close();
            resolve(ans);
        }),
    );
}

/**
 * Extracts the authorization code from a redirect URL.
 * @param {string} urlString - The full redirect URL returned by Google OAuth.
 * @returns {string|null} The authorization code or null if not found.
 */
function extractCodeFromUrl(urlString) {
    try {
        const url = new URL(urlString);
        return url.searchParams.get('code');
    } catch {
        return null;
    }
}

/**
 * Main script flow: prompts user for email, handles OAuth2 flow, saves token, and lists accessible calendars.
 */
async function main() {
    if (!fs.existsSync(TOKEN_DIR)) fs.mkdirSync(TOKEN_DIR);

    const email = await askQuestion(
        'Enter the Google account email to authorize: ',
    );
    const oAuth2Client = getOAuth2Client();

    const SCOPES = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
    ];

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent',
    });

    console.log('\n1. Open this URL in your browser and complete the sign-in:');
    console.log(authUrl);
    const redirectUrl = await askQuestion(
        '\n2. Paste here the FULL redirect URL after accepting permissions: ',
    );

    const code = extractCodeFromUrl(redirectUrl.trim());
    if (!code) {
        console.error(
            '\nERROR: Could not extract "code" from the URL. Please paste the entire URL shown in the browser after accepting permissions.',
        );
        process.exit(1);
    }

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const tokenPath = path.join(
        TOKEN_DIR,
        `${email.replace(/[@.]/g, '_')}_token.json`,
    );
    fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
    console.log(`\n Token saved to: ${tokenPath}`);

    // Optional: list accessible calendars for verification
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    const res = await calendar.calendarList.list();
    console.log('\nAccessible calendars:');
    for (const cal of res.data.items) {
        console.log(`- ${cal.summary} (${cal.id})`);
    }
}

main().catch((e) => {
    console.error('ERROR:', e.message);
    process.exit(1);
});
