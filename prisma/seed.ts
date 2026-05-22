import { PrismaClient, UserRole, PublishState, JobStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("[Seeder] Commencing enterprise database seeding sequence...");

  // 1. Configure and Seed global administrative user
  const adminEmail = "procurement@eslami-global.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    // Bcrypt/Argon2id format hash placeholder (Standard self-salting hash representing 'Eslami@2026!')
    // Hashed with standard bcrypt costs
    const sampleHash = "$2b$12$Z0H3rL1qWhR8A6a/r6oAkeWp1UdfhFHe4p0P8U2/1C6g4fEwzW8E6"; // password = Eslami_secure_2026!
    
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: sampleHash,
        fullName: "Eslami Compliance Admin",
        companyName: "Eslami Global Trading LLC",
        role: UserRole.GLOBAL_ADMIN,
        isActive: true,
      },
    });
    console.log(`[Seeder] Default global admin account registered: ${adminEmail}`);
  }

  // 2. Configure active scheduler tasks entries
  const tasks = [
    { name: "DB_BACKUP_DAEMON", cron: "0 0 * * *" },
    { name: "SEO_AUTO_REPAIR", cron: "*/5 * * * *" }
  ];

  for (const t of tasks) {
    await prisma.scheduledTask.upsert({
      where: { taskName: t.name },
      update: { cronExpression: t.cron, active: true },
      create: { taskName: t.name, cronExpression: t.cron, active: true }
    });
  }
  console.log("[Seeder] Automated scheduler tasks matrices configured.");

  // 3. Populate luxury products catalog
  const existingProducts = await prisma.product.count();
  if (existingProducts === 0) {
    await prisma.product.create({
      data: {
        id: "prod-raw-pistachio",
        nameEn: "Royal Akbari Raw Pistachios",
        nameFa: "پسته خام اکبری سلطنتی",
        nameAr: "فستق غض الرويال",
        nameZh: "皇家阿克巴里生开心果",
        descriptionEn: "The crown jewel of Persian agricultural luxury. Hand-picked, super-long Akbari raw pistachios.",
        descriptionFa: "نگین لوکس کشاورزی پارس. پسته‌های دستی چین اکبری فوق کشیده.",
        slugEn: "royal-akbari-raw-pistachios",
        slugFa: "پسته-خام-اکبری-سلطنتی",
        priceRangeMin: 9200,
        priceRangeMax: 11500,
        currency: "USD",
        unit: "Metric Ton",
        hsCode: "0802.51.00",
        originEn: "Rafsanjan Plains (Protected Designation of Origin)",
        originFa: "دشت‌های رفسنجان (نشان جغرافیایی ثبت شده)",
        minOrderQuantity: 1.0,
        leadTimeDays: 14,
        categories: ["Raw Pistachio", "Agricultural Luxury"],
        purityGradeEn: "Premium Quality (Moisture <6.0%, Splitting >98%)",
        purityGradeFa: "کیفیت ممتاز (رطوبت زیر ۶ درصد، خندان بالای ۹۸ درصد)",
        technicalSpecs: {
          "Moisture": "< 6.0%",
          "ClosedShell": "< 1.5%",
          "Debris": "0.00%"
        }
      }
    });

    await prisma.product.create({
      data: {
        id: "prod-roasted-pistachio",
        nameEn: "Fandoghi Roasted & Jumbo Pistachios",
        nameFa: "پسته بو داده فندقی ممتاز",
        nameAr: "فستق فندقي محمص",
        nameZh: "精品烤开心果及巨细烤开心果",
        descriptionEn: "Premium round-bodied Fandoghi grade harvested at peak ripeness, gently dry roasted inside high-efficiency airflow rotators.",
        descriptionFa: "پسته گرد درجه یک فندقی برداشت شده در اوج فندقی، با ملایمت درون فر گرد حرارتی خشک بو داده شده.",
        slugEn: "fandoghi-roasted-jumbo-pistachios",
        slugFa: "پسته-بو-داده-فندقی",
        priceRangeMin: 8800,
        priceRangeMax: 10400,
        currency: "USD",
        unit: "Metric Ton",
        hsCode: "0802.52.00",
        originEn: "Kerman Plateau",
        originFa: "فلات کویری کرمان",
        minOrderQuantity: 2.0,
        leadTimeDays: 18,
        categories: ["Roasted Pistachio", "Premium Foodstuffs"],
        purityGradeEn: "Grade-A Roasted (Moisture <2.5%)",
        purityGradeFa: "بوداده درجه یک (رطوبت زیر ۲.۵ درصد)",
        technicalSpecs: {
          "Roasting Temperature": "125C - 130C",
          "Open mouth Ratio": "> 97%"
        }
      }
    });

    console.log("[Seeder] Premium luxury commodities products successfully catalogued.");
  }

  // 4. Populate default editorial CMS content
  const existingBlogs = await prisma.post.count();
  if (existingBlogs === 0) {
    await prisma.post.create({
      data: {
        status: PublishState.PUBLISHED,
        titleEn: "Vessel Containment Standards for Luxury Agricultural Exports",
        titleFa: "استانداردهای بهینه کانتینری و ترانزیتی بارهای لوکس کشاورزی",
        slugEn: "vessel-containment-standards-export",
        slugFa: "استانداردهای-کانتینری-ترانزیتی-کشاورزی",
        contentEn: "Comprehensive logistics guide documenting exact gas sealing and nitrogen flushing protocols in standard maritime bulk shipments.",
        contentFa: "راهنمای جامع فرآیندهای لجستیک، نحوه عایق‌سازی با گازهای بی‌اثر نیتروژن در جابجایی‌های دریایی.",
        tags: ["Logistics", "Exporters Guidelines", "Quality Standards"]
      }
    });
    console.log("[Seeder] CMS news and expert analyses loaded successfully.");
  }

  console.log("[Seeder] Seeding sequence finished with absolute success.");
}

main()
  .catch((e) => {
    console.error("[Seeder Error] Database seeding encountered errors:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
