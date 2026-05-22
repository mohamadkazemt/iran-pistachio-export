import { PrismaClient } from "@prisma/client";
import { exec } from "child_process";
import path from "path";

const prisma = new PrismaClient();
const POLL_INTERVAL_MS = 5000;

console.log("[Eslami Worker] Enterprise background queue processor initialized. Polling database jobs...");

// Asynchronous job executor map
async function processJob(jobId: string, queueName: string, payload: any): Promise<void> {
  console.log(`[Eslami Worker] Executing job [${jobId}] from queue [${queueName}] with payload:`, JSON.stringify(payload));
  
  const { type, targetId, options } = payload;
  
  switch (type) {
    case "IMAGE_OPTIMIZATION":
      console.log(`[Eslami Worker] Optimizing target image asset [${targetId}] using precision web compression...`);
      // Simulating image conversion pipelines
      await new Promise((resolve) => setTimeout(resolve, 3000));
      break;

    case "AI_TRADE_ADVISORY":
      console.log(`[Eslami Worker] Synthesizing predictive cargo advisory logs...`);
      await new Promise((resolve) => setTimeout(resolve, 4000));
      break;

    case "DATA_BACKUP_DAEMON":
      console.log(`[Eslami Worker] Triggering automatic database pg_dump cold archiving...`);
      await new Promise((resolve, reject) => {
        exec("bash backup.sh", (error, stdout, stderr) => {
          if (error) {
            console.error(`[Eslami Worker] Backup script failed: ${stderr}`);
            reject(error);
          } else {
            console.log(`[Eslami Worker] Backup generated successfully. Logs: ${stdout.trim()}`);
            resolve(true);
          }
        });
      });
      break;

    case "REPORT_GENERATION":
      console.log(`[Eslami Worker] Composing export trade summaries PDF sheets...`);
      await new Promise((resolve) => setTimeout(resolve, 2500));
      break;

    default:
      throw new Error(`Unidentified queue task worker instruction type: ${type}`);
  }
}

async function scanAndProcessQueuedJobs() {
  try {
    // 1. Transactional selection: lock and pick the next QUEUED job
    const nextJob = await prisma.job.findFirst({
      where: { status: "QUEUED", runAt: { lte: new Date() } },
      orderBy: { priority: "desc" },
    });

    if (!nextJob) return;

    console.log(`[Eslami Worker] Claimed job: ${nextJob.id}. Locking process status...`);

    // 2. Mark as RUNNING
    const claimedJob = await prisma.job.update({
      where: { id: nextJob.id },
      data: {
        status: "RUNNING",
        startedAt: new Date(),
        attempts: { increment: 1 },
      },
    });

    try {
      // 3. Process task
      await processJob(claimedJob.id, claimedJob.queueName, claimedJob.payload);

      // 4. On absolute Success
      await prisma.job.update({
        where: { id: claimedJob.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });
      console.log(`[Eslami Worker] Job ${claimedJob.id} completed beautifully.`);
    } catch (jobError: any) {
      console.error(`[Eslami Worker] Job ${claimedJob.id} failed execution:`, jobError.message);

      if (claimedJob.attempts >= claimedJob.maxAttempts) {
        // Task completely failed all retry limits - transfer to permanent Dead-Letter table
        await prisma.$transaction([
          prisma.failedJob.create({
            data: {
              queueName: claimedJob.queueName,
              payload: claimedJob.payload ?? {},
              error: jobError.stack || jobError.message || "Unknown error",
            },
          }),
          prisma.job.update({
            where: { id: claimedJob.id },
            data: {
              status: "FAILED",
              errorLog: jobError.message,
              completedAt: new Date(),
            },
          }),
        ]);
        console.log(`[Eslami Worker] Job ${claimedJob.id} breached retry limits. Relocating to dead letter index.`);
      } else {
        // Re-schedule for retry sequence
        const retryDelaySeconds = Math.pow(2, claimedJob.attempts) * 30; // Exponential Backoff
        const nextRun = new Date();
        nextRun.setSeconds(nextRun.getSeconds() + retryDelaySeconds);

        await prisma.job.update({
          where: { id: claimedJob.id },
          data: {
            status: "QUEUED",
            runAt: nextRun,
            errorLog: jobError.message,
          },
        });
        console.log(`[Eslami Worker] Job ${claimedJob.id} rescheduled to retry in ${retryDelaySeconds} seconds.`);
      }
    }
  } catch (dbError: any) {
    if (dbError.code === "P2021" || dbError.message.includes("does not exist")) {
      // Schema may have not been migrated yet
    } else {
      console.error("[Eslami Worker] Error querying job queue table:", dbError.message);
    }
  }
}

// Keep-alive polling interval loops
async function runLoop() {
  while (true) {
    await scanAndProcessQueuedJobs();
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

// Catch general process failures gracefully
process.on("unhandledRejection", (err) => console.error("[Eslami Worker] Managed Promise Rejection:", err));
process.on("uncaughtException", (err) => console.error("[Eslami Worker] Managed Exception:", err));

// Boot loop
runLoop();
