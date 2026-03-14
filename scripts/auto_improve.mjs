import { readFile, writeFile } from 'node:fs/promises'
import { execSync } from 'node:child_process'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY missing')
  process.exit(1)
}

const files = ['index.html', 'styles.css', 'app.js', 'README.md']
const base = Object.fromEntries(
  await Promise.all(files.map(async (file) => [file, await readFile(new URL(`../${file}`, import.meta.url), 'utf8')]))
)

const prompt = `You are improving a tiny desktop web app called Focus Desk. Make ONE small, high-quality improvement that keeps the app fully client-side and dependency-free. Keep layout desktop-first. Return a JSON object with updated files for index.html, styles.css, app.js, README.md (full contents), plus a short summary field.

Rules:
- Must keep app fully client-side; no build tools.
- Avoid huge changes; a small improvement is enough.
- Preserve existing features.
- If no changes needed, still return files unchanged and summary saying "No change".

Current files:
${JSON.stringify(base)}
`

const response = await fetch('https://api.openai.com/v1/responses', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${OPENAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'gpt-4.1-mini',
    input: prompt,
    temperature: 0.4,
    max_output_tokens: 2000,
  }),
})

if (!response.ok) {
  const text = await response.text()
  throw new Error(`OpenAI error: ${response.status} ${text}`)
}

const data = await response.json()
const content = data.output?.[0]?.content?.[0]?.text || ''
let parsed
try {
  parsed = JSON.parse(content)
} catch (err) {
  console.error('Failed to parse response as JSON')
  console.error(content)
  process.exit(1)
}

for (const file of files) {
  if (typeof parsed[file] !== 'string') {
    console.error(`Missing file content for ${file}`)
    process.exit(1)
  }
}

await Promise.all(files.map((file) => writeFile(new URL(`../${file}`, import.meta.url), parsed[file])))

const summary = typeof parsed.summary === 'string' ? parsed.summary : 'Automated improvement'
await writeFile(new URL('../LAST_AUTOMATION.md', import.meta.url), `## ${new Date().toISOString()}\n${summary}\n`)

execSync('git add .', { stdio: 'inherit' })
const status = execSync('git status --porcelain').toString().trim()
if (status) {
  execSync(`git commit -m "${summary.replace(/\"/g, '')}"`, { stdio: 'inherit' })
  execSync('git push', { stdio: 'inherit' })
} else {
  console.log('No changes to commit')
}
