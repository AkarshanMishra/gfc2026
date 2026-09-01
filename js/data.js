/**
 * GRILLISTA - Master Data & Catalogs
 * Rich Burger-Singh inspired Desi-Fusion menu, outlets, and promotions
 */

export const MENU_ITEMS = [
  // ------------------ BURGERS (VEG) ------------------
  {
    id: 'b-veg-01',
    name: 'Dilli-6 Crispy Aloo Tikki Burger',
    category: 'burgers',
    isVeg: true,
    isSpicy: false,
    spiceLevel: 1, // 1 to 3
    isBestseller: true,
    price: 119,
    calories: 380,
    protein: '8g',
    description: 'Golden spiced potato patty infused with roasted cumin, tangy saunth chutney, mint mayo, and crunchy onions in a brioche bun.',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    tags: ['Crispy', 'Dilli-6 Special', 'Budget King'],
    modifiers: [
      { name: 'Double Patty', price: 45 },
      { name: 'Tandoori Mayo Sachet', price: 20 },
      { name: 'Cheese Slice', price: 30 }
    ]
  },
  {
    id: 'b-veg-02',
    name: 'Paneer Pao-Wow Makhani Burger',
    category: 'burgers',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isBestseller: true,
    price: 219,
    calories: 520,
    protein: '19g',
    description: 'Char-grilled cottage cheese block smothered in rich Amritsari makhani gravy, caramelized onions, and tandoori garlic spread.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    tags: ['Makhani Rich', 'Chef Pick', 'Pure Desi'],
    modifiers: [
      { name: 'Extra Makhani Sauce', price: 25 },
      { name: 'Cheese Burst Layer', price: 40 },
      { name: 'Whole Wheat Bun', price: 25 }
    ]
  },
  {
    id: 'b-veg-03',
    name: 'Chana Masala Maharaja Burger',
    category: 'burgers',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isBestseller: false,
    price: 179,
    calories: 460,
    protein: '14g',
    description: 'Spiced Kabuli chana & roasted peanut patty with imli glaze, green chilies, crisp iceberg lettuce, and smoked paprika spread.',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
    tags: ['High Fibre', 'Tangy', 'Desi Twist'],
    modifiers: [
      { name: 'Pickled Jalapenos', price: 20 },
      { name: 'Cheese Slice', price: 30 }
    ]
  },
  {
    id: 'b-veg-04',
    name: 'Bihari Bhoot Jholokia Paneer Blast',
    category: 'burgers',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 3,
    isBestseller: false,
    price: 249,
    calories: 540,
    protein: '20g',
    description: 'Crispy paneer loaded with North-Eastern Ghost Pepper (Bhoot Jholokia) aioli, fiery salsa, and cooling cucumber slaw.',
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=600&q=80',
    tags: ['Extreme Hot 🔥🔥🔥', 'Dare to Try'],
    modifiers: [
      { name: 'Extra Cooling Mayo', price: 20 },
      { name: 'Cheese Slice', price: 30 }
    ]
  },

  // ------------------ BURGERS (NON-VEG) ------------------
  {
    id: 'b-nonveg-01',
    name: 'Amritsari Murgh Makhani Burger',
    category: 'burgers',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isBestseller: true,
    price: 259,
    calories: 590,
    protein: '28g',
    description: 'Succulent tandoor-roasted chicken fillet glazed with buttery cashew-tomato makhani gravy, pickled onions, and kasuri methi mayo.',
    image: 'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?auto=format&fit=crop&w=600&q=80',
    tags: ['Legendary', 'Bestseller ⭐', 'Makhani Glaze'],
    modifiers: [
      { name: 'Double Chicken Fillet', price: 85 },
      { name: 'Extra Makhani Sauce', price: 25 },
      { name: 'Cheddar Melt', price: 35 }
    ]
  },
  {
    id: 'b-nonveg-02',
    name: 'Jatt & Juliet Double Mutton Smash',
    category: 'burgers',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isBestseller: true,
    price: 349,
    calories: 680,
    protein: '34g',
    description: 'Two slow-cooked minced mutton patties seasoned with 16 secret desi spices, molten cheddar, charred onions, and mint coriander glaze.',
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=600&q=80',
    tags: ['Heavyweight', 'Pure Mutton', 'Double Patty'],
    modifiers: [
      { name: 'Extra Mutton Patty', price: 110 },
      { name: 'Crispy Bacon (Halal)', price: 60 },
      { name: 'Extra Cheese', price: 35 }
    ]
  },
  {
    id: 'b-nonveg-03',
    name: 'Old Monk BBQ Chicken Zinger',
    category: 'burgers',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isBestseller: false,
    price: 279,
    calories: 610,
    protein: '26g',
    description: 'Ultra-crunchy fried chicken thigh drenched in sweet & smoky rum-inspired BBQ sauce, coleslaw, and grilled pineapple slice.',
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80',
    tags: ['Smoky Sweet', 'Ultra Crunchy'],
    modifiers: [
      { name: 'Extra BBQ Glaze', price: 25 },
      { name: 'Cheese Slice', price: 30 }
    ]
  },
  {
    id: 'b-nonveg-04',
    name: 'Keema Pav Rocker Burger',
    category: 'burgers',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 3,
    isBestseller: false,
    price: 239,
    calories: 510,
    protein: '22g',
    description: 'Mumbai Irani café style spicy minced chicken keema topped with a sunny runny egg, lemon onion slaw, and butter toasted bun.',
    image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=600&q=80',
    tags: ['Bambaiya', 'Spicy Keema'],
    modifiers: [
      { name: 'Add Extra Fried Egg', price: 25 },
      { name: 'Extra Butter Bun', price: 20 }
    ]
  },

  // ------------------ LOADED FRIES & SIDES ------------------
  {
    id: 's-01',
    name: 'Dilli-6 Chaat Masala Fries',
    category: 'sides',
    isVeg: true,
    isSpicy: false,
    spiceLevel: 1,
    isBestseller: true,
    price: 99,
    calories: 310,
    protein: '4g',
    description: 'Skin-on golden fries tossed in secret Chandni Chowk chaat spice mix, fresh coriander, and lemon drizzle.',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
    tags: ['Signature', 'Chaat Vibe'],
    modifiers: [
      { name: 'Add Cheesy Jalapeno Dip', price: 30 },
      { name: 'Large Size Upgrade', price: 40 }
    ]
  },
  {
    id: 's-fries-salted',
    name: 'Salted Fries',
    category: 'fries',
    isVeg: true,
    isSpicy: false,
    spiceLevel: 0,
    isBestseller: false,
    price: 89,
    calories: 320,
    protein: '4g',
    description: 'Classic golden fries seasoned to perfection with fine sea salt.',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    tags: ['Classic', 'Crispy'],
    modifiers: [{ name: 'Cheese Dip', price: 25 }]
  },
  {
    id: 's-fries-masala',
    name: 'Masala Fries',
    category: 'fries',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 1,
    isBestseller: true,
    price: 99,
    calories: 340,
    protein: '4g',
    description: 'Crisp golden fries tossed in signature Indian masala seasoning.',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
    tags: ['Desi Spiced', 'Popular'],
    modifiers: [{ name: 'Peri Peri Dip', price: 25 }]
  },

  // ------------------ SANDWICHES & DESI BITES (OFFICIAL MENU) ------------------
  {
    id: 'sand-veg',
    name: 'Grillista Veg Sandwich',
    category: 'sides',
    isVeg: true,
    isSpicy: false,
    spiceLevel: 1,
    isBestseller: true,
    price: 119,
    calories: 350,
    protein: '7g',
    description: 'Fresh grilled sandwich loaded with fresh vegetables, mint chutney, and creamy fillings.',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    tags: ['Grilled', 'Fresh Made'],
    modifiers: [{ name: 'Extra Cheese', price: 30 }]
  },
  {
    id: 'sand-paneer',
    name: 'Grillista Paneer Sandwich',
    category: 'sides',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 1,
    isBestseller: true,
    price: 169,
    calories: 440,
    protein: '16g',
    description: 'Premium paneer sandwich grilled with melted cheese and signature spice sauces.',
    image: 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?auto=format&fit=crop&w=600&q=80',
    tags: ['High Protein', 'Chef Special'],
    modifiers: [{ name: 'Extra Cheese', price: 30 }]
  },
  {
    id: 'bite-poha',
    name: 'Grillista Poha',
    category: 'sides',
    isVeg: true,
    isSpicy: false,
    spiceLevel: 1,
    isBestseller: true,
    price: 59,
    calories: 220,
    protein: '5g',
    description: 'Traditional breakfast prepared with aromatic spices, crunchy peanuts, and fresh herbs.',
    image: 'https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?auto=format&fit=crop&w=600&q=80',
    tags: ['Healthy Choice', 'Light Bite'],
    modifiers: []
  },
  {
    id: 'bite-vadapav',
    name: 'Mumbai Vada Pav',
    category: 'sides',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isBestseller: false,
    price: 59,
    calories: 290,
    protein: '6g',
    description: 'Mumbai favourite street style burger served with fiery dry garlic & green chutneys.',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80',
    tags: ['Mumbai Special', 'Quick Snacker'],
    modifiers: [{ name: 'Extra Fried Chilly', price: 10 }]
  },
  {
    id: 'bite-cornchaat',
    name: 'Sweet Corn Chaat',
    category: 'sides',
    isVeg: true,
    isSpicy: false,
    spiceLevel: 1,
    isBestseller: false,
    price: 89,
    calories: 180,
    protein: '5g',
    description: 'Juicy sweet corn kernels tossed with butter, tangy chaat spices, and fresh herbs.',
    image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=600&q=80',
    tags: ['Low Calorie', 'Tasty'],
    modifiers: []
  },
  {
    id: 'bite-pavbhaji',
    name: 'Amritsari Butter Pav Bhaji',
    category: 'sides',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isBestseller: true,
    price: 129,
    calories: 480,
    protein: '10g',
    description: 'Mumbai style spicy vegetable mash topped with generous butter, served with soft butter pav.',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80',
    tags: ['Desi Classic', 'Bestseller ⭐'],
    modifiers: [{ name: 'Extra Butter Pav', price: 30 }]
  },

  // ------------------ CHINESE & PASTA DELIGHTS ------------------
  {
    id: 'ch-springrolls',
    name: 'Veg Spring Rolls',
    category: 'sides',
    isVeg: true,
    isSpicy: false,
    spiceLevel: 1,
    isBestseller: false,
    price: 157,
    calories: 320,
    protein: '6g',
    description: 'Crispy golden rolls packed with shredded wok vegetables and Asian sweet chili dip.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    tags: ['Crispy Snack'],
    modifiers: []
  },
  {
    id: 'ch-chillipaneer',
    name: 'Wok Chilli Paneer',
    category: 'sides',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isBestseller: true,
    price: 149,
    calories: 380,
    protein: '16g',
    description: 'Cubes of fresh cottage cheese tossed in spicy soy-garlic sauce with bell peppers & spring onions.',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80',
    tags: ['Indo-Chinese', 'Popular'],
    modifiers: []
  },
  {
    id: 'ch-honeychilli',
    name: 'Honey Chilli Potato',
    category: 'sides',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 1,
    isBestseller: true,
    price: 149,
    calories: 360,
    protein: '4g',
    description: 'Crisp potato fingers glazed in sweet honey, roasted sesame seeds, and red chili sauce.',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
    tags: ['Sweet & Spicy', 'Crowd Favorite'],
    modifiers: []
  },
  {
    id: 'pasta-white',
    name: 'White Sauce Alfredo Pasta',
    category: 'sides',
    isVeg: true,
    isSpicy: false,
    spiceLevel: 0,
    isBestseller: true,
    price: 199,
    calories: 520,
    protein: '14g',
    description: 'Creamy white sauce penne pasta loaded with rich cheese, roasted garlic, and Italian herbs.',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&w=600&q=80',
    tags: ['Creamy & Cheesy'],
    modifiers: [{ name: 'Add Paneer', price: 35 }, { name: 'Add Mushroom', price: 30 }]
  },
  {
    id: 'pasta-red',
    name: 'Red Sauce Arrabiata Pasta',
    category: 'sides',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 1,
    isBestseller: false,
    price: 169,
    calories: 420,
    protein: '11g',
    description: 'Tangy tomato based pasta cooked with aromatic basil, crushed red chilies, and oregano.',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80',
    tags: ['Tangy & Zesty'],
    modifiers: [{ name: 'Extra Cheese', price: 50 }]
  },

  // ------------------ GARLIC BREADS & WRAPS ------------------
  {
    id: 'gb-stuffed',
    name: 'Stuffed Garlic Bread',
    category: 'sides',
    isVeg: true,
    isSpicy: false,
    spiceLevel: 1,
    isBestseller: true,
    price: 119,
    calories: 360,
    protein: '9g',
    description: 'Freshly baked garlic bread stuffed with melted cheese, jalapenos, and golden sweet corn.',
    image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=600&q=80',
    tags: ['Cheesy', 'Bestseller ⭐'],
    modifiers: [{ name: 'Cheese Dip', price: 25 }]
  },
  {
    id: 'gb-paneer',
    name: 'Red Paprika & Paneer Garlic Bread',
    category: 'sides',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isBestseller: true,
    price: 169,
    calories: 420,
    protein: '14g',
    description: 'Freshly baked artisan garlic bread loaded with spiced paneer cubes and zesty red paprika.',
    image: 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?auto=format&fit=crop&w=600&q=80',
    tags: ['Spiced Paneer', 'Chef Pick'],
    modifiers: []
  },
  {
    id: 'wrap-paneer',
    name: 'Paneer Veg Wrap',
    category: 'sides',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isBestseller: true,
    price: 139,
    calories: 410,
    protein: '15g',
    description: 'Soft tortilla wrap packed with marinated paneer tikka, crunchy onions, and mint mayo.',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80',
    tags: ['Loaded Roll', 'High Protein'],
    modifiers: [{ name: 'Extra Cheese', price: 30 }]
  },

  // ------------------ PIZZAS (CLASSIC & PREMIUM) ------------------
  {
    id: 'piz-farmhouse',
    name: 'Farmhouse Pizza (Fresh Veggie)',
    category: 'sides',
    isVeg: true,
    isSpicy: false,
    spiceLevel: 1,
    isBestseller: true,
    price: 189,
    calories: 680,
    protein: '22g',
    description: 'Fresh farmhouse style pizza topped with crisp capsicum, golden corn, mushrooms, and 100% mozzarella.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    tags: ['Loaded Veggies', 'Bestseller ⭐'],
    modifiers: [{ name: 'Cheese Burst Crust', price: 30 }, { name: 'Medium Size', price: 200 }]
  },
  {
    id: 'piz-kadhai-paneer',
    name: 'Kadhai Paneer Tikka Pizza',
    category: 'sides',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isBestseller: true,
    price: 189,
    calories: 720,
    protein: '26g',
    description: 'Spicy kadhai paneer topping paired with rich stringy mozzarella cheese and aromatic Indian spices.',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
    tags: ['Desi Fusion Pizza', 'Chef Special'],
    modifiers: [{ name: 'Cheese Burst Crust', price: 30 }, { name: 'Medium Size', price: 210 }]
  },
  {
    id: 'piz-mexican',
    name: 'Mexican Spicy Veg Pizza',
    category: 'sides',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isBestseller: false,
    price: 169,
    calories: 650,
    protein: '20g',
    description: 'Mexican style spicy pizza loaded with sliced jalapenos, red paprika, and cheesy goodness.',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
    tags: ['Spicy Mexican', 'Cheesy'],
    modifiers: [{ name: 'Cheese Burst Crust', price: 40 }]
  },

  // ------------------ COMBOS & MEALS ------------------
  {
    id: 'c-01',
    name: 'Desi Boss Solo Box',
    category: 'combos',
    isVeg: false,
    isSpicy: true,
    spiceLevel: 2,
    isBestseller: true,
    price: 369,
    calories: 920,
    protein: '35g',
    description: '1x Amritsari Murgh Burger + 1x Dilli-6 Chaat Fries + 1x Aam Panna Fizz + 1x Gulab Jamun Sundae.',
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80',
    tags: ['Best Value 💰', 'Full Meal'],
    modifiers: [
      { name: 'Upgrade to Mutton Smash', price: 80 },
      { name: 'Large Fries & Drink', price: 40 }
    ]
  },
  {
    id: 'c-02',
    name: 'Twin Sizzler Veg Feast',
    category: 'combos',
    isVeg: true,
    isSpicy: true,
    spiceLevel: 2,
    isBestseller: true,
    price: 499,
    calories: 1150,
    protein: '28g',
    description: '1x Paneer Pao-Wow + 1x Crispy Aloo Tikki + Large Loaded Chaat Fries + 2x Desi Craft Coolers.',
    image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=600&q=80',
    tags: ['For Two 👫', 'Party Pack'],
    modifiers: [
      { name: 'Add 2x Extra Cheese Dips', price: 50 }
    ]
  },

  // ------------------ CRAFT BEVERAGES & DESSERTS ------------------
  {
    id: 'bev-01',
    name: 'Kala Khatta Spiced Chiller',
    category: 'beverages',
    isVeg: true,
    isSpicy: false,
    spiceLevel: 0,
    isBestseller: true,
    price: 89,
    calories: 120,
    protein: '0g',
    description: 'Nostalgic Mumbai street-style sweet and tangy blackberry cooler with black salt, mint, and fizzy soda.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    tags: ['Street Icon', 'Super Refreshing'],
    modifiers: []
  },
  {
    id: 'bev-02',
    name: 'Kesar Badam Masala Shake',
    category: 'beverages',
    isVeg: true,
    isSpicy: false,
    spiceLevel: 0,
    isBestseller: false,
    price: 139,
    calories: 340,
    protein: '8g',
    description: 'Thick creamy milkshake infused with royal saffron, crushed almonds, cardamom, and pistachio crumble.',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    tags: ['Royal Thickshake'],
    modifiers: []
  },
  {
    id: 'des-01',
    name: 'Hot Gulab Jamun Sundae',
    category: 'desserts',
    isVeg: true,
    isSpicy: false,
    spiceLevel: 0,
    isBestseller: true,
    price: 129,
    calories: 290,
    protein: '4g',
    description: 'Warm desi ghee gulab jamuns served over creamy vanilla bean ice cream with crushed pistachio and rose syrup drizzle.',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
    tags: ['Desi Sweet Tooth'],
    modifiers: []
  }
];

// Active Discount Coupons
export const COUPONS = {
  'GRILLISTA50': {
    code: 'GRILLISTA50',
    discountPercent: 50,
    maxDiscount: 120,
    minOrder: 249,
    description: '50% OFF up to ₹120 on orders above ₹249'
  },
  'DESI20': {
    code: 'DESI20',
    discountPercent: 20,
    maxDiscount: 100,
    minOrder: 199,
    description: '20% Flat OFF up to ₹100 on orders above ₹199'
  },
  'FREESHIP': {
    code: 'FREESHIP',
    isFreeDelivery: true,
    minOrder: 199,
    description: 'Free Delivery on orders above ₹199'
  },
  'FIRSTBURGER': {
    code: 'FIRSTBURGER',
    flatDiscount: 75,
    minOrder: 299,
    description: 'Flat ₹75 OFF for first-time foodies'
  }
};

// Master Outlets Database across Indian Cities
export const OUTLETS = [
  {
    id: 'out-delhi-01',
    name: 'Grillista Flagship - Connaught Place',
    city: 'Delhi NCR',
    state: 'Delhi',
    lat: 28.6315,
    lng: 77.2167,
    address: 'Block M-42, Outer Circle, Connaught Place, New Delhi - 110001',
    phone: '+91 11 4987 1101',
    rating: 4.8,
    reviewsCount: 1420,
    timing: '11:00 AM - 01:00 AM',
    formats: ['Dine-In', 'Delivery', 'Drive-Thru'],
    isOpenNow: true,
    mapsUrl: 'https://maps.google.com/?q=Connaught+Place+New+Delhi'
  },
  {
    id: 'out-delhi-02',
    name: 'Grillista Express - Cyber Hub',
    city: 'Delhi NCR',
    state: 'Haryana',
    lat: 28.4950,
    lng: 77.0895,
    address: 'Unit 102, Ground Floor, DLF Cyber Hub, Gurugram - 122002',
    phone: '+91 124 459 2200',
    rating: 4.9,
    reviewsCount: 2150,
    timing: '10:00 AM - 02:00 AM',
    formats: ['Dine-In', 'Delivery'],
    isOpenNow: true,
    mapsUrl: 'https://maps.google.com/?q=DLF+Cyber+Hub+Gurugram'
  },
  {
    id: 'out-delhi-03',
    name: 'Grillista - Rajouri Garden',
    city: 'Delhi NCR',
    state: 'Delhi',
    lat: 28.6472,
    lng: 77.1215,
    address: 'Main Market, BK Dutt Gate, Rajouri Garden, New Delhi - 110027',
    phone: '+91 11 4721 9900',
    rating: 4.7,
    reviewsCount: 980,
    timing: '11:00 AM - 11:30 PM',
    formats: ['Dine-In', 'Delivery'],
    isOpenNow: true,
    mapsUrl: 'https://maps.google.com/?q=Rajouri+Garden+Delhi'
  },
  {
    id: 'out-mumbai-01',
    name: 'Grillista - Bandra Linking Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.0607,
    lng: 72.8362,
    address: 'Corner of 14th Road, Linking Road, Bandra West, Mumbai - 400050',
    phone: '+91 22 2640 8812',
    rating: 4.8,
    reviewsCount: 1840,
    timing: '11:00 AM - 01:30 AM',
    formats: ['Dine-In', 'Delivery'],
    isOpenNow: true,
    mapsUrl: 'https://maps.google.com/?q=Bandra+West+Mumbai'
  },
  {
    id: 'out-mumbai-02',
    name: 'Grillista Kitchen - Powai Hiranandani',
    city: 'Mumbai',
    state: 'Maharashtra',
    lat: 19.1176,
    lng: 72.9060,
    address: 'Galleria Mall, Ground Floor, Hiranandani Gardens, Powai, Mumbai - 400076',
    phone: '+91 22 2570 3344',
    rating: 4.7,
    reviewsCount: 1120,
    timing: '11:00 AM - Midnight',
    formats: ['Food Court', 'Delivery'],
    isOpenNow: true,
    mapsUrl: 'https://maps.google.com/?q=Powai+Hiranandani+Mumbai'
  },
  {
    id: 'out-bangalore-01',
    name: 'Grillista Flagship - Indiranagar 100ft Rd',
    city: 'Bengaluru',
    state: 'Karnataka',
    lat: 12.9784,
    lng: 77.6408,
    address: '772, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru - 560038',
    phone: '+91 80 4120 7766',
    rating: 4.9,
    reviewsCount: 2310,
    timing: '11:00 AM - 01:00 AM',
    formats: ['Dine-In', 'Delivery', 'Rooftop'],
    isOpenNow: true,
    mapsUrl: 'https://maps.google.com/?q=100+Feet+Road+Indiranagar+Bengaluru'
  },
  {
    id: 'out-bangalore-02',
    name: 'Grillista Express - Koramangala 5th Block',
    city: 'Bengaluru',
    state: 'Karnataka',
    lat: 12.9352,
    lng: 77.6245,
    address: '42, Jyoti Nivas College Rd, 5th Block, Koramangala, Bengaluru - 560095',
    phone: '+91 80 4911 3400',
    rating: 4.8,
    reviewsCount: 1690,
    timing: '11:00 AM - 02:00 AM',
    formats: ['Dine-In', 'Delivery'],
    isOpenNow: true,
    mapsUrl: 'https://maps.google.com/?q=Koramangala+5th+Block+Bengaluru'
  },
  {
    id: 'out-chandigarh-01',
    name: 'Grillista - Sector 35-C',
    city: 'Chandigarh',
    state: 'Punjab / Chandigarh',
    lat: 30.7266,
    lng: 76.7645,
    address: 'SCO 441-442, Sector 35-C, Chandigarh - 160035',
    phone: '+91 172 460 8899',
    rating: 4.9,
    reviewsCount: 1950,
    timing: '11:00 AM - 01:00 AM',
    formats: ['Dine-In', 'Drive-Thru', 'Delivery'],
    isOpenNow: true,
    mapsUrl: 'https://maps.google.com/?q=Sector+35-C+Chandigarh'
  },
  {
    id: 'out-pune-01',
    name: 'Grillista - Koregaon Park North Main Rd',
    city: 'Pune',
    state: 'Maharashtra',
    lat: 18.5362,
    lng: 73.8940,
    address: 'Lane 6, North Main Road, Koregaon Park, Pune - 411001',
    phone: '+91 20 6620 4411',
    rating: 4.8,
    reviewsCount: 1340,
    timing: '11:00 AM - 01:00 AM',
    formats: ['Dine-In', 'Delivery'],
    isOpenNow: true,
    mapsUrl: 'https://maps.google.com/?q=Koregaon+Park+Pune'
  },
  {
    id: 'out-hyderabad-01',
    name: 'Grillista Flagship - Jubilee Hills Rd 36',
    city: 'Hyderabad',
    state: 'Telangana',
    lat: 17.4319,
    lng: 78.4073,
    address: 'Plot 241, Road Number 36, Jubilee Hills, Hyderabad - 500033',
    phone: '+91 40 4855 9922',
    rating: 4.8,
    reviewsCount: 1560,
    timing: '11:00 AM - 02:00 AM',
    formats: ['Dine-In', 'Delivery'],
    isOpenNow: true,
    mapsUrl: 'https://maps.google.com/?q=Road+36+Jubilee+Hills+Hyderabad'
  }
];

// Fallback dynamic customer reviews
export const INITIAL_REVIEWS = [
  {
    name: 'Simran Kaur',
    city: 'Chandigarh',
    rating: 5,
    comment: 'The Amritsari Murgh Makhani burger is pure nostalgia! Juicy chicken, real tandoori aroma, beats international chains hands down.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    date: '2 days ago',
    verifiedBuyer: true
  },
  {
    name: 'Rohan Sharma',
    city: 'Delhi NCR',
    rating: 5,
    comment: 'Dilli-6 fries with the chaat spice blend are criminally addictive. We ordered for our entire tech team!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    date: 'Just now',
    verifiedBuyer: true
  },
  {
    name: 'Ananya Deshmukh',
    city: 'Mumbai',
    rating: 5,
    comment: 'Paneer Pao-Wow has that authentic buttery makhani taste. Also the delivery was blazing fast in 22 mins.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    date: 'Yesterday',
    verifiedBuyer: true
  },
  {
    name: 'Vikramaditya Rao',
    city: 'Bengaluru',
    rating: 5,
    comment: 'Jatt & Juliet Mutton burger is a heavyweight masterpiece. The packaging keeps it piping hot. 10/10!',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    date: '3 days ago',
    verifiedBuyer: true
  }
];
