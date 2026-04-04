import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // Free trial signup endpoint
   app.post("/api/signup", async (req, res) => {
    try {
      const { name, email, company } = req.body ?? {};
      const cleanEmail = String(email || "").trim().toLowerCase();

      console.log(`Signup request received: ${cleanEmail || "unknown"}`);

      if (!cleanEmail) {
        return res.status(200).json({ success: true });
      }

      try {
        const mysql = await import("mysql2/promise");
        const databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl) {
          console.error("DATABASE_URL is missing");
        } else {
          const connection = await mysql.createConnection(databaseUrl);

          await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
              id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
              email VARCHAR(255) NOT NULL UNIQUE,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
          `);

          console.log(`Saving user: ${cleanEmail}`);

          const [existingRows] = await connection.execute(
            "SELECT id FROM users WHERE email = ? LIMIT 1",
            [cleanEmail]
          );

          const existing = existingRows as Array<{ id: number }>;

          if (existing.length > 0) {
            console.log("User already exists");
          } else {
            await connection.execute(
              "INSERT INTO users (email, reports_used) VALUES (?, 0)",
              [email]
            );
            console.log("User saved successfully");
          }

          await connection.end();
        }
      } catch (dbError) {
        console.error(
          `Database error: ${dbError instanceof Error ? dbError.message : String(dbError)}`
        );
      }

      const { Resend } = await import("resend");
      const resend = new Resend(
        process.env.RESEND_API_KEY || "re_8XondN7D_EDeTswagEfdnVFc2XFcRbbFH"
      );

      try {
        await resend.emails.send({
          from: "Veridia <onboarding@resend.dev>",
          to: "mia.hildebrandt@icloud.com",
          subject: "New Veridia Free Trial Signup",
          html: `<h2>New signup!</h2><p><strong>Name:</strong> ${name || "Not provided"}</p><p><strong>Email:</strong> ${cleanEmail || "Not provided"}</p><p><strong>Company:</strong> ${company || "Not provided"}</p>`
        });

        await resend.emails.send({
          from: "Veridia <onboarding@resend.dev>",
          to: cleanEmail,
          subject: "Your Veridia access is live",
          html: `<p>You now have access to Veridia.</p><p>Screen UK commercial properties for EPC, MEES compliance, retrofit capex and risk in seconds.</p><p><a href="https://veridiascore.com/deal-screen">https://veridiascore.com/deal-screen</a></p><p>If you have any questions, reply to this email.</p>`,
        });

        console.log("Email sent successfully");
      } catch (error) {
        console.error(`Email failed: ${error instanceof Error ? error.message : String(error)}`);
      }

      res.status(200).json({ success: true });
    } catch (e) {
      console.error("Signup error:", e);
      res.status(200).json({ success: true });
    }
  });
  app.post("/api/check-trial", async (req, res) => {
    try {
      const { email } = req.body ?? {};
      const cleanEmail = String(email || "").trim().toLowerCase();

      if (!cleanEmail) {
        return res.json({ valid: false });
      }

      const mysql = await import("mysql2/promise");
      const connection = await mysql.createConnection(process.env.DATABASE_URL!);

      const [rows] = await connection.execute(
        "SELECT created_at FROM users WHERE email = ? LIMIT 1",
        [cleanEmail]
      );

      await connection.end();

      const result = rows as Array<{ created_at: string }>;

      if (result.length === 0) {
        return res.json({ valid: false });
      }

      const createdAt = new Date(result[0].created_at);
      const now = new Date();
      const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays > 7) {
        return res.json({ valid: false, expired: true });
      }

      return res.json({ valid: true });
    } catch (e) {
      console.error("Trial check error:", e);
      return res.json({ valid: false });
    }
  });
  app.post("/api/check-usage", async (req, res) => {
    try {
      const { email } = req.body ?? {};
      const cleanEmail = String(email || "").trim().toLowerCase();

      if (!cleanEmail) {
        return res.json({ allowed: false });
      }

      const mysql = await import("mysql2/promise");
      const connection = await mysql.createConnection(process.env.DATABASE_URL!);

      const [rows] = await connection.execute(
        "SELECT reports_used FROM users WHERE email = ? LIMIT 1",
        [cleanEmail]
      );

      await connection.end();

      const result = rows as Array<{ reports_used: number }>;

      if (!result.length) {
        return res.json({ allowed: false });
      }

      if (result[0].reports_used >= 1) {
        return res.json({ allowed: false });
      }

      return res.json({ allowed: true });
    } catch (e) {
      console.error("Usage check error:", e);
      return res.json({ allowed: false });
    }
  });
  // EPC lookup endpoint
  app.get("/api/epc", async (req, res) => {
    try {
      const { lookupEPCByPostcode, lookupEPCByPostcodeNonDomestic } = await import("../epcApi.js");
      const postcode = req.query.postcode as string;
      if (!postcode) return res.json([]);
      let results = await lookupEPCByPostcodeNonDomestic(postcode);
      if (!results || results.length === 0) {
        results = await lookupEPCByPostcode(postcode);
      }
      res.json(results);
    } catch (e) {
      console.error("EPC route error:", e);
      res.json([]);
    }
  });

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
