import fs from "fs";

const files_list = [
    "./src/db.ts",
    "./src/db.json",
    "./server.ts",
    "./src/components/InquiryAgent.tsx",
    "./src/components/RfqForm.tsx",
    "./src/components/HomeSection.tsx",
    "./src/components/BlogSection.tsx"
];

const replacements: [string, string][] = [
    ["auralux-global.com", "eslami-global.com"],
    ["auralux.com", "eslamiglobal.com"],
    ["AuraPdfLinkSource", "EslamiPdfLinkSource"],
    ["AuraLux Global", "Eslami Global Trading"],
    ["AuraLux Luxury Exporter", "Eslami Luxury Exporter"],
    ["AuraLux Operations Trade IQ Desk", "Eslami Global Trade IQ Desk"],
    ["AuraLux Operations", "Eslami Operations"],
    ["AuraLux Trade IQ", "Eslami Trade IQ"],
    ["AuraLux Compliance Team", "Eslami Compliance Team"],
    ["AuraLux Technical Fab Center", "Eslami Technical Fab Center"],
    ["AuraLux Cold-Press Laboratory", "Eslami Cold-Press Laboratory"],
    ["AuraLux Industrial Milling Center", "Eslami Industrial Milling Center"],
    ["AuraLux Crafts Workshop", "Eslami Crafts Workshop"],
    ["AuraLux Corporate Sourcing", "Eslami Corporate Sourcing"],
    ["AuraLux", "Eslami"],
    ["Nazari Agro", "Eslami Global Trading"],
    ["Nazari Export", "Eslami Export"],
    ["Nazari Commerce", "Eslami Trading"],
    ["Nazari Trading", "Eslami Trading"],
    ["آئورالاکس", "بازرگانی اسلامی"],
    ["نظری", "اسلامی"]
];

for (const filepath of files_list) {
    try {
        if (!fs.existsSync(filepath)) {
            console.log(`Skipping non-existent file: ${filepath}`);
            continue;
        }
        let content = fs.readFileSync(filepath, "utf8");
        const origContent = content;
        for (const [search, replace] of replacements) {
            content = content.split(search).join(replace);
        }
        if (origContent !== content) {
            fs.writeFileSync(filepath, content, "utf8");
            console.log(`Updated filepath: ${filepath}`);
        } else {
            console.log(`No changes in: ${filepath}`);
        }
    } catch (e: any) {
        console.log(`Error handling ${filepath}: ${e.message}`);
    }
}
