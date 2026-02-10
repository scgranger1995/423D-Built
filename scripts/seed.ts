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

  // ---- 5. Create Default System Pages with Blocks ----
  console.log("Creating system pages with blocks...");

  const systemPages = [
    // ===== HOME PAGE =====
    {
      title: "Home",
      slug: "home",
      description: "Main landing page",
      published: true,
      isSystem: true,
      sortOrder: 0,
      blocks: [
        {
          type: "hero",
          sortOrder: 0,
          content: JSON.stringify({
            heading: "423D Built",
            subheading: "3D Print & Design",
            tagline: "Handcrafted in Bristol, Tennessee — Heart of Appalachia",
            ctaText: "Get a Free Quote",
            ctaLink: "/quote",
            ctaTextSecondary: "Browse Shop",
            ctaLinkSecondary: "/shop",
            backgroundImage: "",
          }),
          settings: JSON.stringify({
            fullHeight: true,
            showLogo: true,
            showScrollIndicator: true,
            backgroundColor: "#000",
          }),
        },
        {
          type: "cards",
          sortOrder: 1,
          content: JSON.stringify({
            heading: "What We Do",
            subheading: "From concept to creation, we offer a full suite of manufacturing services right here in the Tri-Cities region.",
            cards: [
              {
                title: "3D Printing",
                description: "From rapid prototypes to custom parts, we bring your digital designs into the physical world with precision FDM printing in PLA, PETG, ABS, and ASA.",
                icon: "Printer",
                link: "/services#3d-printing",
                linkText: "Learn More",
              },
              {
                title: "Laser Engraving",
                description: "Precision laser engraving and cutting on wood, acrylic, leather, glass, and more. Perfect for personalization, signage, and custom gifts.",
                icon: "Zap",
                link: "/services#laser-engraving",
                linkText: "Learn More",
              },
              {
                title: "Design Services",
                description: "Need a 3D model or design file? Our team handles CAD modeling, file repair, design consultation, and reverse engineering.",
                icon: "PenTool",
                link: "/services#design-services",
                linkText: "Learn More",
              },
            ],
          }),
          settings: JSON.stringify({
            columns: 3,
            backgroundColor: "transparent",
          }),
        },
        {
          type: "product_grid",
          sortOrder: 2,
          content: JSON.stringify({
            heading: "Shop Our Creations",
            subheading: "Browse our collection of handcrafted 3D printed and laser engraved products, all made right here in Bristol, Tennessee.",
            showFeatured: true,
            maxProducts: 4,
            ctaText: "View All Products",
            ctaLink: "/shop",
          }),
          settings: JSON.stringify({
            columns: 4,
            backgroundColor: "#000",
          }),
        },
        {
          type: "stats",
          sortOrder: 3,
          content: JSON.stringify({
            stats: [
              { value: 500, suffix: "+", label: "Projects Completed", icon: "CheckCircle" },
              { value: 100, suffix: "%", label: "Satisfaction", icon: "Smile" },
              { value: 24, suffix: "hr", label: "Quote Response", icon: "Clock" },
              { value: 423, suffix: "", label: "Bristol, TN Proud", icon: "MapPin" },
            ],
          }),
          settings: JSON.stringify({
            backgroundColor: "transparent",
            showBorders: true,
          }),
        },
        {
          type: "testimonials",
          sortOrder: 4,
          content: JSON.stringify({
            heading: "What Our Customers Say",
            testimonials: [
              {
                name: "Sarah M.",
                location: "Johnson City, TN",
                text: "423D Built brought my product prototype to life in just 3 days. The quality was outstanding and the communication was excellent throughout the process.",
                rating: 5,
              },
              {
                name: "Mike R.",
                location: "Bristol, VA",
                text: "Had custom engraved gifts made for my entire family. Everyone loved them! The attention to detail on the wood engraving was incredible.",
                rating: 5,
              },
              {
                name: "Jennifer L.",
                location: "Kingsport, TN",
                text: "As a small business owner, finding a reliable local 3D printing service was a game changer. 423D Built consistently delivers quality parts on time.",
                rating: 5,
              },
            ],
          }),
          settings: JSON.stringify({
            autoRotate: true,
            rotateInterval: 5000,
            backgroundColor: "#000",
          }),
        },
        {
          type: "cta",
          sortOrder: 5,
          content: JSON.stringify({
            heading: "Ready to Bring Your Ideas to Life?",
            subheading: "Whether it is a custom prototype, personalized gift, or production run, we are here to make it happen. Get your free quote today.",
            ctaText: "Request a Quote",
            ctaLink: "/quote",
          }),
          settings: JSON.stringify({
            backgroundGradient: true,
            goldBackground: true,
          }),
        },
      ],
    },

    // ===== ABOUT PAGE =====
    {
      title: "About",
      slug: "about",
      description: "About 423D Built",
      published: true,
      isSystem: true,
      sortOrder: 1,
      blocks: [
        {
          type: "hero",
          sortOrder: 0,
          content: JSON.stringify({
            label: "Our Story",
            heading: "About 423D Built",
            subheading: "Bringing ideas to life through precision 3D printing and laser engraving, right here in the heart of Appalachia.",
            backgroundImage: "",
          }),
          settings: JSON.stringify({
            compact: true,
            backgroundColor: "#000",
          }),
        },
        {
          type: "text",
          sortOrder: 1,
          content: JSON.stringify({
            heading: "Born in the Mountains, Built for Tomorrow",
            headingHighlight: "Built for Tomorrow",
            paragraphs: [
              "Based in Bristol, Tennessee, nestled in the beautiful Appalachian Mountains, 423D Built was founded with a simple mission: to make advanced manufacturing accessible to everyone. We believe that great ideas deserve great execution, whether it comes from a Fortune 500 company or a garage inventor.",
              "The \"423\" in our name is a nod to our area code and the community we are proud to call home. Here in the Tri-Cities region of Tennessee, there is a rich tradition of craftsmanship, resourcefulness, and pride in handmade work. We carry that tradition forward with modern tools.",
              "From prototyping the next big product idea to creating personalized gifts that carry real meaning, we put care and attention into every single piece that leaves our workshop. Every layer printed and every line engraved represents our commitment to quality.",
            ],
            showImage: true,
            image: "/images/logo.jpg",
            imageAlt: "423D Built - Bristol, Tennessee",
            location: "Bristol, Tennessee 37620 — Heart of Appalachia",
          }),
          settings: JSON.stringify({
            layout: "image-left",
            backgroundColor: "#111",
          }),
        },
        {
          type: "cards",
          sortOrder: 2,
          content: JSON.stringify({
            heading: "Our Values",
            subheading: "These principles guide everything we do, from the materials we choose to how we treat every customer.",
            cards: [
              {
                title: "Quality Craftsmanship",
                description: "Every piece we create meets our exacting standards. We take pride in producing work that is not just functional, but beautiful.",
                icon: "Award",
              },
              {
                title: "Customer First",
                description: "Your vision is our mission. We listen, collaborate, and iterate to make sure the final product exceeds your expectations.",
                icon: "Heart",
              },
              {
                title: "Innovation",
                description: "We are always exploring new materials, techniques, and technologies to push the boundaries of what is possible.",
                icon: "Lightbulb",
              },
              {
                title: "Community",
                description: "We are proud to be part of the Bristol and Tri-Cities community. From supporting local businesses to mentoring aspiring makers, we believe in lifting up the people around us.",
                icon: "Users",
              },
            ],
          }),
          settings: JSON.stringify({
            columns: 2,
            backgroundColor: "#000",
          }),
        },
        {
          type: "text",
          sortOrder: 3,
          content: JSON.stringify({
            heading: "Our Equipment",
            subheading: "We invest in reliable, high-quality equipment to ensure consistent results on every project.",
            equipmentGroups: [
              {
                category: "3D Printers",
                icon: "Printer",
                items: [
                  "FDM 3D Printer - 256x256x256mm build volume",
                  "Enclosed build chamber for ABS/ASA",
                  "Multi-material capability",
                  "Auto bed leveling and filament runout detection",
                ],
              },
              {
                category: "Laser Equipment",
                icon: "Zap",
                items: [
                  "Diode Laser Engraver - 400x400mm work area",
                  "High-precision stepper motors",
                  "Air assist for clean cuts",
                  "Rotary attachment for cylindrical objects",
                ],
              },
            ],
          }),
          settings: JSON.stringify({
            layout: "equipment-grid",
            columns: 2,
            backgroundColor: "#111",
          }),
        },
      ],
    },

    // ===== SERVICES PAGE =====
    {
      title: "Services",
      slug: "services",
      description: "Our services - 3D printing, laser engraving, and design",
      published: true,
      isSystem: true,
      sortOrder: 2,
      blocks: [
        {
          type: "hero",
          sortOrder: 0,
          content: JSON.stringify({
            label: "What We Offer",
            heading: "Our Services",
            subheading: "From rapid prototyping to custom gifts, we bring your ideas to life with precision 3D printing, laser engraving, and professional design services.",
            backgroundImage: "",
            quickNav: [
              { href: "#3d-printing", icon: "Printer", label: "3D Printing" },
              { href: "#laser-engraving", icon: "Zap", label: "Laser Engraving" },
              { href: "#design-services", icon: "PenTool", label: "Design Services" },
            ],
          }),
          settings: JSON.stringify({
            compact: true,
            backgroundColor: "#000",
            showQuickNav: true,
          }),
        },
        {
          type: "cards",
          sortOrder: 1,
          content: JSON.stringify({
            sectionId: "3d-printing",
            heading: "3D Printing Services",
            subtitle: "Fused Deposition Modeling (FDM)",
            icon: "Printer",
            description: "Our FDM (Fused Deposition Modeling) 3D printing service transforms your digital designs into physical objects layer by layer. Using high-quality thermoplastic filaments, we build parts from the ground up with precision and repeatability.",
            specs: [
              { icon: "Ruler", label: "Build Volume", value: "256 x 256 x 256mm" },
              { icon: "Layers", label: "Layer Height", value: "0.08 - 0.32mm" },
              { icon: "Settings", label: "Nozzle Size", value: "0.4mm standard" },
              { icon: "FileText", label: "File Formats", value: "STL, OBJ, 3MF" },
            ],
            materials: [
              { name: "PLA", nickname: "The Everyday Hero", bestFor: "Prototypes, display models, figurines, decorative items" },
              { name: "PETG", nickname: "The All-Rounder", bestFor: "Functional parts, outdoor use, food containers, mechanical components" },
              { name: "ABS", nickname: "The Tough One", bestFor: "Automotive parts, enclosures, functional prototypes, tool handles" },
              { name: "ASA", nickname: "The Outdoor Champion", bestFor: "Outdoor fixtures, garden items, automotive exterior, signage" },
            ],
            ctaText: "Request 3D Printing Service",
            ctaLink: "/quote",
          }),
          settings: JSON.stringify({
            layout: "service-detail",
            backgroundColor: "#111",
          }),
        },
        {
          type: "cards",
          sortOrder: 2,
          content: JSON.stringify({
            sectionId: "laser-engraving",
            heading: "Laser Engraving Services",
            subtitle: "Precision Engraving & Cutting",
            icon: "Zap",
            description: "Our laser engraving and cutting services offer incredible precision and detail. Using focused laser technology, we can engrave text, logos, artwork, and photographs onto a wide variety of materials with stunning clarity and permanence.",
            materials: [
              { name: "Wood", icon: "TreePine", description: "Engrave and cut plywood, hardwood, MDF, bamboo, and cork" },
              { name: "Acrylic", icon: "Gem", description: "Crystal-clear edge cuts and detailed engraving on cast acrylic" },
              { name: "Leather", icon: "ShieldCheck", description: "Custom wallets, belts, keychains, and other leather goods" },
              { name: "Glass", icon: "Box", description: "Detailed frosted engravings on glassware, mirrors, and awards" },
              { name: "Metal", icon: "Settings", description: "Anodized aluminum marking and coated metal engraving" },
              { name: "Fabric", icon: "Scissors", description: "Precision cutting of felt, denim, and synthetic fabrics" },
            ],
            maxWorkArea: "400 x 400mm (15.7 x 15.7 inches)",
            ctaText: "Request Laser Engraving Service",
            ctaLink: "/quote",
          }),
          settings: JSON.stringify({
            layout: "service-detail",
            backgroundColor: "#000",
          }),
        },
        {
          type: "cards",
          sortOrder: 3,
          content: JSON.stringify({
            sectionId: "design-services",
            heading: "Design Services",
            subtitle: "3D Modeling, CAD & Consultation",
            icon: "PenTool",
            description: "Do not have a 3D model or design file? No problem. Our design team can take your idea from concept to a print-ready file.",
            cards: [
              { title: "3D Modeling / CAD", description: "We create detailed 3D models from sketches, photos, or descriptions.", icon: "Box" },
              { title: "File Preparation & Repair", description: "Got a 3D file that will not print correctly? We fix non-manifold geometry, repair mesh errors, optimize wall thickness.", icon: "Wrench" },
              { title: "Design Consultation", description: "Not sure where to start? We offer free consultations to discuss your project, recommend materials.", icon: "Eye" },
              { title: "Reverse Engineering", description: "Need to recreate an existing part? We can measure, scan, and model existing objects.", icon: "Layers" },
            ],
            ctaText: "Request Design Service",
            ctaLink: "/quote",
          }),
          settings: JSON.stringify({
            layout: "service-detail",
            columns: 2,
            backgroundColor: "#111",
          }),
        },
        {
          type: "faq",
          sortOrder: 4,
          content: JSON.stringify({
            heading: "Frequently Asked Questions",
            subheading: "Got questions? We have answers.",
            items: [
              { question: "How long does a typical 3D print take?", answer: "Print times vary based on size, complexity, and quality settings. Small items may take 1-3 hours, while larger or more detailed prints can take 12-48 hours. We will provide an estimated timeline with your quote." },
              { question: "What file formats do you accept?", answer: "For 3D printing, we accept STL, OBJ, 3MF, and STEP files. For laser engraving, we work with SVG, DXF, AI, PDF, and high-resolution PNG/JPG images." },
              { question: "How much does 3D printing cost?", answer: "Pricing depends on material, size, complexity, and quantity. We offer competitive pricing starting at $10 for small items. Request a free quote with your design for an exact price." },
              { question: "What is the maximum size you can print?", answer: "Our current build volume allows for parts up to 256mm x 256mm x 256mm (approximately 10 x 10 x 10 inches). For larger items, we can split the design into multiple parts." },
              { question: "Can you match a specific color?", answer: "We stock a wide range of filament colors across all our materials. For specific color matching, we can source custom colors or apply post-processing finishes." },
              { question: "What is the difference between laser engraving and laser cutting?", answer: "Laser engraving removes a thin layer of material to create a design on the surface, while laser cutting goes all the way through the material. We offer both services." },
              { question: "Do you offer bulk or production runs?", answer: "Yes! We offer volume discounts for production runs. Whether you need 10 or 1000 parts, we can scale to meet your needs." },
              { question: "How do I get started?", answer: "Simply request a free quote through our website. Upload your design files (or describe what you need), select your service type and material, and we will get back to you within 24 hours." },
            ],
          }),
          settings: JSON.stringify({
            backgroundColor: "#000",
          }),
        },
      ],
    },

    // ===== CONTACT PAGE =====
    {
      title: "Contact",
      slug: "contact",
      description: "Contact us",
      published: true,
      isSystem: true,
      sortOrder: 3,
      blocks: [
        {
          type: "hero",
          sortOrder: 0,
          content: JSON.stringify({
            label: "Get In Touch",
            heading: "Contact Us",
            subheading: "Have a question or ready to start a project? We would love to hear from you. Reach out through the form below or any of our contact channels.",
            backgroundImage: "",
          }),
          settings: JSON.stringify({
            compact: true,
            backgroundColor: "#000",
          }),
        },
        {
          type: "contact_form",
          sortOrder: 1,
          content: JSON.stringify({
            heading: "Send Us a Message",
            subjects: [
              { value: "general", label: "General Inquiry" },
              { value: "quote", label: "Request a Quote" },
              { value: "3d-printing", label: "3D Printing Question" },
              { value: "laser-engraving", label: "Laser Engraving Question" },
              { value: "order", label: "Order Status" },
              { value: "other", label: "Other" },
            ],
            contactInfo: [
              { icon: "MapPin", label: "Address", value: "Bristol, Tennessee 37620", subvalue: "Heart of Appalachia" },
              { icon: "Phone", label: "Phone", value: "(423) 555-1234", href: "tel:+14235551234" },
              { icon: "Mail", label: "Email", value: "info@423dbuilt.com", href: "mailto:info@423dbuilt.com" },
              { icon: "Clock", label: "Business Hours", value: "Mon - Fri: 9 AM - 6 PM", subvalue: "Sat: 10 AM - 4 PM" },
            ],
            socials: [
              { href: "https://instagram.com/423dbuilt", label: "Instagram", icon: "Instagram" },
              { href: "https://facebook.com/423dbuilt", label: "Facebook", icon: "Facebook" },
              { href: "https://tiktok.com/@423dbuilt", label: "TikTok", icon: "TikTok" },
            ],
          }),
          settings: JSON.stringify({
            layout: "form-with-sidebar",
            backgroundColor: "#111",
          }),
        },
        {
          type: "text",
          sortOrder: 2,
          content: JSON.stringify({
            heading: "Find Us",
            subheading: "Located in Bristol, Tennessee — on the state line between Tennessee and Virginia.",
            showMap: true,
            mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d51329.96853285122!2d-82.2231!3d36.5951!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x885a7907e50c2481%3A0x594bfcfad5588285!2sBristol%2C%20TN!5e0!3m2!1sen!2sus!4v1700000000000",
          }),
          settings: JSON.stringify({
            layout: "map",
            backgroundColor: "#000",
          }),
        },
      ],
    },

    // ===== GALLERY PAGE =====
    {
      title: "Gallery",
      slug: "gallery",
      description: "Showcase of our work",
      published: true,
      isSystem: true,
      sortOrder: 4,
      blocks: [
        {
          type: "hero",
          sortOrder: 0,
          content: JSON.stringify({
            heading: "Our Gallery",
            headingHighlight: "Gallery",
            subheading: "A showcase of our 3D printing, laser engraving, and custom design work crafted right here in Bristol, Tennessee.",
            backgroundImage: "",
          }),
          settings: JSON.stringify({
            compact: true,
            backgroundColor: "#111",
            showBorder: true,
          }),
        },
        {
          type: "product_grid",
          sortOrder: 1,
          content: JSON.stringify({
            heading: "",
            subheading: "",
            showFilters: true,
            filterCategories: [
              { id: "all", label: "All Work", icon: "Layers" },
              { id: "3d-printing", label: "3D Printing", icon: "Printer" },
              { id: "laser-engraving", label: "Laser Engraving", icon: "Sparkles" },
              { id: "custom", label: "Custom Projects", icon: "Filter" },
            ],
            showAllProducts: true,
            maxProducts: 50,
            ctaText: "Get a Free Quote",
            ctaLink: "/quote",
            ctaHeading: "Have a Project in Mind?",
            ctaSubheading: "We'd love to bring your idea to life. Get a free quote and let's create something amazing together.",
          }),
          settings: JSON.stringify({
            layout: "gallery",
            backgroundColor: "#111",
            showLightbox: true,
          }),
        },
      ],
    },
  ];

  for (const pageData of systemPages) {
    const { blocks, ...pageFields } = pageData;

    // Upsert page by slug
    const page = await prisma.page.upsert({
      where: { slug: pageFields.slug },
      update: {},
      create: pageFields,
    });

    // Check if blocks already exist for this page
    const existingBlockCount = await prisma.pageBlock.count({
      where: { pageId: page.id },
    });

    if (existingBlockCount === 0) {
      // Create blocks for this page
      for (const block of blocks) {
        await prisma.pageBlock.create({
          data: {
            pageId: page.id,
            type: block.type,
            content: block.content,
            settings: block.settings,
            sortOrder: block.sortOrder,
          },
        });
      }
      console.log(`  Page created: ${page.title} (${blocks.length} blocks)`);
    } else {
      console.log(`  Page exists: ${page.title} (${existingBlockCount} blocks already present)`);
    }
  }
  console.log(`  ${systemPages.length} system pages seeded.\n`);

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
