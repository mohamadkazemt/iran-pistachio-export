import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const CHECK_INTERVAL_MS = 60000; // Poll cron updates every minute

console.log("[Eslami Scheduler] Enterprise cron coordinator initialized. Querying schedules...");

// Helper mapping to parse simple standard Cron-Like expressions for high portability
function isTaskDue(cronExpr: string, lastRun: Date | null): boolean {
  if (!lastRun) return true; // Brand new tasks execute immediately
  
  const now = Date.now();
  const diffMs = now - lastRun.getTime();
  
  // Basic translation of common cron configurations suitable for local execution
  if (cronExpr.includes("*/5 * * * *")) {
    return diffMs >= 5 * 60 * 1000; // Every 5 minutes
  } else if (cronExpr.includes("0 0 * * *") || cronExpr.includes("@daily")) {
    return diffMs >= 24 * 60 * 60 * 1000; // Daily
  } else if (cronExpr.includes("0 0 * * 0") || cronExpr.includes("@weekly")) {
    return diffMs >= 7 * 24 * 60 * 60 * 1000; // Weekly
  }
  
  return diffMs >= 10 * 60 * 1000; // Default fallback to every 10 minutes to maintain safety
}

async function runScheduledAudit() {
  try {
    const activeTasks = await prisma.scheduledTask.findMany({
      where: { active: true },
    });

    for (const task of activeTasks) {
      if (isTaskDue(task.cronExpression, task.lastRunAt)) {
        console.log(`[Eslami Scheduler] Task [${task.taskName}] is due. Queuing worker task...`);

        // Resolve target job payloads
        let payload: any = { type: "BACKGROUND_AUDIT" };
        if (task.taskName === "DB_BACKUP_DAEMON") {
          payload = { type: "DATA_BACKUP_DAEMON", targetId: "cron_trigger_system" };
        } else if (task.taskName === "SEO_AUTO_REPAIR") {
          payload = { type: "REPORT_GENERATION", targetId: "seo_reconcile" };
        }

        // Transactionally insert queue job and mark task updated
        await prisma.$transaction([
          prisma.job.create({
            data: {
              queueName: "scheduler_cron",
              payload,
              priority: 10, // Higher priority for cron scheduler tasks
            },
          }),
          prisma.scheduledTask.update({
            where: { id: task.id },
            data: {
              lastRunAt: new Date(),
            },
          }),
        ]);

        console.log(`[Eslami Scheduler] Successfully pushed execution job for [${task.taskName}].`);
      }
    }
  } catch (error: any) {
    if (error.code === "P2021" || error.message.includes("does not exist")) {
      // Schema may not be migrated yet
    } else {
      console.error("[Eslami Scheduler] Error resolving scheduled cron matrices:", error.message);
    }
  }
}

// Polling intervals
async function runLoop() {
  while (true) {
    await runScheduledAudit();
    await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL_MS));
  }
}

process.on("unhandledRejection", (err) => console.error("[Eslami Scheduler] Managed Promise Rejection:", err));
runLoop();
