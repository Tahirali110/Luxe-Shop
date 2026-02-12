// server/data/products.js

const products = [
  {
    name: "Premium Wool Overcoat",
    price: 289,
    originalPrice: 349,
    description: "Luxuriously crafted Italian wool overcoat with a modern slim fit.",
    longDescription: "This premium overcoat is meticulously crafted from the finest Italian wool, offering exceptional warmth without sacrificing style. The modern slim fit silhouette flatters any body type, while the classic design ensures versatility for both casual and formal occasions. Features include a fully lined interior, genuine horn buttons, and reinforced stitching for lasting durability.",
    category: "Clothing",
    rating: 4.9,
    reviewsCount: 127,
    reviews: [
      { id: 'r1', userName: 'Emma S.', rating: 5, comment: 'Simply the best overcoat I have ever owned. The wool is so premium!', date: '2026-01-10', verified: true },
      { id: 'r2', userName: 'James W.', rating: 5, comment: 'Perfect fit and very warm. Worth every penny.', date: '2026-01-05', verified: true },
      { id: 'r3', userName: 'Michael L.', rating: 4, comment: 'Great quality, but the sleeves are a bit long for me.', date: '2025-12-20', verified: true }
    ],
    badge: "Best Seller",
    colors: [
      {
        name: "Charcoal",
        hex: "#1a1a1a",
        price: 289,
        image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80",
          "https://www.panaprium.com/cdn/shop/articles/organic_cotton_jackets_1000.jpg?v=1668397439",
          "https://topgurl.com/wp-content/uploads/2024/02/if-you-re-more-of-a-one-and-done-kinda-huma-700x933.jpg"
        ]
      },
      {
        name: "Slate Gray",
        hex: "#4a4a4a",
        price: 299,
        image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80",
          "https://i.etsystatic.com/18151682/r/il/0d3177/5435326088/il_794xN.5435326088_5aax.jpg"
        ]
      },
      {
        name: "Camel",
        hex: "#8b7355",
        price: 319,
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
          "https://di2ponv0v5otw.cloudfront.net/posts/2023/12/31/6591eb7cc9a228f6e2ebbd18/m_6591ed39b635f89977e35d21.jpg"
        ]
      }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    sizePriceAdjustments: {
      "XL": 20,
      "XXL": 40
    },
    features: ["100% Italian Wool", "Fully Lined", "Horn Buttons", "Dry Clean Only"],
    stock: 3
  },
  {
    name: "Wireless Studio Headphones",
    price: 349,
    description: "Premium noise-cancelling headphones with 40-hour battery life.",
    longDescription: "Experience audio like never before with our flagship wireless headphones. Featuring advanced active noise cancellation, these headphones create an immersive listening environment anywhere. The 40-hour battery life ensures uninterrupted enjoyment, while premium memory foam ear cushions provide all-day comfort.",
    category: "Electronics",
    rating: 4.8,
    reviewsCount: 342,
    reviews: [
      { id: '1', userName: 'David K.', rating: 5, comment: 'Noise cancellation is top notch. Better than my Sonys!', date: '2025-12-15', verified: true }
    ],
    badge: "New",
    colors: [
      {
        name: "Midnight Black",
        hex: "#000000",
        price: 349,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
          "https://images.unsplash.com/photo-1524670493602-ef2fbd4c683b?w=800&q=80"
        ]
      },
      {
        name: "Pearl White",
        hex: "#ffffff",
        price: 359,
        image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80",
          "https://images.unsplash.com/photo-1520170350707-b2da59c70f05?w=800&q=80"
        ]
      },
      {
        name: "Champagne Gold",
        hex: "#c4a35a",
        price: 399,
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80",
          "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=800&q=80"
        ]
      }
    ],
    features: ["Active Noise Cancellation", "40hr Battery", "Bluetooth 5.2", "Fast Charging"],
    stock: 0
  },
  {
    name: "Minimalist Leather Watch",
    price: 189,
    originalPrice: 229,
    description: "Swiss movement with genuine Italian leather strap.",
    longDescription: "This timepiece embodies understated elegance with its clean dial design and premium Italian leather strap. The Swiss-made quartz movement ensures precise timekeeping, while the sapphire crystal face resists scratches. Water-resistant to 50 meters, perfect for everyday wear.",
    category: "Accessories",
    rating: 4.7,
    reviewsCount: 89,
    reviews: [],
    colors: [
      {
        name: "Black",
        hex: "#000000",
        price: 189,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
          "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80"
        ]
      },
      {
        name: "Cognac",
        hex: "#8b4513",
        price: 199,
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80",
          "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80"
        ]
      }
    ],
    features: ["Swiss Movement", "Sapphire Crystal", "50m Water Resistant", "2-Year Warranty"],
    stock: 20
  },
  {
    name: "Cashmere Crew Sweater",
    price: 195,
    description: "100% Mongolian cashmere in a relaxed fit.",
    longDescription: "Indulge in the ultimate luxury with this 100% Mongolian cashmere sweater. The relaxed crew neck design offers effortless style, while the incredibly soft fabric keeps you warm without bulk. Each sweater is knitted from the finest grade cashmere fibers for exceptional softness and durability.",
    category: "Clothing",
    rating: 4.9,
    reviewsCount: 156,
    reviews: [],
    colors: [
      {
        name: "Obsidian",
        hex: "#1a1a1a",
        price: 195,
        image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
          "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80"
        ]
      },
      {
        name: "Cream",
        hex: "#f5f5dc",
        price: 205,
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80",
          "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=800&q=80"
        ]
      }
    ],
    sizes: ["S", "M", "L", "XL"],
    sizePriceAdjustments: {
      "L": 15,
      "XL": 25
    },
    features: ["100% Cashmere", "Hand Finished", "Breathable", "Machine Washable"],
    stock: 20
  },
  {
    name: "Smart Fitness Tracker",
    price: 129,
    description: "Advanced health monitoring with GPS and 7-day battery.",
    longDescription: "Take control of your health with this advanced fitness tracker. Features comprehensive health monitoring including heart rate, blood oxygen, stress levels, and sleep quality. Built-in GPS tracks your runs and cycles without needing your phone, while the 7-day battery means less time charging and more time moving.",
    category: "Electronics",
    rating: 4.6,
    reviewsCount: 234,
    reviews: [],
    badge: "Popular",
    colors: [
      {
        name: "Stealth Black",
        hex: "#000000",
        price: 129,
        image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80",
          "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80"
        ]
      },
      {
        name: "Ruby Red",
        hex: "#dc2626",
        price: 139,
        image: "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800&q=80",
          "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80"
        ]
      }
    ],
    features: ["GPS Tracking", "Heart Rate Monitor", "7-Day Battery", "Water Resistant"],
    stock: 20
  },
  {
    name: "Premium Leather Messenger",
    price: 425,
    description: "Handcrafted full-grain leather bag built to last.",
    longDescription: "This messenger bag is handcrafted from full-grain vegetable-tanned leather that develops a beautiful patina over time. The spacious interior fits a 15-inch laptop with room for documents, while multiple pockets keep essentials organized. Brass hardware and reinforced stitching ensure this bag lasts for decades.",
    category: "Accessories",
    rating: 4.8,
    reviewsCount: 67,
    reviews: [],
    colors: [
      {
        name: "Saddle Brown",
        hex: "#8b4513",
        price: 425,
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"
        ]
      },
      {
        name: "Black",
        hex: "#000000",
        price: 445,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
          "https://images.unsplash.com/photo-1547949003-9f8f90e5e0ff?w=800&q=80"
        ]
      }
    ],
    features: ["Full-Grain Leather", "Fits 15\" Laptop", "Brass Hardware", "Lifetime Warranty"],
    stock: 20
  },
  {
    name: "Designer Sunglasses",
    price: 275,
    originalPrice: 320,
    description: "Polarized UV400 lenses with titanium frame.",
    longDescription: "These premium sunglasses combine Italian craftsmanship with cutting-edge lens technology. The polarized UV400 lenses eliminate glare while protecting your eyes from harmful rays. The lightweight titanium frame is hypoallergenic and incredibly durable, making these the perfect everyday sunglasses.",
    category: "Accessories",
    rating: 4.7,
    reviewsCount: 98,
    reviews: [
      { id: 's1', userName: 'Sophia R.', rating: 5, comment: 'These are stunning! Lightweight and the clarity is amazing.', date: '2026-01-15', verified: true },
      { id: 's2', userName: 'David M.', rating: 4, comment: 'Classic look, very durable. I use them every day.', date: '2026-01-08', verified: true },
      { id: 's3', userName: 'Olivia G.', rating: 5, comment: 'The polarization is top notch. Best sunglasses I own.', date: '2025-12-28', verified: true }
    ],
    colors: [
      {
        name: "Matte Black",
        hex: "#000000",
        price: 275,
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
          "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80"
        ]
      },
      {
        name: "Tortoise",
        hex: "#8b7355",
        price: 285,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
          "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80"
        ]
      }
    ],
    features: ["Polarized Lenses", "UV400 Protection", "Titanium Frame", "Italian Made"],
    stock: 20
  },
  {
    name: "Ultra-Thin Laptop",
    price: 1299,
    description: "15\" 4K display with all-day battery life.",
    longDescription: "This ultra-thin powerhouse redefines portable computing. The stunning 15-inch 4K OLED display brings your content to life with vibrant colors and deep blacks. Powered by the latest processor, it handles everything from creative work to entertainment with ease. The all-day 20-hour battery means you can leave the charger at home.",
    category: "Electronics",
    rating: 4.9,
    reviewsCount: 412,
    reviews: [],
    badge: "Editor's Choice",
    colors: [
      {
        name: "Silver",
        hex: "#c0c0c0",
        price: 1299,
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"
        ]
      },
      {
        name: "Space Gray",
        hex: "#1a1a1a",
        price: 1349,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80"
        ]
      }
    ],
    features: ["4K OLED Display", "20hr Battery", "Ultra-Fast SSD", "Thunderbolt 4"],
    stock: 20
  },
  {
    name: "Tailored Linen Blazer",
    price: 245,
    description: "Breathable Belgian linen with half-canvas construction.",
    longDescription: "This expertly tailored blazer is crafted from premium Belgian linen, offering exceptional breathability for warm weather. The half-canvas construction ensures a flattering drape that improves with wear. Subtle details like natural horn buttons and a Bemberg lining elevate this piece above ordinary blazers.",
    category: "Clothing",
    rating: 4.6,
    reviewsCount: 73,
    reviews: [],
    colors: [
      {
        name: "Natural",
        hex: "#f5f5dc",
        price: 245,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
          "https://images.unsplash.com/photo-1594932224012-c59b39666782?w=800&q=80"
        ]
      },
      {
        name: "Black",
        hex: "#1a1a1a",
        price: 265,
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
          "https://images.unsplash.com/photo-1598808503742-dd34bd939249?w=800&q=80"
        ]
      }
    ],
    sizes: ["S", "M", "L", "XL"],
    sizePriceAdjustments: {
      "L": 15,
      "XL": 30
    },
    features: ["Belgian Linen", "Half-Canvas", "Horn Buttons", "Bemberg Lining"],
    stock: 20
  },
  {
    name: "Wireless Earbuds Pro",
    price: 199,
    originalPrice: 249,
    description: "Active noise cancellation with spatial audio.",
    longDescription: "These premium earbuds deliver an unmatched listening experience with adaptive active noise cancellation and immersive spatial audio. The custom-designed drivers produce rich, detailed sound across all frequencies. With 8 hours of listening time per charge and an additional 22 hours from the case, your music never stops.",
    category: "Electronics",
    rating: 4.8,
    reviewsCount: 289,
    reviews: [],
    badge: "Sale",
    colors: [
      {
        name: "Pearl White",
        hex: "#ffffff",
        price: 199,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
          "https://images.unsplash.com/photo-1605464315542-bda3e2f4e605?w=800&q=80"
        ]
      },
      {
        name: "Graphite",
        hex: "#000000",
        price: 219,
        image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80",
          "https://images.unsplash.com/photo-1598112972545-50cca2635926?w=800&q=80"
        ]
      }
    ],
    features: ["Active Noise Cancellation", "Spatial Audio", "30hr Total Battery", "Wireless Charging"],
    stock: 20
  },
  {
    name: "Merino Wool Scarf",
    price: 89,
    description: "Ultra-soft Australian merino wool accessory.",
    longDescription: "Wrap yourself in luxury with this ultra-soft Australian merino wool scarf. The fine-gauge knit provides exceptional warmth without bulk, while the natural temperature-regulating properties of merino keep you comfortable in any weather. Naturally odor-resistant and easy to care for.",
    category: "Accessories",
    rating: 4.5,
    reviewsCount: 56,
    reviews: [],
    colors: [
      {
        name: "Charcoal",
        hex: "#1a1a1a",
        price: 89,
        image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&q=80",
          "https://images.unsplash.com/photo-1601924921557-45e6dea0a157?w=800&q=80"
        ]
      },
      {
        name: "Burgundy",
        hex: "#8b0000",
        price: 99,
        image: "https://images.unsplash.com/photo-1601924921557-45e6dea0a157?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1601924921557-45e6dea0a157?w=800&q=80",
          "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&q=80"
        ]
      }
    ],
    features: ["100% Merino Wool", "Temperature Regulating", "Odor Resistant", "Lightweight"],
    stock: 20
  },
  {
    name: "Slim Fit Chinos",
    price: 98,
    description: "Premium stretch cotton with modern tapered fit.",
    longDescription: "These versatile chinos are crafted from premium stretch cotton that moves with you while maintaining a polished look. The modern tapered fit and medium rise create a flattering silhouette, while the garment-washed finish gives them a lived-in softness from day one.",
    category: "Clothing",
    rating: 4.7,
    reviewsCount: 201,
    reviews: [],
    colors: [
      {
        name: "Stone",
        hex: "#f5f5dc",
        price: 98,
        image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
          "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80"
        ]
      },
      {
        name: "Navy",
        hex: "#4a5568",
        price: 108,
        image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80",
        images: [
          "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&q=80",
          "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80"
        ]
      }
    ],
    sizes: ["30", "32", "34", "36"],
    sizePriceAdjustments: {
      "34": 10,
      "36": 20
    },
    features: ["Stretch Cotton", "Tapered Fit", "Garment Washed", "Machine Washable"],
    stock: 20
  }
];

module.exports = products;