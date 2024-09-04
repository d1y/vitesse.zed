const fs = require('fs')
const { execSync } = require('child_process')
const filepath = require('path')
const { glob } = require('glob')
const vitesseRepo = 'vitesse'

const THEME_IMPORTER = process.env.THEME_IMPORTER ?? '/Users/d1y/github/zed/target/debug'

async function main() {
  if (!fs.existsSync(vitesseRepo)) {
    const repo = 'https://github.com/antfu/vscode-theme-vitesse'
    const cmd = `git clone ${repo} ${vitesseRepo} --depth=1`
    console.log(cmd)
    execSync(cmd)
  }

  /**
   * @type {Array<string>}
   */
  const jsonFiles = await glob(`${vitesseRepo}/themes/*.json`)
  if (!fs.existsSync('output')) {
    fs.mkdirSync('output')
  }

  jsonFiles.forEach((json) => {
    const file = filepath.basename(json)
    transformTheme(json, `output/${file}`)
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
  const outputFile = 'themes/vitesse.json'
  fs.writeFileSync(outputFile, data)
}

function transformTheme(input, output) {
  const result = execSync(`theme_importer ${input}`, {
    encoding: 'utf8',
    env: { PATH: THEME_IMPORTER, },
  })
  const themeJson = JSON.parse(result)

  // these props are null by default which will cause the hint tips hard to read
  const patchedProperties = [
    "conflict.background",
    "conflict.border",
    "created.background",
    "created.border",
    "deleted.background",
    "deleted.border",
    "error.background",
    "error.border",
    "hidden.background",
    "hidden.border",
    "hint.background",
    "hint.border",
    "ignored.background",
    "ignored.border",
    "info.background",
    "info.border",
    "modified.background",
    "modified.border",
    "predictive.background",
    "predictive.border",
    "renamed.background",
    "renamed.border",
    "success.background",
    "success.border",
    "unreachable.background",
    "unreachable.border",
    "warning.background",
    "warning.border",
  ]

  const style = themeJson.style
  for (const prop of patchedProperties) {
    const mappedKey = prop.split('.')[0]
    // use correct values to override nulls
    style[prop] = style[mappedKey]
  }

  // terminal background
  style['terminal.background'] = style.background

  // use andromeda's config directly
  // https://github.com/zed-industries/zed/blob/355aebd0e493aa9f60900179acf8011a1fc9117b/assets/themes/andromeda/andromeda.json#L139
  style.players = [
    {
      "cursor": "#10a793ff",
      "background": "#10a793ff",
      "selection": "#10a7933d"
    },
    {
      "cursor": "#c74cecff",
      "background": "#c74cecff",
      "selection": "#c74cec3d"
    },
    {
      "cursor": "#f29c14ff",
      "background": "#f29c14ff",
      "selection": "#f29c143d"
    },
    {
      "cursor": "#893ea6ff",
      "background": "#893ea6ff",
      "selection": "#893ea63d"
    },
    {
      "cursor": "#08e7c5ff",
      "background": "#08e7c5ff",
      "selection": "#08e7c53d"
    },
    {
      "cursor": "#f82871ff",
      "background": "#f82871ff",
      "selection": "#f828713d"
    },
    {
      "cursor": "#fee56cff",
      "background": "#fee56cff",
      "selection": "#fee56c3d"
    },
    {
      "cursor": "#96df71ff",
      "background": "#96df71ff",
      "selection": "#96df713d"
    }
  ]

  fs.writeFileSync(output, JSON.stringify(themeJson, null, 2))
}

main()
