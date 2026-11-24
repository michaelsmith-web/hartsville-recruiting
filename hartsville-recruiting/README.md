# Hartsville Red Foxes Recruiting Website

A free-hosting-ready responsive recruiting website using your Hartsville images and Google Sheets as the roster database.

## Included
- Homepage with Hartsville stadium and logo
- Player cards, individual profile modal, search, position and class filters
- Headshots from `Picture Links` (or `Player Photo`, `Photo`, `Headshot`) column
- Hudl highlights links and player metrics
- Automatic Google Sheets refresh every 2 minutes and server-side caching for approximately 60 seconds
- Blank player rows are hidden
- Personal student contact information and transcript images are deliberately NOT displayed publicly

## Publish on Vercel
1. Create a free Vercel account, subject to Vercel's current free-plan eligibility and limits.
2. Upload this folder to a GitHub repository, then import the repository into Vercel as a new project. Framework preset: Other. Root directory: repository root. No build command is required. Output directory: `public`.
3. The API at `/api/players` uses Google Sheets ID `1gg2IkDkR-1gu9OkPx9OV3ClYMqlzd464qVPcdVCw9pU`, first tab (`gid=0`) by default.
4. Make the **specific recruiting tab** publicly viewable (only if its contents are approved for publication). Alternatively, use Google Sheets File > Share > Publish to web > select recruiting tab > CSV, then set Vercel environment variable `SHEET_CSV_URL` to that published CSV link. This is preferred if the original spreadsheet contains private data on other tabs. The published CSV must contain only approved public information.
5. If the recruiting tab isn't the first tab, set Vercel environment variable `SHEET_GID` to the numeric gid from the tab URL, or use `SHEET_CSV_URL`.
6. Redeploy after setting environment variables. Visit `/api/players` to verify JSON is returned. If an error is returned, verify public CSV access and the `Player Name` header.
7. Choose project name `hartsville-recruiting` if available to request `hartsville-recruiting.vercel.app`. Availability is not guaranteed.

## Sheet columns
The uploaded sample has: `Number`, `Player Name`, `Position`, `Height`, `Weight`, `40 Time`, `Hudl`, `Player's Contact`, `GPA`, `Transcript Image`.

The website additionally supports: `Picture Links`, `Graduation Year`, `Coach Comments`. It detects the header row automatically even if a title row precedes it.

**Privacy:** Only publish information approved by school administration and families. Do not put personal phone numbers, addresses, transcripts, or private educational records in a publicly published CSV. The website does not display contact/transcript columns, but the CSV source itself is public if published.

## Photos
Place approved headshots in Google Drive, allow public viewing for each photo, and paste its sharing link into `Picture Links`. The site attempts to use Drive's thumbnail service. Google Drive may limit hotlinking, so if photos fail to display, move them to a publicly accessible image host and use direct HTTPS image URLs. Missing photos use the Red Foxes logo.

## Local preview
The API is a Vercel serverless function. Install the Vercel CLI and run `vercel dev` to preview the complete site locally. Opening `public/index.html` alone does not activate the API.
