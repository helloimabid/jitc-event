// This file serves as a custom server for Vercel
const path = require("path")
const fs = require("fs")

module.exports = (req, res) => {
  // Serve the index.html for all routes
  const filePath = path.join(__dirname, "../dist/index.html")

  try {
    const content = fs.readFileSync(filePath, "utf8")
    res.setHeader("Content-Type", "text/html")
    res.end(content)
  } catch (error) {
    console.error("Error serving index.html:", error)
    res.statusCode = 500
    res.end("Internal Server Error")
  }
}

