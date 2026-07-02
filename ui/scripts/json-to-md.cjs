const fs = require("fs");
const path = require("path");

const inputDir = "./src/data/projects";

const toMdList = (arr) => arr.map((item) => `- ${item}`).join("\n");

let mdContent = "";
fs.readdirSync(inputDir).forEach((file) => {
  const filePath = path.join(inputDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const {
    title,
    job,
    year,
    summary,
    responsibilities,
    features,
    skills,
    roles,
  } = data;

  const header = [job, year].filter(Boolean).join(" | ");
  const summaryText = Array.isArray(summary)
    ? summary.join("\n\n")
    : (summary ?? "");

  mdContent += `## ${title}\n`;
  if (header) mdContent += `${header}\n`;
  if (summaryText) mdContent += `\n${summaryText}\n`;
  if (skills?.length) mdContent += `\n### Skills\n${skills.join(", ")}\n`;
  if (responsibilities?.length)
    mdContent += `\n### Responsibilities\n${toMdList(responsibilities)}\n`;
  if (features?.length) mdContent += `\n### Features\n${toMdList(features)}\n`;
  if (roles?.length) {
    roles.forEach((role) => {
      mdContent += `\n### ${role.title}, ${role.org}\n${toMdList(role.items)}\n`;
    });
  }
  mdContent += `\n`;
});

const outputPath = path.join("./scripts", "output.md");
fs.writeFileSync(outputPath, mdContent);
