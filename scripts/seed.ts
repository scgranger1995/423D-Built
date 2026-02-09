// ============================================
// 423D Built - Database Seed Script
// ============================================
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...\n");

  // ---- 1. Create Default Admin User ----
  console.log("Creating admin user...");
  const passwordHash = await hash("changeme123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@423dbuilt.com" },
    update: {},
    create: {
      email: "admin@423dbuilt.com",
      name: "Admin",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`  Admin user created: ${admin.email} (ID: ${admin.id})`);
  console.log("  Default password is 'changeme123' - change it immediately!\n");

  // ---- 2. Create Sample Products ----
  console.log("Creating sample products...");

  const products = [
    {
      name: "Mountain Phone Stand",
      slug: "mountain-phone-stand",
      description: "A beautifully detailed phone stand inspired by the Great Smoky Mountains. 3D printed in PLA with a layered mountain silhouette design.",
      shortDescription: "3D printed phone stand with Smoky Mountain design",
      category: "PRINTING_3D",
      price: 2499,
      material: "PLA",
      color: "Mountain Gray",
      dimensions: "12x8x10 cm",
      weight: 4.2,
      images: "[]",
      featured: true,
      active: true,
      inventory: 25,
      madeToOrder: false,
      customizable: true,
      customizationPrompt: "Choose your color: Gray, Forest Green, Sunset Orange, or Sky Blue",
      tags: JSON.stringify(["phone-stand", "mountains", "desk-accessory", "3d-print"]),
    },
    {
      name: "Tennessee Tri-Star Coaster Set",
      slug: "tennessee-tri-star-coaster-set",
      description: "Set of 4 coasters featuring the iconic Tennessee Tri-Star logo. Printed in durable PETG plastic.",
      shortDescription: "4-pack PETG coasters with Tennessee Tri-Star design",
      category: "PRINTING_3D",
      price: 1999,
      material: "PETG",
      color: "Tennessee Orange",
      dimensions: "10x10x0.5 cm each",
      weight: 6.0,
      images: "[]",
      featured: true,
      active: true,
      inventory: 40,
      madeToOrder: false,
      customizable: false,
      customizationPrompt: null,
      tags: JSON.stringify(["coasters", "tennessee", "tri-star", "home-decor"]),
    },
    {
      name: "Custom Engraved Cutting Board",
      slug: "custom-engraved-cutting-board",
      description: "A premium bamboo cutting board with custom laser engraving. Perfect for weddings, housewarmings, or holiday gifts.",
      shortDescription: "Laser engraved bamboo cutting board with custom text",
      category: "LASER_ENGRAVE",
      price: 3999,
      material: "Bamboo",
      color: "Natural",
      dimensions: "30x20x2 cm",
      weight: 22.0,
      images: "[]",
      featured: true,
      active: true,
      inventory: 15,
      madeToOrder: true,
      customizable: true,
      customizationPrompt: "Enter your custom engraving text (up to 3 lines, 30 characters each)",
      tags: JSON.stringify(["cutting-board", "kitchen", "engraved", "gift", "laser"]),
    },
    {
      name: "Smoky Mountain LED Lamp",
      slug: "smoky-mountain-led-lamp",
      description: "A stunning LED lamp featuring a layered Smoky Mountain landscape. 3D printed in translucent PLA with USB-powered LED base.",
      shortDescription: "3D printed LED lamp with Smoky Mountain silhouette",
      category: "PRINTING_3D",
      price: 4999,
      material: "PLA (Translucent)",
      color: "Warm White / Multicolor LED",
      dimensions: "15x10x20 cm",
      weight: 8.5,
      images: "[]",
      featured: true,
      active: true,
      inventory: 10,
      madeToOrder: true,
      customizable: true,
      customizationPrompt: "Choose LED color: Warm White, Cool White, or RGB Multicolor",
      tags: JSON.stringify(["lamp", "led", "smoky-mountains", "home-decor"]),
    },
    {
      name: "Personalized Keychain",
      slug: "personalized-keychain",
      description: "A custom 3D printed keychain with your name, initials, or a short phrase. Made from durable PLA plastic.",
      shortDescription: "Custom 3D printed keychain with your text",
      category: "PRINTING_3D",
      price: 999,
      material: "PLA",
      color: "Various",
      dimensions: "6x3x0.5 cm",
      weight: 0.5,
      images: "[]",
      featured: false,
      active: true,
      inventory: 100,
      madeToOrder: true,
      customizable: true,
      customizationPrompt: "Enter your text (up to 15 characters) and choose a color",
      tags: JSON.stringify(["keychain", "personalized", "gift", "3d-print"]),
    },
    {
      name: "Bristol Sign Replica",
      slug: "bristol-sign-replica",
      description: "A detailed 3D printed replica of the famous Bristol VA/TN sign - 'A Good Place to Live.'",
      shortDescription: "3D printed replica of the iconic Bristol VA/TN sign",
      category: "PRINTING_3D",
      price: 3499,
      material: "PLA",
      color: "Multi-color (Red, White, Blue)",
      dimensions: "20x5x12 cm",
      weight: 6.8,
      images: "[]",
      featured: true,
      active: true,
      inventory: 20,
      madeToOrder: false,
      customizable: false,
      customizationPrompt: null,
      tags: JSON.stringify(["bristol", "sign", "replica", "landmark"]),
    },
    {
      name: "Engraved Whiskey Glass Set",
      slug: "engraved-whiskey-glass-set",
      description: "Set of 2 premium rocks glasses with custom laser engraving. Perfect for Tennessee whiskey enthusiasts.",
      shortDescription: "Set of 2 laser engraved rocks glasses",
      category: "LASER_ENGRAVE",
      price: 4499,
      material: "Glass",
      color: "Clear",
      dimensions: "8.5x8.5x9 cm each",
      weight: 18.0,
      images: "[]",
      featured: true,
      active: true,
      inventory: 30,
      madeToOrder: true,
      customizable: true,
      customizationPrompt: "Choose a design: Monogram, Full Name, Tennessee Tri-Star, or Smoky Mountains",
      tags: JSON.stringify(["whiskey", "glass", "engraved", "gift", "laser"]),
    },
    {
      name: "3D Printed Planter with Tennessee Design",
      slug: "3d-printed-planter-tennessee",
      description: "A unique geometric planter featuring a Tennessee state outline and Tri-Star emblem. Printed in weather-resistant PETG.",
      shortDescription: "PETG planter with Tennessee state design and drainage",
      category: "PRINTING_3D",
      price: 2999,
      material: "PETG",
      color: "Terracotta / Forest Green",
      dimensions: "12x12x10 cm",
      weight: 7.2,
      images: "[]",
      featured: false,
      active: true,
      inventory: 35,
      madeToOrder: false,
      customizable: true,
      customizationPrompt: "Choose your color: Terracotta, Forest Green, Slate Gray, or Cream White",
      tags: JSON.stringify(["planter", "tennessee", "garden", "home-decor"]),
    },
    {
      name: "Custom Pet Tag",
      slug: "custom-pet-tag",
      description: "A durable 3D printed pet tag customized with your pet's name and your phone number.",
      shortDescription: "Custom 3D printed pet ID tag with name and phone",
      category: "PRINTING_3D",
      price: 1299,
      material: "PLA",
      color: "Various",
      dimensions: "3.5x3.5x0.4 cm",
      weight: 0.3,
      images: "[]",
      featured: false,
      active: true,
      inventory: 75,
      madeToOrder: true,
      customizable: true,
      customizationPrompt: "Enter pet name (line 1) and phone number (line 2). Choose shape: Bone, Circle, Heart, or Paw",
      tags: JSON.stringify(["pet", "dog", "cat", "tag", "personalized"]),
    },
    {
      name: "Appalachian Trail Bookmark",
      slug: "appalachian-trail-bookmark",
      description: "A laser-engraved wooden bookmark celebrating the Appalachian Trail. Made from sustainably sourced walnut wood.",
      shortDescription: "Laser engraved walnut bookmark with AT trail design",
      category: "LASER_ENGRAVE",
      price: 799,
      material: "Walnut Wood",
      color: "Natural Walnut",
      dimensions: "15x4x0.2 cm",
      weight: 0.4,
      images: "[]",
      featured: false,
      active: true,
      inventory: 50,
      madeToOrder: false,
      customizable: false,
      customizationPrompt: null,
      tags: JSON.stringify(["bookmark", "appalachian-trail", "hiking", "wood", "laser"]),
    },
  ];

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
    console.log(`  Product created: ${created.name} ($${(created.price / 100).toFixed(2)})`);
  }
  console.log(`  ${products.length} products seeded.\n`);

  // ---- 3. Create Default Site Content ----
  console.log("Creating default site content...");

  const siteContent = [
    // Hero section (matches admin content editor keys)
    { key: "hero_heading", value: "Custom 3D Printing & Laser Engraving", type: "TEXT", section: "hero" },
    { key: "hero_subheading", value: "Handcrafted in Bristol, Tennessee.", type: "TEXT", section: "hero" },
    { key: "hero_tagline", value: "From concept to creation, we bring your ideas to life with precision 3D printing and laser engraving.", type: "TEXT", section: "hero" },
    { key: "hero_cta_text", value: "Shop Now", type: "TEXT", section: "hero" },
    // About section
    { key: "about_story", value: "423D Built is a small-batch 3D printing and laser engraving workshop based in Bristol, Tennessee.", type: "TEXT", section: "about" },
    { key: "about_mission", value: "Our mission is to bring creative ideas to life through precision craftsmanship and modern technology.", type: "TEXT", section: "about" },
    { key: "about_values", value: "Quality, Innovation, Community", type: "TEXT", section: "about" },
    // Services section
    { key: "services_heading", value: "Our Services", type: "TEXT", section: "services" },
    { key: "services_3d_title", value: "3D Printing", type: "TEXT", section: "services" },
    { key: "services_3d_description", value: "Custom 3D printing services using premium PLA, PETG, and specialty filaments.", type: "TEXT", section: "services" },
    { key: "services_laser_title", value: "Laser Engraving", type: "TEXT", section: "services" },
    { key: "services_laser_description", value: "Precision laser engraving on wood, glass, leather, and more.", type: "TEXT", section: "services" },
    { key: "services_design_title", value: "Custom Design", type: "TEXT", section: "services" },
    { key: "services_design_description", value: "Professional design services to turn your vision into a printable or engravable reality.", type: "TEXT", section: "services" },
    // Contact section
    { key: "contact_email", value: "hello@423dbuilt.com", type: "TEXT", section: "contact" },
    { key: "contact_phone", value: "(423) 555-0423", type: "TEXT", section: "contact" },
    { key: "contact_address", value: "Bristol, TN 37620", type: "TEXT", section: "contact" },
    { key: "contact_hours_weekday", value: "Mon-Fri: 9:00 AM - 6:00 PM", type: "TEXT", section: "contact" },
    { key: "contact_hours_weekend", value: "Sat: 10:00 AM - 4:00 PM, Sun: Closed", type: "TEXT", section: "contact" },
  ];

  for (const content of siteContent) {
    await prisma.siteContent.upsert({
      where: { key: content.key },
      update: {},
      create: content,
    });
    console.log(`  Content created: [${content.section}] ${content.key}`);
  }
  console.log(`  ${siteContent.length} content entries seeded.\n`);

  // ---- 4. Create Default Shipping Settings ----
  console.log("Creating default shipping settings...");

  const shippingSettings = [
    { key: "shipping_method", value: "flat_rate_tiered" },
    { key: "free_shipping_threshold", value: "7500" },
    { key: "free_shipping_enabled", value: "true" },
    { key: "processing_time_days", value: "3" },
    { key: "ship_from_address", value: JSON.stringify({ name: "423D Built", city: "Bristol", state: "TN", zip: "37620", country: "US" }) },
  ];

  for (const setting of shippingSettings) {
    await prisma.shippingSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
    console.log(`  Shipping setting: ${setting.key}`);
  }

  console.log("\n============================================");
  console.log("Database seed complete!");
  console.log("============================================");
  console.log("\nAdmin Login:");
  console.log("  Email:    admin@423dbuilt.com");
  console.log("  Password: changeme123");
  console.log("\nIMPORTANT: Change the admin password after first login!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
