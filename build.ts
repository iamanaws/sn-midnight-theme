import { createWriteStream, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import archiver from 'archiver'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))
const { sn, version, author, description } = pkg

// Ensure dist exists
mkdirSync('dist', { recursive: true })

// Compile SCSS (compressed)
execSync('sass src/main.scss dist/dist.css --style=compressed --no-source-map')

// Generate <identifier>.json
writeFileSync(`dist/${sn.identifier}.json`, JSON.stringify({
  ...sn,
  version,
  publisher: author,
  description,
}, null, 2))

// Create latest.zip
await new Promise<void>((resolve, reject) => {
  const archive = archiver('zip', { zlib: { level: 9 } })
  archive.on('error', reject)
  archive.pipe(createWriteStream('dist/latest.zip').on('close', resolve))
  archive.file('dist/dist.css', { name: 'dist/dist.css' })
  archive.file('package.json', { name: 'package.json' })
  archive.finalize()
})

console.log('Build complete!')

