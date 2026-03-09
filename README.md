# Inspiration

Poor financial decisions are often inspired by malicious actors on social media exploiting their audience and posing as experts. We wanted to allow for more transparency by providing real stats of what would happen if people were to follow said advice.

# What it does

TradeTruth lets you upload a financial tip in a multitude of convenient formats such as a video file, a link to a clip online, or raw text and get real statistics of how it would perform. Our app runs a Monte Carlo simulation as a well as explicitly mark potential red flags. It outputs a list of warnings for flagged concepts (such as "Guaranteed Return"), alongside a series of visualizations that show the output of the simulation.

# How we built it

Next.js 15 full-stack app with MongoDB for persistence and NextAuth + Google OAuth for auth. Financial tips and video URLs are transcribed via OpenAI Whisper + yt-dlp, then parsed into structured trade objects by GPT-4o-mini. A custom Monte Carlo engine in pure TypeScript bootstraps 2,000 price paths from real historical market data (via Polygon.io) to generate P&L distributions. Mantine UI handles the frontend, and all sensitive logic lives in server-side API routes.

# Running

1. Clone the repository
2. Ensure NodeJS is installed
3. Ensure `pnpm` is installed
4. Run `pnpm install` in the root directory
5. Put all the credentials into a `.env.local` file in the root directory
  - `AUTH_SECRET` a securely generated secret key for encrypting auth tokens
  - `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` for OAuth with Google
  - `MONGODB_URI` for the database
  - `OPENAI_API_KEY` for Whisper and ChatGPT use
6. Run `pnpm run dev` and visit [http://localhost:3000] to view the site


# App Screenshots

<img width="2872" height="1248" alt="image" src="https://github.com/user-attachments/assets/49d9c920-46b9-410d-827a-25ba8e02efc9" />
<img width="2876" height="1710" alt="Screenshot 2026-03-08 at 19-59-02 TradeTruth" src="https://github.com/user-attachments/assets/20af0666-f5e0-4601-ad2a-91b6a58d0cfc" />
<img width="2874" height="1862" alt="image" src="https://github.com/user-attachments/assets/119ffaaf-871b-4831-a53e-0df6d0ac132b" />
