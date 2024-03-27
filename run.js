const fs = require('fs')
const { execSync } = require('child_process')
const filepath = require('path')
const { glob } = require('glob')
const vitesseRepo = 'vitesse'

async function main() {
  if (!fs.existsSync(vitesseRepo)) {
    const repo = 'https://github.com/antfu/vscode-theme-vitesse'
    console.log(`git clone ${repo}`)
    execSync(`git clone  ${vitesseRepo}`)
  }
  /**
   * @type {Array<string>}
   */
  const jsonFiles = await glob(`${vitesseRepo}/themes/*.json`)
  jsonFiles.forEach((json) => {
    const file = filepath.basename(json)
    themeImporter(json, `output/${file}`)
  })
  const result = {
    $schema: 'https://zed.dev/schema/themes/v0.1.0.json',
    name: 'Vitesse',
    author: 'd1y',
    themes: [],
  }
  const outputs = await glob(`output/*.json`)
  outputs.forEach((file) => {
    if (file == 'vitesse.json') return
    /**
     * @type {{ name: string, appearance: "dark" | "light" }}
     */
    const item = JSON.parse(fs.readFileSync(file, 'utf-8'))
    if (item.name.includes('Light')) {
      // re-map appearance
      item.appearance = 'light'
    }
    result.themes.push(item)
  })
  const data = JSON.stringify(result, null, 2)
  const outputFile = 'themes/vitesse.json' //&& "/Users/d1y/.config/zed/themes/vitesse.json";
  fs.writeFileSync(outputFile, data)
}

function themeImporter(input, output) {
  execSync(`theme_importer ${input} -o ${output}`, {
    env: {
      PATH: '/Users/d1y/github/zed/target/debug', // TODO: add `theme_importer` env
    },
  })
}

main()
