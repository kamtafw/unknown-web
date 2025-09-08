import fs from "fs";
import path from "path";
import { render } from "@testing-library/react";

const appDir = path.join(process.cwd(), "app"); // ✅ always points to /appscombo_frontend/app

function findPages(dir: string, results: { name: string; file: string }[] = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      findPages(fullPath, results);
    } else if (item === "page.tsx") {
      results.push({
        name: fullPath.replace(appDir, "").replace("/page.tsx", "") || "home",
        file: fullPath,
      });
    }
  }

  return results;
}

const pages = findPages(appDir);

describe("Smoke Test - All Pages", () => {
  pages.forEach(({ name, file }) => {
    it(`renders ${name} page without crashing`, async () => {
      const Page = (await import(file)).default;
      render(<Page />);
    });
  });
});

