const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("./db");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();
    cb(null, `Prescription-${Date.now()}.${ext}`);
  },
});
const upload = multer({ storage: storage });
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "https://medicore-three.vercel.app",
    credentials: true,
  }),
);

const JWT_SECRET = process.env.JWT_SECRET || "HS256_SECRET_KEY";

// ─── MIDDLEWARES ───

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ detail: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const [rows] = await db.execute(
      "SELECT id, full_name as name, email, account_type as role FROM users WHERE id = ?",
      [decoded.user_id],
    );
    if (rows.length === 0)
      return res.status(401).json({ detail: "User not found" });
    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ detail: "Invalid or expired token" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ detail: "Admin access required" });
  next();
};

// ─── AUTH ROUTES ───

app.post("/api/auth/register", async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  try {
    if (password.length < 8)
      return res
        .status(400)
        .json({ detail: "Password must be at least 8 characters" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      "INSERT INTO users (full_name, email, phone, password, account_type) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone, hashedPassword, role || "patient"],
    );

    const userId = result.insertId;
    const token = jwt.sign(
      { user_id: userId, email, role: role || "patient" },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.status(201).json({
      token,
      user: { id: userId, name, email, phone, role: role || "patient" },
    });
  } catch (err) {
    res.status(400).json({
      detail:
        err.code === "ER_DUP_ENTRY" ? "Email already registered" : err.message,
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ detail: "Invalid credentials" });
    }

    const token = jwt.sign(
      { user_id: user.id, email: user.email, role: user.account_type },
      JWT_SECRET,
    );
    res.json({
      token,
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.account_type,
      },
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;

  console.log("Searching for email:", email);

  if (!email) return res.status(400).json({ detail: "Email is required" });

  try {
    const [rows] = await db.execute(
      "SELECT id, full_name FROM users WHERE LOWER(email) = LOWER(?)",
      [email.trim()],
    );

    console.log("Database results:", rows);

    if (rows.length === 0) {
      return res.status(404).json({
        detail: "This email is not registered. Please register first.",
        not_registered: true,
      });
    }

    const resetToken = jwt.sign(
      {
        user_id: rows[0].id,
        email: email.trim().toLowerCase(),
        purpose: "password_reset",
      },
      JWT_SECRET,
      { expiresIn: "15m" },
    );

    res.json({
      message: "Email verified!",
      demo_token: resetToken,
      name: rows[0].full_name,
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ detail: err.message });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  const { email, newPassword, resetToken } = req.body;

  try {
    const decoded = jwt.verify(resetToken, JWT_SECRET);
    if (decoded.email !== email) {
      return res.status(401).json({ detail: "Invalid reset session" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ detail: "Password must be at least 8 characters" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await db.execute(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, email],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ detail: "Update failed, user not found" });
    }

    res.json({ message: "Password reset successful! Redirecting to login..." });
  } catch (err) {
    res.status(401).json({ detail: "Session expired, please try again." });
  }
});

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, full_name AS name, email, phone, account_type AS role FROM users WHERE id = ?",
      [req.user.id],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/recommendations/popular", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM medicines LIMIT 8");
    res.json({
      recommendations: rows,
      type: "popular",
    });
  } catch (err) {
    console.error("Popular Recs Error:", err.message);
    res.status(500).json({ detail: err.message });
  }
});

app.get("/api/recommendations", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM medicines ORDER BY LIMIT 4");
    res.json({
      recommendations: rows,
      type: "personalized",
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.get("/api/prescriptions", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM prescriptions WHERE user_id = ? ORDER BY uploaded_at DESC",
      [req.user.id],
    );
    res.json({ prescriptions: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post(
  "/api/prescriptions/upload",
  authenticateToken,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ detail: "No file selected" });

      const { filename } = req.file;
      const userId = req.user.id;
      const pId = crypto.randomUUID();

      const query =
        "INSERT INTO prescriptions (id, user_id, filename, status) VALUES (?, ?, ?, ?)";
      const params = [pId, userId, filename, "pending"];

      await db.execute(query, params);

      console.log("Prescription Uploaded & Saved to DB!");
      res.json({
        message: "Upload successful",
        id: pId,
        filename: filename,
      });
    } catch (err) {
      console.error("DB ERROR:", err.message);
      res.status(500).json({ detail: "Database Error: " + err.message });
    }
  },
);

app.put("/api/auth/update", authenticateToken, async (req, res) => {
  const { name, phone, password } = req.body;
  const userId = req.user.id;

  try {
    let query = "UPDATE users SET full_name = ?, phone = ? WHERE id = ?";
    let params = [name, phone, userId];

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      query =
        "UPDATE users SET full_name = ?, phone = ?, password = ? WHERE id = ?";
      params = [name, phone, hashedPassword, userId];
    }

    await db.execute(query, params);
    res.json({ success: true, message: "Profile updated!" });
  } catch (err) {
    res.status(500).json({ message: "Database update error" });
  }
});

// ─── MEDICINE ROUTES ───
app.get("/api/medicines", async (req, res) => {
  try {
    let {
      category,
      subcategory,
      search,
      sort_by,
      min_price,
      max_price,
      page = 1,
      limit = 20,
    } = req.query;

    let sql = "SELECT * FROM medicines WHERE 1=1";
    let params = [];

    if (category) {
      sql += " AND category = ?";
      params.push(category);
    }
    if (subcategory) {
      sql += " AND subcategory = ?";
      params.push(subcategory);
    }
    if (search) {
      sql += " AND (name LIKE ? OR brand LIKE ? OR description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (min_price) {
      sql += " AND price >= ?";
      params.push(min_price);
    }
    if (max_price) {
      sql += " AND price <= ?";
      params.push(max_price);
    }

    const limitNum = parseInt(limit);
    const offsetNum = (parseInt(page) - 1) * limitNum;

    const [medicines] = await db.execute(
      `${sql} ORDER BY ${sort_by || "name"} LIMIT ${limitNum} OFFSET ${offsetNum}`,
      params,
    );

    const [total] = await db.execute(
      "SELECT COUNT(*) as count FROM medicines",
      [],
    );

    res.json({
      medicines,
      total: total[0].count,
      page: parseInt(page),
      pages: Math.ceil(total[0].count / limitNum),
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.get("/api/medicines/categories", async (req, res) => {
  const [cats] = await db.execute("SELECT DISTINCT category FROM medicines");
  const [subcats] = await db.execute(
    "SELECT DISTINCT subcategory FROM medicines",
  );
  res.json({
    categories: cats.map((c) => c.category),
    subcategories: subcats.map((s) => s.subcategory),
  });
});

app.get("/api/medicines/:id", async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM medicines WHERE id = ?", [
    req.params.id,
  ]);
  if (rows.length === 0)
    return res.status(404).json({ detail: "Medicine not found" });
  res.json(rows[0]);
});

// ─── CART ROUTES ───

app.get("/api/cart", authenticateToken, async (req, res) => {
  try {
    const [items] = await db.execute(
      `SELECT c.*, m.name, m.price, m.image_url, m.brand, m.is_prescription_required 
       FROM carts c 
       JOIN medicines m ON c.medicine_id = m.id 
       WHERE c.user_id = ?`,
      [req.user.id],
    );

    const total = items.reduce(
      (sum, i) => sum + Number(i.price) * i.quantity,
      0,
    );

    res.json({ items, total: total.toFixed(2) });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});
app.post("/api/cart/add", authenticateToken, async (req, res) => {
  const { medicine_id, quantity } = req.body;
  const userId = req.user.id;

  try {
    const [medData] = await db.execute(
      "SELECT stock FROM medicines WHERE id = ?",
      [medicine_id],
    );
    const [cartData] = await db.execute(
      "SELECT quantity FROM carts WHERE user_id = ? AND medicine_id = ?",
      [userId, medicine_id],
    );

    if (medData.length === 0)
      return res.status(404).json({ detail: "Medicine not found" });

    const currentInCart = cartData.length > 0 ? cartData[0].quantity : 0;
    const totalRequested = currentInCart + quantity;

    if (medData[0].stock < totalRequested) {
      return res.status(400).json({ detail: "Insufficient stock available" });
    }
    await db.execute(
      "INSERT INTO carts (user_id, medicine_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?",
      [userId, medicine_id, quantity, quantity],
    );

    res.json({ message: "Cart updated successfully" });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

app.delete("/api/cart/clear", authenticateToken, async (req, res) => {
  await db.execute("DELETE FROM carts WHERE user_id = ?", [req.user.id]);
  res.json({ message: "Cart cleared" });
});
// --- Cart Update Route ---
app.put(
  "/api/cart/update/:medicine_id",
  authenticateToken,
  async (req, res) => {
    const { quantity } = req.body;
    const { medicine_id } = req.params;
    const user_id = req.user.id;

    try {
      await db.execute(
        "UPDATE carts SET quantity = ? WHERE user_id = ? AND medicine_id = ?",
        [quantity, user_id, medicine_id],
      );
      res.json({ message: "Updated" });
    } catch (err) {
      res.status(500).json({ detail: err.message });
    }
  },
);

// --- Cart Remove Route ---
app.delete(
  "/api/cart/remove/:medicine_id",
  authenticateToken,
  async (req, res) => {
    const { medicine_id } = req.params;
    const user_id = req.user.id;

    try {
      await db.execute(
        "DELETE FROM carts WHERE user_id = ? AND medicine_id = ?",
        [user_id, medicine_id],
      );
      res.json({ message: "Removed" });
    } catch (err) {
      res.status(500).json({ detail: err.message });
    }
  },
);
// ─── ORDER ROUTES ───
app.post("/api/orders", authenticateToken, async (req, res) => {
  const { payment_method, shipping_address, prescription_id } = req.body;
  const orderId = crypto.randomUUID();
  const userId = req.user.id;

  try {
    const [cartItems] = await db.execute(
      "SELECT c.medicine_id, c.quantity, m.price, m.name, m.is_prescription_required FROM carts c JOIN medicines m ON c.medicine_id = m.id WHERE c.user_id = ?",
      [userId],
    );

    if (cartItems.length === 0)
      return res.status(400).json({ detail: "Cart empty" });

    const rxRequired = cartItems.some(
      (i) => Number(i.is_prescription_required) === 1,
    );
    if (rxRequired && !prescription_id) {
      return res
        .status(400)
        .json({ detail: "Prescription required for this order." });
    }

    const total = cartItems.reduce(
      (sum, i) => sum + Number(i.price) * i.quantity,
      0,
    );
    const itemsJson = JSON.stringify(cartItems);

    const query = `
      INSERT INTO orders (id, user_id, items, total_amount, shipping_address, payment_method, status, prescription_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.execute(query, [
      orderId,
      userId,
      itemsJson,
      total,
      shipping_address,
      payment_method,
      "confirmed",
      prescription_id || null,
    ]);

    await db.execute("DELETE FROM carts WHERE user_id = ?", [userId]);

    res.json({
      success: true,
      order_id: orderId,
      status: "confirmed",
      total: total,
    });
  } catch (err) {
    console.error("Order Error:", err);
    res.status(500).json({ detail: err.message });
  }
});

app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id],
    );

    const formattedOrders = rows.map((order) => {
      let itemsArray = [];
      try {
        itemsArray =
          typeof order.items === "string"
            ? JSON.parse(order.items)
            : order.items;
      } catch (e) {
        itemsArray = [];
      }

      return {
        ...order,
        items: itemsArray,
        total_amount: parseFloat(order.total_amount) || 0,
      };
    });

    res.json({ orders: formattedOrders });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});
app.post("/api/medicines", authenticateToken, isAdmin, async (req, res) => {
  const {
    name,
    brand,
    category,
    subcategory,
    price,
    description,
    dosage,
    side_effects,
    interactions,
    stock,
    is_prescription_required,
    expiry_date,
    image_url,
    supplier,
  } = req.body;

  const medicineId = crypto.randomUUID();

  try {
    const sideEffectsStr = Array.isArray(side_effects)
      ? side_effects.join(", ")
      : side_effects || "";
    const interactionsStr = Array.isArray(interactions)
      ? interactions.join(", ")
      : interactions || "";

    const formattedExpiry = expiry_date || null;

    const query = `
      INSERT INTO medicines (
        id, name, brand, category, subcategory, price, 
        description, dosage, side_effects, interactions, 
        stock, is_prescription_required, expiry_date, image_url, supplier
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      medicineId,
      name,
      brand,
      category,
      subcategory,
      parseFloat(price) || 0.0,
      description,
      dosage,
      sideEffectsStr,
      interactionsStr,
      parseInt(stock) || 0,
      is_prescription_required ? 1 : 0,
      formattedExpiry,
      image_url,
      supplier,
    ];

    await db.execute(query, params);
    res.status(201).json({
      success: true,
      message: "Medicine added successfully!",
      id: medicineId,
    });
  } catch (err) {
    console.error("Add Medicine Error:", err);
    res.status(500).json({ detail: err.message });
  }
});

// --- Update Existing Medicine (Admin Only) ---
app.put("/api/medicines/:id", authenticateToken, isAdmin, async (req, res) => {
  const medicineId = req.params.id;
  const data = req.body;

  try {
    const sideEffectsStr = Array.isArray(data.side_effects)
      ? data.side_effects.join(", ")
      : data.side_effects || "";

    const interactionsStr = Array.isArray(data.interactions)
      ? data.interactions.join(", ")
      : data.interactions || "";

    const query = `
      UPDATE medicines SET 
        name=?, brand=?, category=?, subcategory=?, price=?, 
        description=?, dosage=?, side_effects=?, interactions=?, 
        stock=?, is_prescription_required=?, expiry_date=?, image_url=?, supplier=?
      WHERE id=?
    `;

    const params = [
      data.name,
      data.brand,
      data.category,
      data.subcategory,
      parseFloat(data.price) || 0.0,
      data.description,
      data.dosage,
      sideEffectsStr,
      interactionsStr,
      parseInt(data.stock) || 0,
      data.is_prescription_required ? 1 : 0,
      data.expiry_date || null,
      data.image_url,
      data.supplier,
      medicineId,
    ];

    const [result] = await db.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ detail: "Medicine not found" });
    }

    res.json({ success: true, message: "Medicine updated successfully!" });
  } catch (err) {
    console.error("Update Medicine Error:", err);
    res.status(500).json({ detail: err.message });
  }
});

// --- Delete Medicine (Admin Only) ---
app.delete(
  "/api/medicines/:id",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    const medicineId = req.params.id;
    try {
      const [result] = await db.execute("DELETE FROM medicines WHERE id = ?", [
        medicineId,
      ]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ detail: "Medicine not found" });
      }
      res.json({ success: true, message: "Medicine deleted successfully" });
    } catch (err) {
      res.status(500).json({ detail: err.message });
    }
  },
);

app.put("/api/users/:id/role", authenticateToken, isAdmin, async (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;

  try {
    const [result] = await db.execute(
      "UPDATE users SET account_type = ? WHERE id = ?",
      [role, userId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ detail: "User not found" });
    }

    res.json({ success: true, message: "Role updated successfully" });
  } catch (err) {
    console.error("Backend Role Error:", err);
    res.status(500).json({ detail: err.message });
  }
});
app.get("/api/admin/stats", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [
      [meds],
      [orders],
      [users],
      [lowStock],
      [pendingRx],
      [expiring],
      [recentOrders],
    ] = await Promise.all([
      db.execute("SELECT COUNT(*) as count FROM medicines"),
      db.execute(
        "SELECT COUNT(*) as count, IFNULL(SUM(total_amount), 0) as revenue FROM orders",
      ),
      db.execute("SELECT COUNT(*) as count FROM users"),
      db.execute("SELECT COUNT(*) as count FROM medicines WHERE stock <= 10"),
      db.execute(
        "SELECT COUNT(*) as count FROM prescriptions WHERE status = 'pending'",
      ),
      db.execute(
        "SELECT COUNT(*) as count FROM medicines WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL 3 MONTH)",
      ),
      db.execute(`
        SELECT o.id, u.full_name as user_name, o.total_amount as total, o.status, o.created_at 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC LIMIT 10
      `),
    ]);

    res.json({
      total_medicines: meds[0].count,
      total_orders: orders[0].count,
      total_users: users[0].count,
      total_revenue: parseFloat(orders[0].revenue),
      low_stock: lowStock[0].count,
      pending_prescriptions: pendingRx[0].count,
      expiring_medicines: expiring[0].count,
      recent_orders: recentOrders,
    });
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ detail: err.message });
  }
});
app.get("/api/admin/users", authenticateToken, isAdmin, async (req, res) => {
  const [rows] = await db.execute(
    "SELECT id, full_name as name, email, phone, account_type as role FROM users",
  );
  res.json({ users: rows });
});

app.get(
  "/api/orders/all/admin",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const [rows] = await db.execute(`
      SELECT o.id, u.full_name as user_name, o.total_amount as total, 
             o.status, o.payment_method, o.items, o.created_at
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

      const formattedOrders = rows.map((order) => ({
        ...order,
        items:
          typeof order.items === "string"
            ? JSON.parse(order.items)
            : order.items,
      }));

      res.json({ orders: formattedOrders });
    } catch (err) {
      res.status(500).json({ detail: err.message });
    }
  },
);
// --- Update Order Status (Admin Only) ---
app.put(
  "/api/orders/:id/status",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;

    try {
      const [result] = await db.execute(
        "UPDATE orders SET status = ? WHERE id = ?",
        [status, orderId],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ detail: "Order not found" });
      }

      res.json({ success: true, message: "Order status updated to " + status });
    } catch (err) {
      console.error("Update Order Status Error:", err);
      res.status(500).json({ detail: err.message });
    }
  },
);
app.get(
  "/api/prescriptions/all",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const [rows] = await db.execute(`
      SELECT p.id, p.user_id, p.filename, p.status, p.uploaded_at, u.full_name as user_name 
      FROM prescriptions p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.uploaded_at DESC
    `);
      res.json({ prescriptions: rows });
    } catch (err) {
      res.status(500).json({ detail: err.message });
    }
  },
);
// Backend: Specific route for Verify/Reject
app.put(
  "/api/prescriptions/:id/verify",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    const { status } = req.body;
    const prescriptionId = req.params.id;

    try {
      const [result] = await db.execute(
        "UPDATE prescriptions SET status = ? WHERE id = ?",
        [status, prescriptionId],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ detail: "Prescription not found" });
      }

      res.json({ success: true, message: "Status updated" });
    } catch (err) {
      res.status(500).json({ detail: err.message });
    }
  },
);
// 3. Admin Alerts (Low Stock & Expiring)
app.get("/api/admin/alerts", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [lowStock] = await db.execute(
      "SELECT id, name, brand, stock FROM medicines WHERE stock <= 10",
    );
    const [expiring] = await db.execute(
      "SELECT id, name, brand, expiry_date FROM medicines WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL 3 MONTH)",
    );
    res.json({ low_stock: lowStock, expiring: expiring });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});
// 4. Admin Reports (Sales & Status)
app.get("/api/admin/reports", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [statusStats] = await db.execute(
      "SELECT status as _id, COUNT(*) as count FROM orders GROUP BY status",
    );

    const [inventory] = await db.execute(
      "SELECT name, stock, category FROM medicines",
    );

    const [orders] = await db.execute("SELECT items FROM orders");
    const productSales = {};

    orders.forEach((order) => {
      let items =
        typeof order.items === "string" ? JSON.parse(order.items) : order.items;
      if (Array.isArray(items)) {
        items.forEach((item) => {
          const name = item.name || "Unknown";

          if (!productSales[name])
            productSales[name] = { name: name, unitsSold: 0, revenue: 0 };
          productSales[name].unitsSold += Number(item.quantity || 0);
          productSales[name].revenue +=
            Number(item.price || 0) * Number(item.quantity || 0);
        });
      }
    });

    const salesByProduct = Object.values(productSales)
      .map((item) => ({
        name: item.name,
        value: item.unitsSold,
        revenue: item.revenue,
      }))
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    res.json({
      orders_by_status: statusStats,
      inventory: inventory,
      sales_by_product: salesByProduct,
    });
  } catch (err) {
    console.error("Reports Error:", err);
    res.status(500).json({ detail: err.message });
  }
});

// 404 Handler
app.use((req, res) => res.status(404).json({ detail: "Route not found" }));

const PORT = 5002;
app.listen(PORT, () =>
  console.log(`MediCore Pro Server running on port ${PORT}`),
);
