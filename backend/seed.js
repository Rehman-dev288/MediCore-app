const mysql = require("mysql2/promise");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const medicines = [
  {
    name: "Amoxicillin 500mg",
    brand: "AmoxiCare",
    category: "Prescription Drugs",
    subcategory: "Antibiotics",
    price: 12.99,
    description:
      "Broad-spectrum antibiotic for bacterial infections including respiratory, urinary tract, and skin infections.",
    dosage:
      "Take 1 capsule (500mg) every 8 hours for 7-10 days. Complete the full course.",
    side_effects: ["Nausea", "Diarrhea", "Skin rash", "Vomiting"],
    interactions: ["Methotrexate", "Warfarin"],
    requires_prescription: true,
    stock: 150,
    expiry_date: "2027-06-15",
    image_url:
      "https://images.pexels.com/photos/5995052/pexels-photo-5995052.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "PharmaCorp International",
  },
  {
    name: "Metformin 500mg",
    brand: "GlucoStable",
    category: "Prescription Drugs",
    subcategory: "Diabetes",
    price: 8.49,
    description:
      "First-line medication for type 2 diabetes. Helps control blood sugar levels.",
    dosage:
      "Take 1 tablet twice daily with meals. May increase to 1000mg twice daily.",
    side_effects: ["Nausea", "Stomach upset", "Metallic taste", "Diarrhea"],
    interactions: ["Alcohol", "Iodinated contrast agents"],
    requires_prescription: true,
    stock: 200,
    expiry_date: "2027-09-20",
    image_url:
      "https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "DiabeCare Labs",
  },
  {
    name: "Lisinopril 10mg",
    brand: "CardioGuard",
    category: "Prescription Drugs",
    subcategory: "Cardiovascular",
    price: 15.99,
    description:
      "ACE inhibitor used to treat high blood pressure and heart failure.",
    dosage: "Take 1 tablet daily. May be taken with or without food.",
    side_effects: ["Dry cough", "Dizziness", "Headache", "Fatigue"],
    interactions: ["Potassium supplements", "NSAIDs", "Lithium"],
    requires_prescription: true,
    stock: 180,
    expiry_date: "2027-03-10",
    image_url:
      "https://images.pexels.com/photos/593451/pexels-photo-593451.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "HeartWell Pharma",
  },
  {
    name: "Atorvastatin 20mg",
    brand: "LipidClear",
    category: "Prescription Drugs",
    subcategory: "Cardiovascular",
    price: 18.5,
    description:
      "Statin medication used to lower cholesterol and reduce cardiovascular risk.",
    dosage: "Take 1 tablet daily in the evening. Avoid grapefruit juice.",
    side_effects: ["Muscle pain", "Joint pain", "Nausea", "Headache"],
    interactions: ["Grapefruit", "Cyclosporine", "Gemfibrozil"],
    requires_prescription: true,
    stock: 120,
    expiry_date: "2027-11-30",
    image_url:
      "https://images.pexels.com/photos/3683108/pexels-photo-3683108.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "HeartWell Pharma",
  },
  {
    name: "Omeprazole 20mg",
    brand: "AcidShield",
    category: "Prescription Drugs",
    subcategory: "Gastric",
    price: 11.25,
    description:
      "Proton pump inhibitor for treating GERD, stomach ulcers, and acid reflux.",
    dosage: "Take 1 capsule daily before breakfast for 4-8 weeks.",
    side_effects: ["Headache", "Nausea", "Abdominal pain", "Flatulence"],
    interactions: ["Clopidogrel", "Methotrexate", "Diazepam"],
    requires_prescription: true,
    stock: 250,
    expiry_date: "2027-08-25",
    image_url:
      "https://images.pexels.com/photos/5910953/pexels-photo-5910953.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "GastroMed Solutions",
  },
  {
    name: "Azithromycin 250mg",
    brand: "ZithroMax",
    category: "Prescription Drugs",
    subcategory: "Antibiotics",
    price: 22.99,
    description:
      "Macrolide antibiotic for respiratory infections, ear infections, and STIs.",
    dosage: "Day 1: 500mg, Days 2-5: 250mg daily. Take on empty stomach.",
    side_effects: ["Diarrhea", "Nausea", "Abdominal pain", "Vomiting"],
    interactions: ["Antacids", "Warfarin", "Digoxin"],
    requires_prescription: true,
    stock: 90,
    expiry_date: "2026-12-15",
    image_url:
      "https://images.pexels.com/photos/3683098/pexels-photo-3683098.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "PharmaCorp International",
  },
  {
    name: "Ciprofloxacin 500mg",
    brand: "CiproTech",
    category: "Prescription Drugs",
    subcategory: "Antibiotics",
    price: 16.75,
    description:
      "Fluoroquinolone antibiotic for urinary tract and respiratory infections.",
    dosage:
      "Take 1 tablet every 12 hours for 7-14 days. Drink plenty of fluids.",
    side_effects: ["Nausea", "Diarrhea", "Dizziness", "Tendon problems"],
    interactions: ["Antacids", "Theophylline", "Warfarin"],
    requires_prescription: true,
    stock: 110,
    expiry_date: "2027-04-20",
    image_url:
      "https://images.pexels.com/photos/5910764/pexels-photo-5910764.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "BioGenix Labs",
  },
  {
    name: "Losartan 50mg",
    brand: "PressureEase",
    category: "Prescription Drugs",
    subcategory: "Cardiovascular",
    price: 14.25,
    description:
      "ARB medication for high blood pressure and kidney protection in diabetics.",
    dosage: "Take 1 tablet daily. May increase to 100mg daily if needed.",
    side_effects: ["Dizziness", "Back pain", "Fatigue", "Hypotension"],
    interactions: ["Potassium supplements", "NSAIDs", "Lithium"],
    requires_prescription: true,
    stock: 160,
    expiry_date: "2027-07-10",
    image_url:
      "https://images.pexels.com/photos/4047073/pexels-photo-4047073.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "HeartWell Pharma",
  },
  {
    name: "Paracetamol 500mg",
    brand: "FeverFree",
    category: "OTC",
    subcategory: "Pain Relief",
    price: 4.99,
    description:
      "Effective pain reliever and fever reducer. Safe for adults and children.",
    dosage: "Adults: 1-2 tablets every 4-6 hours. Max 8 tablets in 24 hours.",
    side_effects: ["Rare allergic reactions", "Liver damage with overdose"],
    interactions: ["Alcohol", "Warfarin"],
    requires_prescription: false,
    stock: 500,
    expiry_date: "2028-01-15",
    image_url:
      "https://images.pexels.com/photos/3850885/pexels-photo-3850885.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "GenericMed Co",
  },
  {
    name: "Ibuprofen 400mg",
    brand: "PainAway",
    category: "OTC",
    subcategory: "Pain Relief",
    price: 6.49,
    description:
      "NSAID for pain, inflammation, and fever. Effective for headaches and muscle pain.",
    dosage: "Take 1 tablet every 6-8 hours with food. Max 3 tablets daily.",
    side_effects: ["Stomach upset", "Heartburn", "Dizziness", "Nausea"],
    interactions: ["Aspirin", "Blood thinners", "ACE inhibitors"],
    requires_prescription: false,
    stock: 400,
    expiry_date: "2027-12-01",
    image_url:
      "https://images.pexels.com/photos/4210611/pexels-photo-4210611.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "GenericMed Co",
  },
  {
    name: "Cetirizine 10mg",
    brand: "AllerClear",
    category: "OTC",
    subcategory: "Allergy & Cold",
    price: 7.99,
    description:
      "Non-drowsy antihistamine for hay fever, allergic rhinitis, and urticaria.",
    dosage: "Take 1 tablet daily. May be taken with or without food.",
    side_effects: ["Drowsiness", "Dry mouth", "Fatigue", "Headache"],
    interactions: ["Alcohol", "CNS depressants"],
    requires_prescription: false,
    stock: 300,
    expiry_date: "2027-10-15",
    image_url:
      "https://images.pexels.com/photos/5910965/pexels-photo-5910965.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "AllergyFree Inc",
  },
  {
    name: "Loperamide 2mg",
    brand: "StopFlow",
    category: "OTC",
    subcategory: "Digestive Health",
    price: 5.49,
    description:
      "Anti-diarrheal medication for acute and chronic diarrhea relief.",
    dosage:
      "Initial: 2 capsules, then 1 after each loose stool. Max 8 capsules daily.",
    side_effects: ["Constipation", "Nausea", "Dizziness", "Abdominal cramps"],
    interactions: ["Quinidine", "Ritonavir"],
    requires_prescription: false,
    stock: 220,
    expiry_date: "2027-05-20",
    image_url:
      "https://images.pexels.com/photos/8066773/pexels-photo-8066773.png?auto=compress&cs=tinysrgb&w=400",
    supplier: "GastroMed Solutions",
  },
  {
    name: "Aspirin 75mg",
    brand: "CardioAspirin",
    category: "OTC",
    subcategory: "Pain Relief",
    price: 3.99,
    description:
      "Low-dose aspirin for cardiovascular protection and mild pain relief.",
    dosage: "Take 1 tablet daily with food. Do not crush or chew.",
    side_effects: ["Stomach irritation", "Increased bleeding", "Nausea"],
    interactions: ["Ibuprofen", "Warfarin", "Methotrexate"],
    requires_prescription: false,
    stock: 350,
    expiry_date: "2028-02-28",
    image_url:
      "https://images.pexels.com/photos/4047149/pexels-photo-4047149.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "GenericMed Co",
  },
  {
    name: "Diclofenac Gel 1%",
    brand: "PainRelief Topical",
    category: "OTC",
    subcategory: "Pain Relief",
    price: 9.99,
    description:
      "Topical NSAID gel for joint pain, sprains, and muscle inflammation.",
    dosage:
      "Apply thin layer to affected area 3-4 times daily. Do not exceed 32g per day.",
    side_effects: ["Skin irritation", "Rash", "Itching", "Dryness"],
    interactions: ["Oral NSAIDs", "Blood thinners"],
    requires_prescription: false,
    stock: 180,
    expiry_date: "2027-09-30",
    image_url:
      "https://images.pexels.com/photos/6692155/pexels-photo-6692155.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "TopicalMed Labs",
  },
  {
    name: "Cough Syrup DM",
    brand: "CoughGuard",
    category: "OTC",
    subcategory: "Allergy & Cold",
    price: 8.75,
    description:
      "Dextromethorphan-based cough suppressant for dry, non-productive coughs.",
    dosage: "Adults: 10-20ml every 4-6 hours. Max 120ml in 24 hours.",
    side_effects: ["Drowsiness", "Dizziness", "Nausea", "Stomach upset"],
    interactions: ["MAO inhibitors", "SSRIs", "Alcohol"],
    requires_prescription: false,
    stock: 240,
    expiry_date: "2027-06-30",
    image_url:
      "https://images.pexels.com/photos/5726794/pexels-photo-5726794.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "ColdCare Industries",
  },
  {
    name: "Vitamin C 1000mg",
    brand: "ImmuBoost",
    category: "Wellness",
    subcategory: "Vitamins",
    price: 12.49,
    description:
      "High-potency vitamin C supplement for immune support and antioxidant protection.",
    dosage:
      "Take 1 tablet daily with food. May take up to 2 tablets during cold season.",
    side_effects: ["Stomach upset at high doses", "Diarrhea"],
    interactions: ["Chemotherapy drugs", "Estrogen"],
    requires_prescription: false,
    stock: 350,
    expiry_date: "2028-03-15",
    image_url:
      "https://images.pexels.com/photos/3873149/pexels-photo-3873149.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "VitaWell Nutrition",
  },
  {
    name: "Vitamin D3 2000IU",
    brand: "SunShine D",
    category: "Wellness",
    subcategory: "Vitamins",
    price: 10.99,
    description:
      "Essential vitamin D supplement for bone health, immunity, and mood support.",
    dosage:
      "Take 1 softgel daily with a meal containing fat for best absorption.",
    side_effects: ["Nausea at high doses", "Headache", "Metallic taste"],
    interactions: ["Thiazide diuretics", "Steroids"],
    requires_prescription: false,
    stock: 280,
    expiry_date: "2028-06-20",
    image_url:
      "https://images.pexels.com/photos/4046718/pexels-photo-4046718.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "VitaWell Nutrition",
  },
  {
    name: "Omega-3 Fish Oil",
    brand: "OceanPure",
    category: "Wellness",
    subcategory: "Supplements",
    price: 19.99,
    description:
      "Premium fish oil supplement rich in EPA and DHA for heart and brain health.",
    dosage:
      "Take 2 softgels daily with meals. Contains 1000mg fish oil per softgel.",
    side_effects: ["Fishy aftertaste", "Nausea", "Bloating"],
    interactions: ["Blood thinners", "Blood pressure medications"],
    requires_prescription: false,
    stock: 200,
    expiry_date: "2027-12-10",
    image_url:
      "https://images.pexels.com/photos/3621234/pexels-photo-3621234.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "MarineHealth Co",
  },
  {
    name: "Multivitamin Complex",
    brand: "DailyVital",
    category: "Wellness",
    subcategory: "Vitamins",
    price: 14.99,
    description:
      "Complete daily multivitamin with essential minerals for overall health and wellness.",
    dosage:
      "Take 1 tablet daily with breakfast. Do not exceed recommended dose.",
    side_effects: ["Mild stomach upset", "Nausea if taken on empty stomach"],
    interactions: ["Tetracycline antibiotics", "Levodopa"],
    requires_prescription: false,
    stock: 320,
    expiry_date: "2028-01-30",
    image_url:
      "https://images.pexels.com/photos/4046567/pexels-photo-4046567.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "VitaWell Nutrition",
  },
  {
    name: "Zinc 50mg",
    brand: "ZincForce",
    category: "Wellness",
    subcategory: "Immunity",
    price: 8.99,
    description:
      "Zinc supplement for immune function, wound healing, and cell growth.",
    dosage: "Take 1 tablet daily with food. Do not take on empty stomach.",
    side_effects: ["Nausea", "Metallic taste", "Stomach cramps"],
    interactions: ["Antibiotics", "Diuretics", "Penicillamine"],
    requires_prescription: false,
    stock: 260,
    expiry_date: "2028-04-15",
    image_url:
      "https://images.pexels.com/photos/4046616/pexels-photo-4046616.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "MineralMax Labs",
  },
  {
    name: "Probiotics 10B CFU",
    brand: "GutBalance",
    category: "Wellness",
    subcategory: "Supplements",
    price: 16.49,
    description:
      "Multi-strain probiotic supplement for digestive health and gut flora balance.",
    dosage: "Take 1 capsule daily on empty stomach or with light meal.",
    side_effects: ["Mild bloating initially", "Gas"],
    interactions: ["Antibiotics", "Immunosuppressants"],
    requires_prescription: false,
    stock: 190,
    expiry_date: "2027-08-20",
    image_url:
      "https://images.pexels.com/photos/4047110/pexels-photo-4047110.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "BioFlora Inc",
  },
  {
    name: "Collagen Peptides",
    brand: "SkinGlow",
    category: "Wellness",
    subcategory: "Skin Care",
    price: 24.99,
    description:
      "Hydrolyzed collagen peptides for skin elasticity, joint, and bone health.",
    dosage: "Mix 1 scoop (10g) into water or beverage daily.",
    side_effects: ["Mild digestive discomfort", "Bloating"],
    interactions: ["No major drug interactions known"],
    requires_prescription: false,
    stock: 140,
    expiry_date: "2027-10-30",
    image_url:
      "https://images.pexels.com/photos/4046659/pexels-photo-4046659.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "BeautyWell Labs",
  },
  {
    name: "Melatonin 5mg",
    brand: "SleepWell",
    category: "Wellness",
    subcategory: "Supplements",
    price: 11.49,
    description:
      "Natural sleep aid supplement for improved sleep quality and jet lag relief.",
    dosage:
      "Take 1 tablet 30-60 minutes before bedtime. Start with lower dose.",
    side_effects: ["Drowsiness", "Headache", "Vivid dreams", "Dizziness"],
    interactions: [
      "Blood thinners",
      "Immunosuppressants",
      "Diabetes medications",
    ],
    requires_prescription: false,
    stock: 210,
    expiry_date: "2028-02-10",
    image_url:
      "https://images.pexels.com/photos/5473182/pexels-photo-5473182.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "NightRest Labs",
  },
  {
    name: "Bandage Strips Pack",
    brand: "FirstAid Plus",
    category: "OTC",
    subcategory: "First Aid",
    price: 3.49,
    description:
      "Assorted adhesive bandage strips for minor cuts, scrapes, and wounds.",
    dosage: "Clean wound, apply bandage. Change daily or when wet/dirty.",
    side_effects: ["Skin irritation from adhesive in rare cases"],
    interactions: [],
    requires_prescription: false,
    stock: 450,
    expiry_date: "2029-01-01",
    image_url:
      "https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=400",
    supplier: "SafeWound Medical",
  },
];
async function seedDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: "medicore-medicore-288.h.aivencloud.com",
      port: 16909,
      user: "avnadmin",
      password: "AVNS_jh1oDYYgbHmtw1I9Zvi",
      database: "defaultdb",
      ssl: {
        rejectUnauthorized: false,
      },
    });

    console.log("✅ Connected to Aiven Cloud! Cleaning old data...");

    await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
    await connection.execute("TRUNCATE TABLE medicines");
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1");

    console.log("🚀 Seeding medicines into cloud database...");

    for (const med of medicines) {
      const query = `INSERT INTO medicines 
          (id, name, brand, category, subcategory, price, description, dosage, side_effects, interactions, is_prescription_required, stock, expiry_date, image_url, supplier) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      await connection.execute(query, [
        uuidv4(),
        med.name,
        med.brand,
        med.category,
        med.subcategory,
        med.price,
        med.description,
        med.dosage,
        JSON.stringify(med.side_effects || []),
        JSON.stringify(med.interactions || []),
        med.requires_prescription ? 1 : 0,
        med.stock,
        med.expiry_date,
        med.image_url,
        med.supplier,
      ]);
    }

    console.log("Done! All medicines seeded into Aiven MySQL successfully.");
    await connection.end();
    process.exit();
  } catch (err) {
    console.error("Error Seeding:", err.message);
    process.exit(1);
  }
}
seedDatabase();
