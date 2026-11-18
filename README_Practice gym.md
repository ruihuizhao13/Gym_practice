# Practice Gym

An AI practice gym for first-time managers. A new manager reads a four-minute lesson built from their own situation, rehearses a hard feedback conversation with an AI employee, gets coached on it against an 8-dimension rubric, asks the coach follow-up questions, and retries from the turn that mattered.

Built for EDUC 584 as a user-testing prototype.

**Live site:** `https://<your-github-username>.github.io/practice-gym/`

## What's in this repository

| File | What it is |
| --- | --- |
| `index.html` | The whole prototype in one file: lesson, role-play, coach, scaffolding, and the "Show the AI calls" log |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are |
| `README.md` | This guide |
| `TESTER-GUIDE.md` | The message and instructions to send to testers |

## How the AI works here

Four prompts run live with Claude:

| Prompt | Job | Model |
| --- | --- | --- |
| A · Lesson Generator | Builds the micro-lesson from the manager's situation | Claude Sonnet 5.5 |
| B · Employee Persona | Plays the employee, with rule-based openness (1–5) | Claude Haiku 5.5 |
| C · Coach | Scores the conversation on the rubric, quoting the manager | Claude Sonnet 5.5 |
| D · Adaptive Scaffolding | Sets how much support the retry gets | Claude Sonnet 5.5 |

The page calls the Claude API directly from the browser with an API key that you, the facilitator, provide. There is no server. The key is saved only in the tester's browser and sent only to `api.anthropic.com`.

## Publish it on GitHub Pages (about 10 minutes)

1. Sign in to GitHub and click **New repository**. Name it `practice-gym`, set it to **Public**, and click **Create repository**.
2. On the new repository page, click **uploading an existing file**. Drag in `index.html`, `README.md`, `TESTER-GUIDE.md` and `.nojekyll`, then click **Commit changes**.
   - `.nojekyll` is hidden on a Mac. In Finder press **Cmd + Shift + .** to show it. If it still won't upload, skip it; the site works without it.
3. Go to **Settings → Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, the branch to **main**, and the folder to **/ (root)**. Click **Save**.
4. Wait 1–2 minutes and refresh. The page shows your site address: `https://<your-github-username>.github.io/practice-gym/`.

**Never put an API key in any file you upload.** The repository is public.

## Connect the AI (once, before testing)

1. Go to the [Claude Console](https://console.anthropic.com), sign in, and add a small amount of credit under **Billing** ($5 is plenty for three sessions).
2. Under **API keys**, click **Create key**. Name it `practice-gym-testing`.
3. Set a low spending limit for the workspace under **Limits**, so the key can't run up a bill.
4. Make each tester's link by adding the key after `#key=`:

   ```
   https://<your-github-username>.github.io/practice-gym/#key=sk-ant-XXXXXXXX
   ```

   When the tester opens the link, the page saves the key in their browser and removes it from the address bar. The pill at the bottom right changes to **AI connected**.

5. Alternatively, during the session, click **AI not connected** at the bottom right, paste the key, and click **Save and reload**.

**After testing, delete the key in the Console.** Every link stops working at once.

### Cost

Each AI reply costs about one cent. A full session (lesson, about eight role-play turns, coaching, a few coach questions and a retry) makes roughly 25–40 calls, so it costs under $1 per tester.

## Privacy and safety notes for testers

- The scenarios are fictional. Testers should not type real employees' names or private details.
- What testers type is sent to Anthropic's API to generate the replies. Nothing is stored by this site.
- Anyone who has a tester's link can use the key. Send links privately, keep the spending limit low, and delete the key when testing ends.
- A situation that sounds like harassment or a legal issue is not coached. The lesson tells the manager to go to HR.

## Troubleshooting

| What you see | What to do |
| --- | --- |
| "The AI isn't connected yet" | Open the full testing link with `#key=…`, or paste the key under **AI not connected** |
| "The AI key was not accepted" | The key was deleted or mistyped. Make a new key and a new link |
| "The AI model name is not available" | Open **AI not connected → Model** and enter a current Sonnet model ID from the [models overview](https://platform.claude.com/docs/en/models/overview) |
| "Too many requests right now" | Wait a minute, then click **Try again** |
| The site shows a 404 | Wait two minutes after turning on Pages, and check that the file is named exactly `index.html` |

## Credits

Design and prompts by [Team names]. Built with Claude (Anthropic).
