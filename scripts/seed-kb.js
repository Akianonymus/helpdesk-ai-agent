import mongoose from "mongoose";
import KnowledgeBase from "../models/KnowledgeBase.js";
import User from "../models/User.js";
import { SECRETS } from "../utils/consts.js";

// Knowledge base articles
const knowledgeBaseArticles = [
  {
    title: "How to Reset Your Password",
    content:
      'If you have forgotten your password, follow these steps: 1) Click on "Forgot Password" on the login page, 2) Enter your email address, 3) Check your email for a reset link, 4) Click the link and enter a new password. Make sure your new password is at least 8 characters long and includes a mix of letters, numbers, and special characters.',
    tags: ["password", "security", "login", "reset"],
    category: "Account Management",
  },
  {
    title: "Troubleshooting Dashboard Access Issues",
    content:
      "If you are experiencing issues accessing the dashboard, try these solutions: 1) Clear your browser cache and cookies, 2) Try a different browser, 3) Check if you have the latest browser version, 4) Disable browser extensions temporarily, 5) Contact support if the issue persists. Most dashboard access issues are resolved by clearing browser data.",
    tags: ["dashboard", "access", "troubleshooting", "browser"],
    category: "Technical Support",
  },
  {
    title: "Understanding Your Billing Cycle",
    content:
      "Your billing cycle begins on the date you first subscribed to our service. You will be charged monthly on the same date. If you upgrade or downgrade your plan, the new rate will apply at the start of your next billing cycle. You can view your billing history and upcoming charges in the billing section of your account settings.",
    tags: ["billing", "subscription", "payment", "cycle"],
    category: "Billing & Payments",
  },
  {
    title: "Setting Up Two-Factor Authentication",
    content:
      'Two-factor authentication adds an extra layer of security to your account. To enable it: 1) Go to Security Settings in your account, 2) Click "Enable 2FA", 3) Choose between SMS or authenticator app, 4) Follow the setup instructions, 5) Save your backup codes in a secure location. We recommend using an authenticator app for better security.',
    tags: ["2fa", "security", "authentication", "setup"],
    category: "Security",
  },
  {
    title: "How to Export Your Data",
    content:
      'You can export your data at any time by following these steps: 1) Navigate to Account Settings, 2) Click on "Data & Privacy", 3) Select "Export Data", 4) Choose the data types you want to export, 5) Click "Start Export". The export will be processed and you will receive an email with a download link when it\'s ready. Large exports may take up to 24 hours.',
    tags: ["export", "data", "privacy", "backup"],
    category: "Account Management",
  },
  {
    title: "Browser Compatibility Guide",
    content:
      "Our platform works best with modern, up-to-date browsers. Supported browsers and minimum versions: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. For optimal performance, we recommend: 1) Keep your browser updated to the latest version, 2) Enable JavaScript and cookies, 3) Clear browser cache regularly, 4) Use a stable internet connection, 5) Disable conflicting browser extensions.",
    tags: ["browser", "compatibility", "supported", "versions", "mobile"],
    category: "Technical Support",
  },
  {
    title: "Adding or Updating Payment Methods",
    content:
      'Keeping your payment methods current ensures uninterrupted service. To add a new payment method: 1) Go to Account Settings > Billing, 2) Click "Add Payment Method", 3) Enter your card details or connect a PayPal account, 4) Verify the payment method if required, 5) Set as default if desired. We accept major credit cards (Visa, MasterCard, American Express) and PayPal.',
    tags: ["payment", "methods", "credit-card", "paypal", "billing"],
    category: "Billing & Payments",
  },
  {
    title: "Recognizing and Avoiding Phishing",
    content:
      "Phishing attacks attempt to steal your login credentials and personal information. Stay safe by: 1) Never clicking links in suspicious emails, 2) Checking sender email addresses carefully, 3) Looking for spelling and grammar errors, 4) Avoiding urgent or threatening language, 5) Not sharing passwords or personal information via email, 6) Using our official website directly instead of email links.",
    tags: ["phishing", "security", "scams", "email", "protection"],
    category: "Security",
  },
];

async function seedKnowledgeBase() {
  try {
    console.log("Starting Knowledge Base Seeding...");

    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(SECRETS.MONGODB_URI);
    console.log("MongoDB connected successfully");

    // Check if we need to create a default admin user for KB articles
    let adminUser = await User.findOne({ role: "admin" });

    if (!adminUser) {
      console.log("Creating default admin user for KB articles...");
      adminUser = new User({
        email: "admin@helpdesk.com",
        password: "admin123456",
        role: "admin",
      });
      await adminUser.save();
      console.log("Default admin user created");
    } else {
      console.log("Using existing admin user");
    }

    // Clear existing KB articles
    console.log("Clearing existing knowledge base articles...");
    await KnowledgeBase.deleteMany({});
    console.log("Existing articles cleared");

    // Insert new articles
    console.log("Inserting knowledge base articles...");
    const articlesWithUser = knowledgeBaseArticles.map((article) => ({
      ...article,
      createdBy: adminUser._id,
    }));

    const insertedArticles = await KnowledgeBase.insertMany(articlesWithUser);
    console.log(`Successfully inserted ${insertedArticles.length} articles`);

    // Verify text search index
    console.log("Verifying text search index...");
    try {
      await KnowledgeBase.createIndexes();
      console.log("Text search indexes created/verified");
    } catch (error) {
      console.log("Index creation warning:", error.message);
    }

    // Test search functionality
    console.log("Testing search functionality...");
    const searchTest = await KnowledgeBase.find({
      $text: { $search: "password" },
    });
    console.log(
      `Search test successful - found ${searchTest.length} articles for "password"`
    );

    // Show summary
    console.log("\nSeeding Summary:");
    console.log(`Total Articles: ${insertedArticles.length}`);
    console.log(
      `Categories: ${[...new Set(insertedArticles.map((a) => a.category))].join(
        ", "
      )}`
    );

    console.log("\nKnowledge Base seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedKnowledgeBase();
}

export default seedKnowledgeBase;
