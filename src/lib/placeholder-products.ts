// ============================================
// Placeholder Product Data
// Tennessee/Appalachian themed items for 423D Built
// Prices are in cents
// ============================================

export interface PlaceholderProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: "3d_print" | "laser_engrave" | "custom" | "all";
  price: number; // in cents
  compareAtPrice?: number;
  material: string;
  color?: string;
  dimensions: string;
  weight: number; // in ounces
  images: string[];
  featured: boolean;
  active: boolean;
  inventory: number;
  madeToOrder: boolean;
  customizable: boolean;
  customizationPrompt?: string;
  tags: string[];
  careInstructions: string;
  shippingInfo: string;
}

export const PLACEHOLDER_PRODUCTS: PlaceholderProduct[] = [
  {
    id: "prod_mountain_phone_stand",
    name: "Smoky Mountain Phone Stand",
    slug: "mountain-phone-stand",
    shortDescription:
      "A beautifully detailed 3D-printed phone stand inspired by the Great Smoky Mountains ridgeline.",
    description:
      "Bring the majesty of the Great Smoky Mountains to your desk with this intricately designed 3D-printed phone stand. The layered mountain silhouette is modeled after the actual ridgeline visible from the Appalachian Trail, complete with textured tree lines and a sturdy base. Compatible with all phone sizes up to 6.7 inches. Each piece is printed in-house at our Bristol, TN workshop with premium PLA+ filament for strength and a matte finish.",
    category: "3d_print",
    price: 2499,
    material: "PLA+ Filament",
    color: "Matte Black",
    dimensions: "6\" x 3\" x 4\"",
    weight: 5.2,
    images: [
      "/images/products/mountain-phone-stand-1.jpg",
      "/images/products/mountain-phone-stand-2.jpg",
      "/images/products/mountain-phone-stand-3.jpg",
    ],
    featured: true,
    active: true,
    inventory: 15,
    madeToOrder: false,
    customizable: true,
    customizationPrompt: "Choose a custom color or add text to the base (max 20 characters):",
    tags: ["phone-stand", "mountains", "desk-accessory", "gift"],
    careInstructions:
      "Wipe clean with a dry cloth. Avoid prolonged direct sunlight. Do not submerge in water. PLA is biodegradable but durable under normal indoor conditions.",
    shippingInfo:
      "Ships within 2-3 business days. Standard USPS shipping. Free shipping on orders over $75.",
  },
  {
    id: "prod_tristar_coaster_set",
    name: "Tennessee Tri-Star Coaster Set",
    slug: "tennessee-tri-star-coaster-set",
    shortDescription:
      "Set of 4 laser-engraved walnut coasters featuring the iconic Tennessee Tri-Star emblem.",
    description:
      "Celebrate your Tennessee pride with this handcrafted set of four walnut coasters. Each coaster is precision laser-engraved with the iconic Tennessee Tri-Star flag emblem, surrounded by subtle topographic contour lines representing the three grand divisions of the state. Finished with a food-safe sealant and cork backing to protect your furniture. Makes an unforgettable gift for any Volunteer State fan.",
    category: "laser_engrave",
    price: 3499,
    compareAtPrice: 4499,
    material: "Black Walnut",
    dimensions: "4\" diameter x 0.25\" thick",
    weight: 8.0,
    images: [
      "/images/products/tristar-coasters-1.jpg",
      "/images/products/tristar-coasters-2.jpg",
      "/images/products/tristar-coasters-3.jpg",
    ],
    featured: true,
    active: true,
    inventory: 20,
    madeToOrder: false,
    customizable: false,
    tags: ["coasters", "tennessee", "tri-star", "walnut", "gift", "home"],
    careInstructions:
      "Hand wash with mild soap and water. Do not place in dishwasher. Re-apply food-safe mineral oil every few months to maintain the finish.",
    shippingInfo:
      "Ships within 2-3 business days. Standard USPS shipping. Free shipping on orders over $75.",
  },
  {
    id: "prod_custom_cutting_board",
    name: "Custom Engraved Cutting Board",
    slug: "custom-engraved-cutting-board",
    shortDescription:
      "Personalized bamboo cutting board with your custom text, monogram, or family name laser-engraved.",
    description:
      "Make every meal memorable with a personalized laser-engraved bamboo cutting board. Perfect for weddings, housewarmings, anniversaries, or holidays. Our precision CO2 laser creates deep, detailed engravings that last a lifetime. Choose from several layout options: family name with established date, monogram, custom message, or upload your own design. Each board is made from sustainable, thick-cut bamboo with juice grooves on one side and a flat engraving surface on the other.",
    category: "laser_engrave",
    price: 4499,
    material: "Organic Bamboo",
    dimensions: '12" x 9" x 0.75"',
    weight: 24.0,
    images: [
      "/images/products/cutting-board-1.jpg",
      "/images/products/cutting-board-2.jpg",
      "/images/products/cutting-board-3.jpg",
    ],
    featured: true,
    active: true,
    inventory: 0,
    madeToOrder: true,
    customizable: true,
    customizationPrompt:
      "Enter the text you'd like engraved (family name, date, message - max 50 characters):",
    tags: ["cutting-board", "kitchen", "personalized", "wedding", "gift"],
    careInstructions:
      "Hand wash only with warm water and mild soap. Dry immediately. Apply food-safe mineral oil monthly. Never soak or put in dishwasher.",
    shippingInfo:
      "Made to order. Production takes 5-7 business days. Ships via USPS Priority Mail.",
  },
  {
    id: "prod_smoky_mountain_lamp",
    name: "3D Printed Smoky Mountain Lamp",
    slug: "smoky-mountain-led-lamp",
    shortDescription:
      "Stunning lithophane-style mountain lamp that glows with the Smoky Mountain landscape.",
    description:
      "Experience the ethereal beauty of the Smoky Mountains in your own home with this one-of-a-kind 3D-printed lithophane lamp. When illuminated, the translucent printed shade reveals a stunning mountain landscape with incredible depth and detail. The base features a hand-finished wood-grain PLA design. Includes a warm-white LED bulb and 6-foot cord with inline switch. Each lamp takes over 18 hours to print and is carefully inspected for quality.",
    category: "3d_print",
    price: 6999,
    material: "White PLA / Wood-Fill PLA",
    dimensions: '8" x 8" x 10"',
    weight: 14.0,
    images: [
      "/images/products/mountain-lamp-1.jpg",
      "/images/products/mountain-lamp-2.jpg",
      "/images/products/mountain-lamp-3.jpg",
      "/images/products/mountain-lamp-4.jpg",
    ],
    featured: true,
    active: true,
    inventory: 0,
    madeToOrder: true,
    customizable: false,
    tags: ["lamp", "lithophane", "mountains", "home-decor", "lighting"],
    careInstructions:
      "Dust with a soft, dry cloth. Use only the included LED bulb or equivalent low-heat LED. Do not use incandescent bulbs. Keep away from moisture.",
    shippingInfo:
      "Made to order. Production takes 7-10 business days. Ships in custom protective packaging via USPS Priority Mail.",
  },
  {
    id: "prod_personalized_keychain",
    name: "Personalized Keychain",
    slug: "personalized-keychain",
    shortDescription:
      "Custom 3D-printed keychain with your name, initials, or short phrase in your choice of color.",
    description:
      "Carry a piece of personality everywhere you go with our custom 3D-printed keychains. Each keychain is designed and printed to order in your choice of color and text. Perfect for gifts, party favors, team events, or just treating yourself. Printed in durable PETG plastic with a stainless steel split ring. Available in over 20 colors. Quantity discounts available for bulk orders of 10+.",
    category: "3d_print",
    price: 999,
    material: "PETG Plastic",
    color: "Your Choice",
    dimensions: '2.5" x 1" x 0.25"',
    weight: 0.5,
    images: [
      "/images/products/keychain-1.jpg",
      "/images/products/keychain-2.jpg",
    ],
    featured: false,
    active: true,
    inventory: 0,
    madeToOrder: true,
    customizable: true,
    customizationPrompt:
      "Enter the text for your keychain (max 15 characters) and preferred color:",
    tags: ["keychain", "personalized", "gift", "party-favor", "accessory"],
    careInstructions:
      "PETG is durable and water-resistant. Wipe clean as needed. Avoid prolonged exposure to temperatures above 160 degrees F.",
    shippingInfo:
      "Made to order. Production takes 3-5 business days. Ships via USPS First Class Mail.",
  },
  {
    id: "prod_appalachian_trail_sign",
    name: "Appalachian Trail Marker Sign",
    slug: "appalachian-trail-bookmark",
    shortDescription:
      "Laser-engraved replica of the iconic AT blaze marker on reclaimed Tennessee cedar.",
    description:
      "A tribute to the legendary Appalachian Trail, this laser-engraved sign is crafted from reclaimed Tennessee cedar sourced from the Tri-Cities region. The classic white blaze marker and \"Appalachian Trail\" text are deeply engraved and hand-painted for contrast. A sawtooth hanger on the back makes it easy to display. Perfect for hikers, nature lovers, and anyone who appreciates the beauty of the Appalachian mountains.",
    category: "laser_engrave",
    price: 3999,
    material: "Reclaimed Tennessee Cedar",
    dimensions: '14" x 6" x 0.75"',
    weight: 12.0,
    images: [
      "/images/products/at-sign-1.jpg",
      "/images/products/at-sign-2.jpg",
      "/images/products/at-sign-3.jpg",
    ],
    featured: false,
    active: true,
    inventory: 8,
    madeToOrder: false,
    customizable: true,
    customizationPrompt:
      "Add a custom trail mile marker number or date to the bottom of the sign (optional):",
    tags: ["appalachian-trail", "hiking", "sign", "cedar", "home-decor"],
    careInstructions:
      "Suitable for indoor display. If used outdoors, apply a clear exterior wood sealant. Natural cedar will develop a silver patina over time when exposed to weather.",
    shippingInfo:
      "Ships within 3-5 business days. Standard USPS shipping. Free shipping on orders over $75.",
  },
  {
    id: "prod_bristol_sign_ornament",
    name: "Bristol Sign 3D Ornament",
    slug: "bristol-sign-replica",
    shortDescription:
      "A miniature 3D-printed replica of the famous Bristol, TN/VA sign - \"A Good Place to Live.\"",
    description:
      'Celebrate the birthplace of country music and your hometown pride with this detailed miniature replica of the famous Bristol sign that spans State Street. The sign reads "Bristol VA | TENN - A Good Place to Live" just like the real landmark. 3D printed with multi-color filament swaps for an authentic look. Includes a gold ribbon loop for hanging on your Christmas tree or displaying year-round. A perfect keepsake for Bristol natives and visitors alike.',
    category: "3d_print",
    price: 1999,
    material: "Multi-Color PLA",
    dimensions: '5" x 2.5" x 0.5"',
    weight: 1.5,
    images: [
      "/images/products/bristol-ornament-1.jpg",
      "/images/products/bristol-ornament-2.jpg",
    ],
    featured: false,
    active: true,
    inventory: 25,
    madeToOrder: false,
    customizable: false,
    tags: ["bristol", "ornament", "christmas", "hometown", "gift"],
    careInstructions:
      "Handle with care. Store in a cool, dry place. Avoid dropping on hard surfaces.",
    shippingInfo:
      "Ships within 2-3 business days. Standard USPS shipping. Free shipping on orders over $75.",
  },
  {
    id: "prod_topo_map_wall_art",
    name: "Topographic Map Wall Art",
    slug: "topographic-map-wall-art",
    shortDescription:
      "Multi-layer laser-cut topographic map of the Smoky Mountains on stacked birch plywood.",
    description:
      "This stunning piece of wall art brings the topography of the Great Smoky Mountains to life in three dimensions. Multiple layers of precision laser-cut birch plywood are stacked and glued to create a realistic topographic relief map. The layers are stained in graduated earth tones from dark walnut at the base to natural birch at the peaks. Each piece is unique and handmade. A keyhole bracket on the back allows for easy wall mounting. Available in two sizes.",
    category: "laser_engrave",
    price: 8999,
    material: "Baltic Birch Plywood",
    dimensions: '18" x 12" x 1.5"',
    weight: 32.0,
    images: [
      "/images/products/topo-map-1.jpg",
      "/images/products/topo-map-2.jpg",
      "/images/products/topo-map-3.jpg",
    ],
    featured: true,
    active: true,
    inventory: 0,
    madeToOrder: true,
    customizable: true,
    customizationPrompt:
      "Specify a location to center the map on (e.g., Clingmans Dome, Mt. LeConte, Roan Mountain):",
    tags: ["wall-art", "topographic", "mountains", "home-decor", "premium"],
    careInstructions:
      "Indoor display only. Dust gently with a soft brush or compressed air. Avoid moisture and direct sunlight which can cause warping over time.",
    shippingInfo:
      "Made to order. Production takes 10-14 business days. Ships in custom crate via UPS Ground.",
  },
  {
    id: "prod_desk_organizer",
    name: "Honeycomb Desk Organizer",
    slug: "honeycomb-desk-organizer",
    shortDescription:
      "Modular 3D-printed desk organizer with a geometric honeycomb pattern. Stackable and expandable.",
    description:
      "Keep your workspace tidy with this modern honeycomb desk organizer. The modular design lets you connect multiple units in any configuration. Each hexagonal cell is perfect for pens, markers, scissors, or other desk supplies. Printed in premium PETG for extra durability with a smooth matte finish. The weighted base prevents tipping. Available in single, double, and triple configurations.",
    category: "3d_print",
    price: 1899,
    material: "PETG Plastic",
    color: "Matte Black",
    dimensions: '5" x 4.5" x 4"',
    weight: 6.0,
    images: [
      "/images/products/desk-organizer-1.jpg",
      "/images/products/desk-organizer-2.jpg",
    ],
    featured: false,
    active: true,
    inventory: 12,
    madeToOrder: false,
    customizable: true,
    customizationPrompt: "Choose a color: Black, White, Gold, Navy, Forest Green, or Burnt Orange:",
    tags: ["desk", "organizer", "office", "honeycomb", "modular"],
    careInstructions:
      "Wipe clean with a damp cloth. PETG is dishwasher safe on the top rack but hand washing is recommended.",
    shippingInfo:
      "Ships within 2-3 business days. Standard USPS shipping. Free shipping on orders over $75.",
  },
  {
    id: "prod_guitar_pick_holder",
    name: "Guitar Pick Holder & Display",
    slug: "guitar-pick-holder-display",
    shortDescription:
      "Laser-engraved guitar-shaped pick holder. Perfect for Bristol, the birthplace of country music.",
    description:
      "A must-have for any musician in the Birthplace of Country Music. This guitar-shaped pick holder is laser-cut and engraved from solid maple hardwood. The body features a laser-engraved musical note pattern and \"Bristol, TN\" text. The center cavity holds up to 20 standard guitar picks. A magnetic lid keeps picks secure while the flat back allows wall mounting or tabletop display. Includes 5 custom laser-engraved picks with the 423D Built logo.",
    category: "laser_engrave",
    price: 2999,
    material: "Solid Maple",
    dimensions: '10" x 4" x 0.75"',
    weight: 6.5,
    images: [
      "/images/products/guitar-pick-holder-1.jpg",
      "/images/products/guitar-pick-holder-2.jpg",
      "/images/products/guitar-pick-holder-3.jpg",
    ],
    featured: false,
    active: true,
    inventory: 10,
    madeToOrder: false,
    customizable: true,
    customizationPrompt:
      "Add a custom name or message to the guitar neck (max 25 characters):",
    tags: ["guitar", "music", "bristol", "country-music", "gift", "musician"],
    careInstructions:
      "Wipe clean with a dry cloth. Apply furniture polish occasionally to maintain the maple's natural luster.",
    shippingInfo:
      "Ships within 3-5 business days. Standard USPS shipping. Free shipping on orders over $75.",
  },
];

// ============================================
// Helper functions
// ============================================

export function getProductBySlug(slug: string): PlaceholderProduct | undefined {
  return PLACEHOLDER_PRODUCTS.find((p) => p.slug === slug);
}

export function getProductById(id: string): PlaceholderProduct | undefined {
  return PLACEHOLDER_PRODUCTS.find((p) => p.id === id);
}

export function getRelatedProducts(
  currentSlug: string,
  limit = 4
): PlaceholderProduct[] {
  const current = getProductBySlug(currentSlug);
  if (!current) return PLACEHOLDER_PRODUCTS.slice(0, limit);

  // Find products in the same category, excluding current
  const sameCategory = PLACEHOLDER_PRODUCTS.filter(
    (p) => p.category === current.category && p.slug !== currentSlug
  );

  // If not enough in the same category, fill with other products
  const others = PLACEHOLDER_PRODUCTS.filter(
    (p) => p.category !== current.category && p.slug !== currentSlug
  );

  return [...sameCategory, ...others].slice(0, limit);
}

export function filterProducts(options: {
  category?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
}): PlaceholderProduct[] {
  let filtered = PLACEHOLDER_PRODUCTS.filter((p) => p.active);

  if (options.category && options.category !== "all") {
    filtered = filtered.filter((p) => p.category === options.category);
  }

  if (options.material) {
    filtered = filtered.filter((p) =>
      p.material.toLowerCase().includes(options.material!.toLowerCase())
    );
  }

  if (options.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= options.minPrice!);
  }

  if (options.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= options.maxPrice!);
  }

  if (options.search) {
    const query = options.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some((t) => t.includes(query))
    );
  }

  switch (options.sort) {
    case "price-asc":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "popular":
      filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      break;
    case "newest":
    default:
      // Keep original order (newest first in our array)
      break;
  }

  return filtered;
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
