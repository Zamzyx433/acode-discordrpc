import fs from "fs"
import path from "path"

const CONFIG_PATH = path.resolve(process.cwd(), "config.json")

let config = { editor: "acode" }

if (fs.existsSync(CONFIG_PATH)) {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"))
}

export default config
