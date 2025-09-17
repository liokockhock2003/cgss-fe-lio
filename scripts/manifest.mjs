#!/usr/bin/env node
import { addHours, format } from 'date-fns'
import { execSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const fileName = 'buildInfo.json'

// Adjust the date to GMT+8 and format it in ISO-like format
const formattedOutputTime = format(addHours(new Date(), 8), "yyyy-MM-dd'T'HH:mm:ss'+08:00'")
const commitHash = execSync('git rev-parse --short HEAD').toString().trim()

function parseArguments() {
  // eslint-disable-next-line no-undef
  const args = process.argv.slice(2)
  const options = {}

  args.forEach((arg) => {
    const [key, value] = arg.split('=')
    if (key && value) {
      options[key.replace(/^--/, '')] = value
    }
  })

  return options
}

function generateManifest(outputPath, commitHash) {
  if (!outputPath) {
    throw new Error(`Output path for "${fileName}" is not specified`)
  }

  const manifest = {
    metadata: {
      buildAt: formattedOutputTime,
      commit: commitHash,
    },
  }

  mkdirSync(outputPath, { recursive: true })
  writeFileSync(resolve(outputPath, fileName), JSON.stringify(manifest, null, 2))
}

const { outputPath } = parseArguments()

try {
  generateManifest(outputPath, commitHash)
  console.log(`Manifest generated at ${resolve(outputPath, fileName)}`)
} catch (error) {
  console.error(`Error generating manifest: ${error.message}`)
  // eslint-disable-next-line no-undef
  process.exit(1)
}
