const fs = require('fs')
const path = require('path')

// Expose the VERSION file to the client so the footer can show the build version.
let version = ''
try {
  version = fs.readFileSync(path.join(__dirname, 'VERSION'), 'utf8').trim()
} catch {
  version = ''
}

/** @type {import('next').NextConfig} */
module.exports = {
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
  },
}
