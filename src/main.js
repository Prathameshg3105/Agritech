import Database from "@tauri-apps/plugin-sql";
let db;

async function initDatabase() {
  try {
    db = await Database.load("sqlite:agritech.db");

    console.log("AgriTech SQLite database connected successfully.");

    // Customers
    await db.execute(`
            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                village TEXT,
                phone TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

    // Bills
    await db.execute(`
            CREATE TABLE IF NOT EXISTS bills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bill_number INTEGER NOT NULL UNIQUE,
                customer_id INTEGER,
                bill_date TEXT NOT NULL,
                total_amount REAL NOT NULL DEFAULT 0,
                cash_amount REAL NOT NULL DEFAULT 0,
                upi_amount REAL NOT NULL DEFAULT 0,
                paid_amount REAL NOT NULL DEFAULT 0,
                due_amount REAL NOT NULL DEFAULT 0,
                payment_method TEXT,
                notes TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id)
            )
        `);

    // Bill Items
    await db.execute(`
            CREATE TABLE IF NOT EXISTS bill_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bill_id INTEGER NOT NULL,
                product_name TEXT NOT NULL,
                producer_company TEXT,
                batch_number TEXT,
                expiry_date TEXT,
                packing_size TEXT,
                quantity REAL NOT NULL DEFAULT 0,
                rate REAL NOT NULL DEFAULT 0,
                total_amount REAL NOT NULL DEFAULT 0,
                FOREIGN KEY (bill_id) REFERENCES bills(id)
            )
        `);

    // Payments
    await db.execute(`
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER NOT NULL,
                bill_id INTEGER,
                amount REAL NOT NULL,
                payment_method TEXT,
                payment_date TEXT NOT NULL,
                notes TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(id),
                FOREIGN KEY (bill_id) REFERENCES bills(id)
            )
        `);

    console.log("AgriTech database tables created successfully.");

  } catch (error) {
    console.error("Database initialization failed:", error);
  }
}


const pageTitle = document.getElementById("page-title");
const pageSubtitle = document.getElementById("page-subtitle");
const currentDate = document.getElementById("current-date");
const pageContent = document.getElementById("page-content");

const navItems = document.querySelectorAll(".nav-item");

const pages = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Welcome to AgriTech"
  },

  "new-bill": {
    title: "New Bill",
    subtitle: "Create a new customer bill"
  },

  customers: {
    title: "Customers",
    subtitle: "Manage your farmers and customers"
  },

  "bill-history": {
    title: "Bill History",
    subtitle: "View and manage previous bills"
  },

  payments: {
    title: "Pending Payments",
    subtitle: "Track customer outstanding payments"
  },

  products: {
    title: "Products",
    subtitle: "Manage your shop products"
  },

  reports: {
    title: "Reports",
    subtitle: "View sales and payment reports"
  },

  settings: {
    title: "Settings",
    subtitle: "Manage your shop settings"
  }
};


// =========================
// DATE
// =========================

const today = new Date();

currentDate.textContent = today.toLocaleDateString("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});


// =========================
// DASHBOARD
// =========================

function showDashboard() {

  pageContent.innerHTML = `
    <div class="dashboard-page">

      <div class="welcome-card">

        <div>
          <h2>Good day! 👋</h2>

          <p>
            Manage your shop, create bills and track customer payments.
          </p>
        </div>

        <button class="primary-button" id="create-bill-button">
          + Create New Bill
        </button>

      </div>


      <div class="stats-grid">

        <div class="stat-card">
          <div class="stat-icon">₹</div>

          <div>
            <span>Today's Sales</span>
            <strong>₹0.00</strong>
          </div>
        </div>


        <div class="stat-card">
          <div class="stat-icon">▤</div>

          <div>
            <span>Today's Bills</span>
            <strong>0</strong>
          </div>
        </div>


        <div class="stat-card warning">
          <div class="stat-icon">₹</div>

          <div>
            <span>Pending Payments</span>
            <strong>₹0.00</strong>
          </div>
        </div>


        <div class="stat-card">
          <div class="stat-icon">♙</div>

          <div>
            <span>Customers With Due</span>
            <strong>0</strong>
          </div>
        </div>

      </div>


      <div class="content-card">

        <div class="card-header">

          <div>
            <h3>Recent Bills</h3>
            <p>Your latest transactions</p>
          </div>

          <button class="text-button">
            View All →
          </button>

        </div>


        <div class="empty-state">

          <div class="empty-icon">▤</div>

          <h3>No bills yet</h3>

          <p>
            Create your first bill to see it here.
          </p>

          <button class="primary-button" id="empty-create-bill">
            + Create New Bill
          </button>

        </div>

      </div>

    </div>
  `;


  document
    .getElementById("create-bill-button")
    .addEventListener("click", () => {
      navigateTo("new-bill");
    });


  document
    .getElementById("empty-create-bill")
    .addEventListener("click", () => {
      navigateTo("new-bill");
    });
}


// =========================
// NEW BILL
// =========================

function showNewBill() {

  pageContent.innerHTML = `

    <div class="new-bill-page">

      <!-- BILL HEADER -->

      <div class="bill-header-card">

        <div>
          <h2>New Bill</h2>
          <p>Create a bill for your farmer/customer</p>
        </div>

        <div class="bill-meta">

          <div>
            <span>Bill No.</span>
            <strong>7719</strong>
          </div>

          <div>
            <span>Date</span>
            <strong>${today.toLocaleDateString("en-IN")}</strong>
          </div>

        </div>

      </div>


      <!-- CUSTOMER -->

      <div class="form-card">

        <div class="section-heading">
          <div>
            <h3>Farmer / Customer</h3>
            <p>Select an existing customer or create a new one.</p>
          </div>

          <button class="secondary-button" id="new-customer-button">
            + New Customer
          </button>
        </div>


        <div class="customer-search">
          <input
            type="text"
            placeholder="Search farmer by name, phone or village..."
          />

          <button class="search-button">
            Search
          </button>
        </div>


        <div class="customer-fields">

          <div class="field">
            <label>Farmer Name</label>
            <input
              id="customer-name"
              type="text"
              placeholder="Enter farmer name"
              value="Ramesh Patil"
            />
          </div>


          <div class="field">
            <label>Village</label>
            <input
              id="customer-village"
              type="text"
              placeholder="Enter village"
              value="Jamkhed"
            />
          </div>


          <div class="field">
            <label>Phone Number</label>
            <input
              id="customer-phone"
              type="text"
              placeholder="Enter phone number"
            />
          </div>

        </div>

      </div>


      <!-- PRODUCTS -->

      <div class="form-card">

        <div class="section-heading">

          <div>
            <h3>Items</h3>
            <p>Add products to this bill.</p>
          </div>

          <button class="secondary-button" id="add-item-button">
            + Add Item
          </button>

        </div>


        <div class="product-search">

          <input
            type="text"
            placeholder="Search product by name..."
          />

          <button class="search-button">
            Search
          </button>

        </div>


        <div class="table-wrapper">

          <table class="bill-items-table">

            <thead>

              <tr>
                <th>Sr.</th>
                <th>Particulars</th>
                <th>Producer Company</th>
                <th>Batch No.</th>
                <th>Exp. Date</th>
                <th>Packing Size</th>
                <th>Qty.</th>
                <th>Rate (₹)</th>
                <th>Total (₹)</th>
                <th></th>
              </tr>

            </thead>


            <tbody id="bill-items">

              <tr>

                <td>1</td>

                <td>
                  <input
                    class="table-input"
                    value="Urea"
                  />
                </td>

                <td>
                  <input
                    class="table-input"
                    value="IFFCO"
                  />
                </td>

                <td>
                  <input
                    class="table-input"
                    value="U123"
                  />
                </td>

                <td>
                  <input
                    class="table-input"
                    value="12/2026"
                  />
                </td>

                <td>
                  <input
                    class="table-input"
                    value="50 kg"
                  />
                </td>

                <td>
                  <input
                    class="quantity-input"
                    type="number"
                    value="2"
                    min="1"
                  />
                </td>

                <td>
                  <input
                    class="rate-input"
                    type="number"
                    value="300"
                    min="0"
                  />
                </td>

                <td class="item-total">
                  ₹600.00
                </td>

                <td>
                  <button class="delete-item">
                    ×
                  </button>
                </td>

              </tr>


              <tr>

                <td>2</td>

                <td>
                  <input
                    class="table-input"
                    value="DAP"
                  />
                </td>

                <td>
                  <input
                    class="table-input"
                    value="IFFCO"
                  />
                </td>

                <td>
                  <input
                    class="table-input"
                    value="D456"
                  />
                </td>

                <td>
                  <input
                    class="table-input"
                    value="11/2026"
                  />
                </td>

                <td>
                  <input
                    class="table-input"
                    value="50 kg"
                  />
                </td>

                <td>
                  <input
                    class="quantity-input"
                    type="number"
                    value="1"
                    min="1"
                  />
                </td>

                <td>
                  <input
                    class="rate-input"
                    type="number"
                    value="1350"
                    min="0"
                  />
                </td>

                <td class="item-total">
                  ₹1,350.00
                </td>

                <td>
                  <button class="delete-item">
                    ×
                  </button>
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>


      <!-- PAYMENT + SUMMARY -->

      <div class="bottom-grid">


        <!-- PAYMENT -->

        <div class="form-card">

          <div class="section-heading">

            <div>
              <h3>Payment Method</h3>
              <p>How much has the customer paid?</p>
            </div>

          </div>

          <div class="payment-methods">

            <label class="payment-option selected">
              <input
                type="radio"
                name="payment-method"
                value="cash"
                checked
              />

              <span>💵</span>
              Cash
            </label>


            <label class="payment-option">
              <input
                type="radio"
                name="payment-method"
                value="upi"
              />

              <span>📱</span>
              UPI
            </label>


            <label class="payment-option">
              <input
                type="radio"
                name="payment-method"
                value="both"
              />

              <span>💵📱</span>
              Cash + UPI
            </label>


            <label class="payment-option">
              <input
                type="radio"
                name="payment-method"
                value="pending"
              />

              <span>🧾</span>
              Pending / Credit
            </label>

          </div>


          <div class="payment-inputs">

            <div class="field">
              <label>Cash Amount (₹)</label>

              <input
                id="cash-amount"
                type="number"
                value="1950"
                min="0"
              />
            </div>


            <div class="field">

              <label>UPI Amount (₹)</label>

              <input
                id="upi-amount"
                type="number"
                value="0"
                min="0"
              />

            </div>

          </div>

        </div>


        <!-- SUMMARY -->

        <div class="summary-card">

          <h3>Bill Summary</h3>


          <div class="summary-row">
            <span>Total Amount</span>
            <strong id="bill-total">₹1,950.00</strong>
          </div>


          <div class="summary-row">
            <span>Amount Received</span>
            <strong id="amount-received">₹4,000.00</strong>
          </div>


          <div class="due-box">

            <span>Remaining Due</span>

            <strong id="remaining-due">
              ₹0.00
            </strong>

          </div>


          <p class="due-note">
            Any remaining amount will be added to the customer's outstanding balance.
          </p>

        </div>

      </div>


      <!-- NOTES -->

      <div class="form-card">

        <div class="field">

          <label>Notes / Remarks</label>

          <textarea
            placeholder="Add any note for this bill..."
          ></textarea>

        </div>

      </div>


      <!-- ACTIONS -->

      <div class="bill-actions">

        <button class="secondary-button">
          Clear All
        </button>

        <div>

          <button class="secondary-button">
            Preview Bill
          </button>

          <button class="primary-button" id="save-bill-button">
            Save Bill
          </button>

        </div>

      </div>

    </div>
  `;


  setupBillCalculations();

  document
    .getElementById("save-bill-button")
    .addEventListener("click", saveBill);

  document
    .getElementById("new-customer-button")
    .addEventListener("click", () => {
      document.getElementById("customer-name").value = "";
      document.getElementById("customer-village").value = "";
      document.getElementById("customer-phone").value = "";

      document.getElementById("customer-name").focus();
    });
}


// =========================
// BILL CALCULATIONS
// =========================

function setupBillCalculations() {

  const quantityInputs =
    document.querySelectorAll(".quantity-input");

  const rateInputs =
    document.querySelectorAll(".rate-input");

  const cashInput =
    document.getElementById("cash-amount");

  const upiInput =
    document.getElementById("upi-amount");


  function calculateBill() {

    let total = 0;


    document
      .querySelectorAll("#bill-items tr")
      .forEach((row) => {

        const quantity =
          Number(
            row.querySelector(".quantity-input")?.value || 0
          );

        const rate =
          Number(
            row.querySelector(".rate-input")?.value || 0
          );

        const amount = quantity * rate;

        const totalCell =
          row.querySelector(".item-total");

        if (totalCell) {
          totalCell.textContent =
            `₹${amount.toFixed(2)}`;
        }

        total += amount;

      });


    const cash =
      Number(cashInput.value || 0);

    const upi =
      Number(upiInput.value || 0);

    const received = cash + upi;

    const due = Math.max(total - received, 0);


    document.getElementById("bill-total")
      .textContent = `₹${total.toFixed(2)}`;

    document.getElementById("amount-received")
      .textContent = `₹${received.toFixed(2)}`;

    document.getElementById("remaining-due")
      .textContent = `₹${due.toFixed(2)}`;
  }


  quantityInputs.forEach(input => {
    input.addEventListener("input", calculateBill);
  });


  rateInputs.forEach(input => {
    input.addEventListener("input", calculateBill);
  });


  cashInput.addEventListener("input", calculateBill);
  upiInput.addEventListener("input", calculateBill);


  // Payment method
  document
    .querySelectorAll(".payment-option input")
    .forEach(input => {

      input.addEventListener("change", () => {

        document
          .querySelectorAll(".payment-option")
          .forEach(option => {
            option.classList.remove("selected");
          });

        input
          .closest(".payment-option")
          .classList.add("selected");


        if (input.value === "cash") {

          cashInput.disabled = false;
          upiInput.disabled = true;

          upiInput.value = 0;

        }

        else if (input.value === "upi") {

          cashInput.disabled = true;
          upiInput.disabled = false;

          cashInput.value = 0;

        }

        else if (input.value === "both") {

          cashInput.disabled = false;
          upiInput.disabled = false;

        }

        else if (input.value === "pending") {

          cashInput.value = 0;
          upiInput.value = 0;

          cashInput.disabled = true;
          upiInput.disabled = true;

        }

        calculateBill();
      });

    });


  // Delete item
  document
    .querySelectorAll(".delete-item")
    .forEach(button => {

      button.addEventListener("click", () => {

        button.closest("tr").remove();

        calculateBill();

      });

    });


  calculateBill();
}
// =========================
// SAVE BILL
// =========================

async function saveBill() {
  if (!db) {
    alert("Database is not ready. Please try again.");
    return;
  }

  try {
    const customerName =
      document.getElementById("customer-name").value.trim();

    const village =
      document.getElementById("customer-village").value.trim();

    const phone =
      document.getElementById("customer-phone").value.trim();

    if (!customerName) {
      alert("Please enter the farmer/customer name.");
      return;
    }

    const totalAmount =
      Number(
        document
          .getElementById("bill-total")
          .textContent
          .replace(/[₹,]/g, "")
      ) || 0;

    const cashAmount =
      Number(document.getElementById("cash-amount").value) || 0;

    const upiAmount =
      Number(document.getElementById("upi-amount").value) || 0;

    const paidAmount = cashAmount + upiAmount;

    const dueAmount = Math.max(totalAmount - paidAmount, 0);

    const paymentMethod =
      document.querySelector(
        'input[name="payment-method"]:checked'
      )?.value || "cash";

    const notes =
      document.querySelector("textarea")?.value.trim() || "";

    // --------------------------------
    // 1. Find or create customer
    // --------------------------------

    let customerResult;

    if (phone) {
      customerResult = await db.select(
        `SELECT id FROM customers WHERE phone = ? LIMIT 1`,
        [phone]
      );
    } else {
      customerResult = await db.select(
        `SELECT id FROM customers
                 WHERE name = ? AND village = ?
                 LIMIT 1`,
        [customerName, village]
      );
    }

    let customerId;

    if (customerResult.length > 0) {

      customerId = customerResult[0].id;

      await db.execute(
        `UPDATE customers
                 SET name = ?, village = ?, phone = ?
                 WHERE id = ?`,
        [customerName, village, phone, customerId]
      );

    } else {

      const customerInsert = await db.execute(
        `INSERT INTO customers (name, village, phone)
                 VALUES (?, ?, ?)`,
        [customerName, village, phone]
      );

      customerId = customerInsert.lastInsertId;
    }

    // --------------------------------
    // 2. Generate next bill number
    // --------------------------------

    const lastBill = await db.select(
      `SELECT MAX(bill_number) AS last_number
             FROM bills`
    );

    const billNumber =
      (lastBill[0]?.last_number || 0) + 1;

    // --------------------------------
    // 3. Save bill
    // --------------------------------

    const billDate =
      new Date().toISOString().split("T")[0];

    const billInsert = await db.execute(
      `INSERT INTO bills (
                bill_number,
                customer_id,
                bill_date,
                total_amount,
                cash_amount,
                upi_amount,
                paid_amount,
                due_amount,
                payment_method,
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        billNumber,
        customerId,
        billDate,
        totalAmount,
        cashAmount,
        upiAmount,
        paidAmount,
        dueAmount,
        paymentMethod,
        notes
      ]
    );

    const billId = billInsert.lastInsertId;

    // --------------------------------
    // 4. Save bill items
    // --------------------------------

    const rows =
      document.querySelectorAll("#bill-items tr");

    for (const row of rows) {

      const productName =
        row.querySelector(".table-input")?.value.trim() || "";

      const inputs =
        row.querySelectorAll(".table-input");

      const producerCompany =
        inputs[1]?.value.trim() || "";

      const batchNumber =
        inputs[2]?.value.trim() || "";

      const expiryDate =
        inputs[3]?.value.trim() || "";

      const packingSize =
        inputs[4]?.value.trim() || "";

      const quantity =
        Number(
          row.querySelector(".quantity-input")?.value
        ) || 0;

      const rate =
        Number(
          row.querySelector(".rate-input")?.value
        ) || 0;

      const itemTotal = quantity * rate;

      if (!productName) {
        continue;
      }

      await db.execute(
        `INSERT INTO bill_items (
                    bill_id,
                    product_name,
                    producer_company,
                    batch_number,
                    expiry_date,
                    packing_size,
                    quantity,
                    rate,
                    total_amount
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          billId,
          productName,
          producerCompany,
          batchNumber,
          expiryDate,
          packingSize,
          quantity,
          rate,
          itemTotal
        ]
      );
    }

    // --------------------------------
    // 5. Record payment
    // --------------------------------

    if (paidAmount > 0) {

      await db.execute(
        `INSERT INTO payments (
                    customer_id,
                    bill_id,
                    amount,
                    payment_method,
                    payment_date,
                    notes
                )
                VALUES (?, ?, ?, ?, ?, ?)`,
        [
          customerId,
          billId,
          paidAmount,
          paymentMethod,
          billDate,
          "Payment received with bill"
        ]
      );
    }

    console.log(
      `Bill ${billNumber} saved successfully.`
    );

    alert(
      `Bill #${billNumber} saved successfully!`
    );

  } catch (error) {

    console.error("Failed to save bill:", error);

    alert(
      "Failed to save bill. Check the console for details."
    );
  }
}
// =========================
// BILL HISTORY
// =========================

async function showBillHistory() {
  if (!db) {
    pageContent.innerHTML = `
            <div class="content-card">
                <h2>Database not ready</h2>
                <p>Please try again in a moment.</p>
            </div>
        `;
    return;
  }

  try {
    const bills = await db.select(`
            SELECT
                b.bill_number,
                b.bill_date,
                c.name AS customer_name,
                c.village,
                b.total_amount,
                b.paid_amount,
                b.due_amount
            FROM bills b
            LEFT JOIN customers c
                ON b.customer_id = c.id
            ORDER BY b.id DESC
        `);

    if (bills.length === 0) {
      pageContent.innerHTML = `
                <div class="content-card">
                    <div class="empty-state">
                        <div class="empty-icon">▤</div>
                        <h3>No bills yet</h3>
                        <p>Your saved bills will appear here.</p>
                    </div>
                </div>
            `;
      return;
    }

    pageContent.innerHTML = `
            <div class="content-card">

                <div class="card-header">
                    <div>
                        <h3>Bill History</h3>
                        <p>View all saved customer bills</p>
                    </div>

                    <strong>${bills.length} Bill${bills.length !== 1 ? "s" : ""}</strong>
                </div>

                <div class="table-wrapper">

                    <table class="bill-items-table">

                        <thead>
                            <tr>
                                <th>Bill No.</th>
                                <th>Date</th>
                                <th>Farmer</th>
                                <th>Village</th>
                                <th>Total</th>
                                <th>Paid</th>
                                <th>Due</th>
                            </tr>
                        </thead>

                        <tbody>

                            ${bills.map(bill => `
                                <tr>
                                    <td>#${bill.bill_number}</td>

                                    <td>
                                        ${formatBillDate(bill.bill_date)}
                                    </td>

                                    <td>
                                        ${bill.customer_name || "-"}
                                    </td>

                                    <td>
                                        ${bill.village || "-"}
                                    </td>

                                    <td>
                                        ₹${Number(bill.total_amount).toFixed(2)}
                                    </td>

                                    <td>
                                        ₹${Number(bill.paid_amount).toFixed(2)}
                                    </td>

                                    <td>
                                        ₹${Number(bill.due_amount).toFixed(2)}
                                    </td>
                                </tr>
                            `).join("")}

                        </tbody>

                    </table>

                </div>

            </div>
        `;

  } catch (error) {

    console.error("Failed to load bill history:", error);

    pageContent.innerHTML = `
            <div class="content-card">
                <h2>Unable to load Bill History</h2>
                <p>Check the console for details.</p>
            </div>
        `;
  }
}


// Format YYYY-MM-DD → DD/MM/YYYY

function formatBillDate(dateString) {
  if (!dateString) return "-";

  const parts = dateString.split("-");

  if (parts.length !== 3) {
    return dateString;
  }

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
// =========================
// CUSTOMERS
// =========================

async function showCustomers() {
  if (!db) {
    pageContent.innerHTML = `
            <div class="content-card">
                <h2>Database not ready</h2>
                <p>Please try again in a moment.</p>
            </div>
        `;
    return;
  }

  try {
    const customers = await db.select(`
            SELECT
                c.id,
                c.name,
                c.village,
                c.phone,
                COUNT(DISTINCT b.id) AS bill_count,
                COALESCE(SUM(b.due_amount), 0) AS outstanding
            FROM customers c
            LEFT JOIN bills b
                ON c.id = b.customer_id
            GROUP BY c.id
            ORDER BY c.name ASC
        `);

    if (customers.length === 0) {
      pageContent.innerHTML = `
                <div class="content-card">
                    <div class="empty-state">
                        <div class="empty-icon">♙</div>
                        <h3>No customers yet</h3>
                        <p>Customers will appear here after you create bills.</p>
                    </div>
                </div>
            `;
      return;
    }

    pageContent.innerHTML = `
            <div class="content-card">

                <div class="card-header">
                    <div>
                        <h3>Customers</h3>
                        <p>Your farmers and customers</p>
                    </div>

                    <strong>
                        ${customers.length}
                        Customer${customers.length !== 1 ? "s" : ""}
                    </strong>
                </div>

                <div class="table-wrapper">

                    <table class="bill-items-table">

                        <thead>
                            <tr>
                                <th>Farmer Name</th>
                                <th>Village</th>
                                <th>Phone</th>
                                <th>Bills</th>
                                <th>Outstanding</th>
                            </tr>
                        </thead>

                        <tbody>

                            ${customers.map(customer => `
                                <tr>

                                    <td>
                                        ${customer.name || "-"}
                                    </td>

                                    <td>
                                        ${customer.village || "-"}
                                    </td>

                                    <td>
                                        ${customer.phone || "-"}
                                    </td>

                                    <td>
                                        ${customer.bill_count}
                                    </td>

                                    <td>
                                        ₹${Number(customer.outstanding).toFixed(2)}
                                    </td>

                                </tr>
                            `).join("")}

                        </tbody>

                    </table>

                </div>

            </div>
        `;

  } catch (error) {

    console.error("Failed to load customers:", error);

    pageContent.innerHTML = `
            <div class="content-card">
                <h2>Unable to load Customers</h2>
                <p>Check the console for details.</p>
            </div>
        `;
  }
}

// =========================
// PENDING PAYMENTS
// =========================

async function showPendingPayments() {
  if (!db) {
    pageContent.innerHTML = `
            <div class="content-card">
                <h2>Database not ready</h2>
                <p>Please try again in a moment.</p>
            </div>
        `;
    return;
  }

  try {
    const customers = await db.select(`
            SELECT
                c.id,
                c.name,
                c.village,
                c.phone,
                COALESCE(SUM(b.due_amount), 0) AS outstanding
            FROM customers c
            LEFT JOIN bills b
                ON c.id = b.customer_id
            GROUP BY c.id
            HAVING outstanding > 0
            ORDER BY outstanding DESC
        `);

    const totalPending = customers.reduce(
      (sum, customer) => sum + Number(customer.outstanding || 0),
      0
    );

    if (customers.length === 0) {
      pageContent.innerHTML = `
                <div class="content-card">

                    <div class="empty-state">
                        <div class="empty-icon">✓</div>

                        <h3>No pending payments</h3>

                        <p>
                            All customer bills are currently paid.
                        </p>
                    </div>

                </div>
            `;
      return;
    }

    pageContent.innerHTML = `
            <div class="content-card">

                <div class="card-header">

                    <div>
                        <h3>Pending Payments</h3>
                        <p>Customers with outstanding balances</p>
                    </div>

                    <strong>
                        Total Due: ₹${totalPending.toFixed(2)}
                    </strong>

                </div>

                <div class="table-wrapper">

                    <table class="bill-items-table">

                        <thead>
                            <tr>
                                <th>Farmer Name</th>
                                <th>Village</th>
                                <th>Phone</th>
                                <th>Outstanding</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            ${customers.map(customer => `
                                <tr>

                                    <td>
                                        ${customer.name || "-"}
                                    </td>

                                    <td>
                                        ${customer.village || "-"}
                                    </td>

                                    <td>
                                        ${customer.phone || "-"}
                                    </td>

                                    <td>
                                        ₹${Number(customer.outstanding).toFixed(2)}
                                    </td>

                                    <td>
                                        <button
                                            class="secondary-button receive-payment-button"
                                            data-customer-id="${customer.id}"
                                            data-customer-name="${customer.name}"
                                        >
                                            Receive Payment
                                        </button>
                                    </td>

                                </tr>
                            `).join("")}

                        </tbody>

                    </table>

                </div>

            </div>
        `;

  } catch (error) {

    console.error(
      "Failed to load pending payments:",
      error
    );

    pageContent.innerHTML = `
            <div class="content-card">
                <h2>Unable to load Pending Payments</h2>
                <p>Check the console for details.</p>
            </div>
        `;
  }
}
// =========================
// RECEIVE PAYMENT
// =========================

async function receivePayment(customerId, customerName) {
    try {
        const bills = await db.select(`
            SELECT
                id,
                bill_number,
                due_amount
            FROM bills
            WHERE customer_id = ?
              AND due_amount > 0
            ORDER BY id ASC
        `, [customerId]);

        if (bills.length === 0) {
            alert("This customer has no pending payment.");
            return;
        }

        const outstanding = bills.reduce(
            (sum, bill) => sum + Number(bill.due_amount),
            0
        );

        const amountInput = prompt(
            `${customerName} currently owes ₹${outstanding.toFixed(2)}.\n\nEnter payment amount:`
        );

        if (amountInput === null) {
            return;
        }

        const amount = Number(amountInput);

        if (!Number.isFinite(amount) || amount <= 0) {
            alert("Please enter a valid payment amount.");
            return;
        }

        if (amount > outstanding) {
            alert(
                `Payment cannot exceed the outstanding amount of ₹${outstanding.toFixed(2)}.`
            );
            return;
        }

        let paymentMethod = prompt(
            "Payment method:\n\nEnter Cash or UPI",
            "Cash"
        );

        if (paymentMethod === null) {
            return;
        }

        paymentMethod = paymentMethod.trim().toLowerCase();

        if (paymentMethod !== "cash" && paymentMethod !== "upi") {
            alert("Please enter either Cash or UPI.");
            return;
        }

        const paymentDate =
            new Date().toISOString().split("T")[0];

        let remainingPayment = amount;

        // Apply the payment to the oldest pending bills first.
        for (const bill of bills) {

            if (remainingPayment <= 0) {
                break;
            }

            const billDue = Number(bill.due_amount);

            const allocatedAmount =
                Math.min(remainingPayment, billDue);

            const newDue =
                billDue - allocatedAmount;

            const billPayment =
                await db.select(`
                    SELECT paid_amount
                    FROM bills
                    WHERE id = ?
                `, [bill.id]);

            const currentPaid =
                Number(billPayment[0]?.paid_amount || 0);

            const newPaid =
                currentPaid + allocatedAmount;

            await db.execute(`
                UPDATE bills
                SET
                    paid_amount = ?,
                    due_amount = ?
                WHERE id = ?
            `, [
                newPaid,
                newDue,
                bill.id
            ]);

            await db.execute(`
                INSERT INTO payments (
                    customer_id,
                    bill_id,
                    amount,
                    payment_method,
                    payment_date,
                    notes
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                customerId,
                bill.id,
                allocatedAmount,
                paymentMethod.toUpperCase(),
                paymentDate,
                "Payment received against pending bill"
            ]);

            remainingPayment -= allocatedAmount;
        }

        alert(
            `₹${amount.toFixed(2)} received from ${customerName}.`
        );

        await showPendingPayments();

    } catch (error) {

        console.error(
            "Failed to receive payment:",
            error
        );

        alert(
            "Failed to record payment. Check the console for details."
        );
    }
}
// =========================
// NAVIGATION
// =========================

function navigateTo(page) {

  navItems.forEach(nav => {

    nav.classList.toggle(
      "active",
      nav.dataset.page === page
    );

  });


  pageTitle.textContent =
    pages[page]?.title || "AgriTech";

  pageSubtitle.textContent =
    pages[page]?.subtitle || "";


  if (page === "dashboard") {

    showDashboard();

  }

  else if (page === "new-bill") {

    showNewBill();

  }
  else if (page === "bill-history") {

    showBillHistory();

  }
  else if (page === "customers") {

    showCustomers();

  }
  else if (page === "payments") {

    showPendingPayments();

  }
  else {

    pageContent.innerHTML = `
      <div class="content-card placeholder-page">

        <h2>${pages[page]?.title || "Coming Soon"}</h2>

        <p>
          This section will be developed next.
        </p>

      </div>
    `;
    document
    .querySelectorAll(".receive-payment-button")
    .forEach(button => {

        button.addEventListener("click", () => {

            const customerId =
                Number(button.dataset.customerId);

            const customerName =
                button.dataset.customerName;

            receivePayment(
                customerId,
                customerName
            );
        });

    });

  }

}


// Navigation buttons
navItems.forEach(item => {

  item.addEventListener("click", () => {

    navigateTo(item.dataset.page);

  });

});


// Initial page
showDashboard();
initDatabase();