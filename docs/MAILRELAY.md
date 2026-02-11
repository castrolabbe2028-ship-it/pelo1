Mailrelay integration (serverless)

Overview
--------
This repo includes a Vercel serverless function to send a demo request email using Mailrelay.

Files added
-----------
- `api/send-demo.js`  — Vercel serverless function that accepts POST { email } and forwards to Mailrelay API.
- `js/main.js`       — Frontend handler attached to the "Agendar Demo" button that calls the API.

Environment variables (set these in Vercel Project Settings -> Environment Variables)
------------------------------------------------------------------------------------
- `MAILRELAY_API_KEY` (required)  — Your Mailrelay API key (keep secret)
- `FROM_EMAIL` (optional)         — Sender address to use (default: no-reply@smartstudent.site)
- `MAILRELAY_API_URL` (optional)  — If required, set the Mailrelay API URL (default: https://api.mailrelay.com/1.0/send)

Testing locally
---------------
1. Install Vercel CLI (optional): `npm i -g vercel`.
2. Run `vercel dev` in project root and set env variables in `.env` as needed.
3. Open `http://localhost:3000`, enter an email in the hero CTA and click "Agendar Demo".
4. Check the serverless function logs for errors.

Notes
-----
- The current function uses a generic Mailrelay HTTP endpoint. If your Mailrelay plan uses a different URL or payload, update `MAILRELAY_API_URL` or adjust the payload inside `api/send-demo.js`.
- For production, consider protecting the endpoint with rate-limiting and/or reCAPTCHA to prevent abuse.

If you want, I can now run a quick test with your API key locally (you would set it as an env var), or I can prepare a commit and push when you tell me to deploy to Vercel. I will not push changes until you explicitly ask me to do so.
