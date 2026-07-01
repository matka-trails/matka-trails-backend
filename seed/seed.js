import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";
import Destination from "../models/Destination.js";
import Package from "../models/Package.js";
import ItineraryDay from "../models/ItineraryDay.js";
import PackageReview from "../models/PackageReview.js";
import PackageVideoTestimonial from "../models/PackageVideoTestimonial.js";
import FAQ from "../models/FAQ.js";
import Lead from "../models/Lead.js";
import GalleryItem from "../models/GalleryItem.js";
import VideoTestimonial from "../models/VideoTestimonial.js";
import Blog from "../models/Blog.js";

async function seed() {
  console.log("🌱 Starting MongoDB seed...");

  await connectDB();

  console.log("🧹 Cleaning database...");
  await Promise.all([
    Admin.deleteMany({}),
    Destination.deleteMany({}),
    Package.deleteMany({}),
    ItineraryDay.deleteMany({}),
    PackageReview.deleteMany({}),
    PackageVideoTestimonial.deleteMany({}),
    FAQ.deleteMany({}),
    Lead.deleteMany({}),
    GalleryItem.deleteMany({}),
    VideoTestimonial.deleteMany({}),
    Blog.deleteMany({}),
  ]);
  console.log("✅ Database cleared.");

  const passwordHash = await bcrypt.hash("admin123456", 10);
  const anujHash = await bcrypt.hash("123456", 10);

  const superAdmin = await Admin.create({
    name: "Super Admin",
    email: "admin@matkatrails.com",
    passwordHash,
    role: "SUPER_ADMIN",
  });

  const admin = await Admin.create({
    name: "Matka Trails Team",
    email: "hello@matkatrails.com",
    passwordHash,
    role: "ADMIN",
  });

  const anujAdmin = await Admin.create({
    name: "Anuj",
    email: "anuj@matkatrails.com",
    passwordHash: anujHash,
    role: "SUPER_ADMIN",
  });
  console.log("✅ Admins created.");

  const kedarnath = await Destination.create({
    name: "Kedarnath",
    slug: "kedarnath",
    description: "Kedarnath is one of the holiest Hindu temples dedicated to Lord Shiva, nestled in the Garhwal Himalayan range at an altitude of 3,583m. The temple sits against the magnificent backdrop of snow-capped peaks, offering a spiritual and visually stunning experience.",
    isFeatured: true,
    metaTitle: "Kedarnath Tour Packages — Matka Trails",
    metaDescription: "Explore our curated Kedarnath tour packages for corporate teams and solo travelers. Group travel made memorable.",
    sortOrder: 1,
  });

  const manali = await Destination.create({
    name: "Manali",
    slug: "manali",
    description: "Manali is a picturesque hill station in Himachal Pradesh, famous for its snow-covered mountains, lush green forests, and adventure sports. Perfect for corporate offsite trips and weekend getaways.",
    isFeatured: true,
    metaTitle: "Manali Tour Packages — Matka Trails",
    metaDescription: "Weekend getaway to Manali with Matka Trails. Corporate group travel, solo explorer packages, and adventure trips.",
    sortOrder: 2,
  });

  const rishikesh = await Destination.create({
    name: "Rishikesh",
    slug: "rishikesh",
    description: "Rishikesh, the Yoga Capital of the World, sits on the banks of the Ganges in the foothills of the Himalayas. Known for adventure sports like white-water rafting, bungee jumping, and camping.",
    isFeatured: true,
    metaTitle: "Rishikesh Tour Packages — Matka Trails",
    metaDescription: "Adventure-packed Rishikesh group tours. Rafting, camping, and team building for corporate teams.",
    sortOrder: 3,
  });
  console.log("✅ Destinations created.");

  const kedarnathPkg = await Package.create({
    title: "Kedarnath Divine Trek — 3D/2N",
    slug: "kedarnath-divine-trek-3d-2n",
    destinationId: kedarnath._id,
    summary: "A spiritual journey to one of the most sacred temples in India. Trek through breathtaking Himalayan landscapes.",
    description: "Experience the divine beauty of Kedarnath on this carefully crafted 3-day trek. Starting from Gaurikund, you'll traverse through lush green valleys, cross mountain streams, and witness the majestic Kedarnath temple against the backdrop of the Himalayas. Our expert guides ensure a safe and memorable journey for your group.",
    durationDays: 3,
    durationNights: 2,
    priceOriginal: 8999,
    priceDiscounted: 6999,
    inclusions: [
      "Transport from Haridwar to Gaurikund and back",
      "Accommodation (2 nights)",
      "All meals (Breakfast, Lunch, Dinner)",
      "Experienced trek guide",
      "First aid kit and medical assistance",
      "Group captain and coordination",
    ],
    exclusions: [
      "Personal expenses",
      "Pony/palki ride (available on request)",
      "Travel insurance",
      "Helicopter tickets",
    ],
    notes: "Moderate fitness level required. Carry warm clothing and comfortable trekking shoes.",
    status: "PUBLISHED",
    groupType: "SOLO_GROUP",
    isFeatured: true,
    maxGroupSize: 25,
    currentBookings: 8,
    metaTitle: "Kedarnath Trek 3D/2N — ₹6,999 | Matka Trails",
    metaDescription: "Join our Kedarnath divine trek. 3 days, 2 nights of spiritual adventure with group travel. Starting at ₹6,999.",
  });

  const manaliPkg = await Package.create({
    title: "Manali Corporate Offsite — 4D/3N",
    slug: "manali-corporate-offsite-4d-3n",
    destinationId: manali._id,
    summary: "The perfect corporate team retreat. Snow, adventure, and team bonding in the heart of Himachal.",
    description: "Take your team to the mountains for a refreshing offsite experience. This package includes adventure activities like paragliding, river crossing, and campfire nights. Designed specifically for corporate groups who want to combine team building with travel.",
    durationDays: 4,
    durationNights: 3,
    priceOriginal: 14999,
    priceDiscounted: 11999,
    inclusions: [
      "Luxury bus transport from Delhi",
      "3-star hotel accommodation",
      "All meals included",
      "Paragliding session",
      "River crossing & rappelling",
      "Campfire & music night",
      "Team building activities",
      "Group captain",
    ],
    exclusions: [
      "Personal shopping",
      "Extra adventure activities",
      "Alcohol & beverages",
      "Tips and gratuities",
    ],
    notes: "Minimum group size: 10 people. Custom itinerary available for groups of 20+.",
    status: "PUBLISHED",
    groupType: "CORPORATE",
    isFeatured: true,
    maxGroupSize: 40,
    currentBookings: 15,
    metaTitle: "Manali Corporate Offsite 4D/3N — ₹11,999 | Matka Trails",
    metaDescription: "Plan your corporate offsite in Manali. 4 days of adventure, team building, and mountain magic.",
  });

  const rishikeshPkg = await Package.create({
    title: "Rishikesh Adventure Weekend — 2D/1N",
    slug: "rishikesh-adventure-weekend-2d-1n",
    destinationId: rishikesh._id,
    summary: "Adrenaline-packed weekend with rafting, camping, and bonfires by the Ganges.",
    description: "Don't have a full week? This weekend package packs in maximum adventure in just 2 days. White-water rafting on Grade 3-4 rapids, riverside camping under the stars, cliff jumping, and a bonfire dinner. Perfect solo travelers looking to join a fun group.",
    durationDays: 2,
    durationNights: 1,
    priceOriginal: 4999,
    priceDiscounted: 3499,
    inclusions: [
      "Transport from Delhi/NCR",
      "Riverside camping (tents)",
      "All meals",
      "White-water rafting (16 km stretch)",
      "Cliff jumping",
      "Bonfire with music",
      "Group captain",
    ],
    exclusions: [
      "Personal expenses",
      "Bungee jumping (optional add-on)",
      "Travel insurance",
    ],
    notes: "Swimming knowledge is recommended but not mandatory. Life jackets provided for all water activities.",
    status: "PUBLISHED",
    groupType: "SOLO_GROUP",
    isFeatured: false,
    maxGroupSize: 30,
    currentBookings: 22,
    metaTitle: "Rishikesh Weekend Trip 2D/1N — ₹3,499 | Matka Trails",
    metaDescription: "Weekend adventure in Rishikesh. Rafting, camping, bonfires. Join a group trip starting at ₹3,499.",
  });
  console.log("Base packages created.");

  await ItineraryDay.insertMany([
    {
      packageId: kedarnathPkg._id,
      dayNumber: 1,
      title: "Arrival in Haridwar",
      description: "Arrive in Haridwar by evening. Meet the group and your group captain. Attend the iconic Ganga Aarti at Har Ki Pauri. Dinner and overnight stay at hotel.",
      sortOrder: 1,
    },
    {
      packageId: kedarnathPkg._id,
      dayNumber: 2,
      title: "Haridwar → Gaurikund → Kedarnath Trek",
      description: "Early morning drive to Gaurikund (approx 7-8 hours). Begin the 16 km trek to Kedarnath Temple. Reach by evening, visit the temple for darshan. Overnight stay near the temple.",
      sortOrder: 2,
    },
    {
      packageId: kedarnathPkg._id,
      dayNumber: 3,
      title: "Kedarnath → Gaurikund → Haridwar",
      description: "Early morning temple darshan. Begin descent trek to Gaurikund. Drive back to Haridwar. Trip concludes with amazing memories and lifelong friendships.",
      sortOrder: 3,
    },
    {
      packageId: manaliPkg._id,
      dayNumber: 1,
      title: "Delhi → Manali (Overnight Journey)",
      description: "Board the luxury Volvo bus from Delhi in the evening. Overnight journey to Manali with stops for dinner.",
      sortOrder: 1,
    },
    {
      packageId: manaliPkg._id,
      dayNumber: 2,
      title: "Manali Sightseeing & Team Activities",
      description: "Check into the hotel. Visit Hadimba Temple, Mall Road, and Old Manali. Afternoon team building games. Evening campfire and music night.",
      sortOrder: 2,
    },
    {
      packageId: manaliPkg._id,
      dayNumber: 3,
      title: "Solang Valley Adventure Day",
      description: "Full day at Solang Valley — paragliding, zorbing, and river crossing. Lunch at a local dhaba. Rappelling session in the afternoon. Farewell dinner.",
      sortOrder: 3,
    },
    {
      packageId: manaliPkg._id,
      dayNumber: 4,
      title: "Manali → Delhi",
      description: "Late checkout. Free time for shopping at Mall Road. Board the Volvo bus back to Delhi. Arrive by late night/early morning.",
      sortOrder: 4,
    },
  ]);
  console.log("✅ Itineraries created.");

  await PackageReview.insertMany([
    {
      packageId: kedarnathPkg._id,
      customerName: "Rahul Sharma",
      rating: 5,
      reviewText: "Absolutely life-changing experience! The group was amazing and the trek was well-organized. Matka Trails made my Kedarnath dream come true.",
      isApproved: true,
    },
    {
      packageId: kedarnathPkg._id,
      customerName: "Priya Patel",
      rating: 4,
      reviewText: "Great trip overall. The accommodation could have been slightly better, but the experience and the group vibes were top-notch. Would definitely recommend.",
      isApproved: true,
    },
    {
      packageId: manaliPkg._id,
      customerName: "Arjun Mehta",
      rating: 5,
      reviewText: "Our company did an offsite with Matka Trails and it was the best team outing we've ever had. The paragliding and campfire night were highlights!",
      isApproved: true,
    },
    {
      packageId: rishikeshPkg._id,
      customerName: "Sneha Kapoor",
      rating: 5,
      reviewText: "I was solo and nervous about joining a group, but everyone was so welcoming. The rafting was thrilling and the camping under stars was magical!",
      isApproved: true,
    },
  ]);
  console.log("✅ Reviews created.");

  await FAQ.insertMany([
    {
      packageId: kedarnathPkg._id,
      question: "What is the difficulty level of the Kedarnath trek?",
      answer: "The trek is moderate difficulty. You need a basic fitness level — being able to walk 8-10 km on mountainous terrain. We recommend starting light exercises 2-3 weeks before the trek.",
      sortOrder: 1,
    },
    {
      packageId: kedarnathPkg._id,
      question: "Is there a pony/palki available for the trek?",
      answer: "Yes, ponies and palkis (palanquins) are available at Gaurikund. They are not included in the package price and need to be booked separately. Approximate cost: ₹3,000-5,000 for pony, ₹6,000-10,000 for palki.",
      sortOrder: 2,
    },
    {
      packageId: manaliPkg._id,
      question: "What is the minimum group size for the corporate package?",
      answer: "The minimum group size is 10 people. For groups larger than 20, we can customize the itinerary and activities. Contact us for custom corporate packages.",
      sortOrder: 1,
    },
    {
      packageId: rishikeshPkg._id,
      question: "Do I need to know swimming for rafting?",
      answer: "No, swimming knowledge is not mandatory. Professional life jackets and helmets are provided for all participants. Our certified rafting instructors ensure complete safety throughout the activity.",
      sortOrder: 1,
    },
  ]);
  console.log("✅ FAQs created.");

  await Blog.create({
    title: "Why Group Travel is the Future for Working Professionals",
    slug: "why-group-travel-is-the-future",
    coverImage: null,
    contentBlocks: [
      {
        type: "paragraph",
        content: "In today's fast-paced corporate world, weekends have become a precious escape. But for many working professionals, especially those living alone in metro cities, planning a trip can feel overwhelming. Who do you go with? How do you plan everything? This is exactly where group travel comes in.",
      },
      {
        type: "heading",
        content: "The Rise of Solo-to-Group Travel",
        level: 2,
      },
      {
        type: "paragraph",
        content: "Group travel platforms like Matka Trails are bridging the gap between solo travelers and unforgettable experiences. You don't need a friend group that's free on the same weekend. You just need the desire to explore, and we'll handle the rest — from creating your group to assigning a group captain who ensures everyone has an incredible time.",
      },
      {
        type: "heading",
        content: "Benefits for Corporate Teams",
        level: 2,
      },
      {
        type: "paragraph",
        content: "For companies, group travel isn't just a perk — it's an investment. Studies show that teams who travel together show 30% higher collaboration scores and significantly improved workplace relationships. Our corporate packages are designed to blend adventure with team-building, creating memories that translate into better workplace dynamics.",
      },
      {
        type: "quote",
        content: "The best team-building doesn't happen in conference rooms. It happens on mountain trails, around campfires, and in the rush of white-water rapids.",
        author: "Team Matka Trails",
      },
      {
        type: "heading",
        content: "How It Works",
        level: 2,
      },
      {
        type: "paragraph",
        content: "Booking with Matka Trails is simple: browse our curated packages, pick your dates, and sign up. We create groups of like-minded travelers, assign an experienced group captain, handle all logistics (transport, stay, meals, activities), and you just show up ready for an adventure. It's travel made effortless.",
      },
    ],
    tags: ["group-travel", "corporate", "weekend-trips", "solo-traveler"],
    status: "PUBLISHED",
    authorId: admin._id,
    metaTitle: "Why Group Travel is the Future — Matka Trails Blog",
    metaDescription: "Discover why group travel is becoming the go-to option for working professionals and corporate teams. Learn about Matka Trails' unique approach.",
  });
  console.log("✅ Blog created.");

  await Lead.insertMany([
    {
      name: "Vikram Singh",
      phone: "9876543210",
      email: "vikram.singh@gmail.com",
      city: "New Delhi",
      company: "TCS",
      packageId: manaliPkg._id,
      groupSize: 15,
      preferredDate: "First weekend of August",
      message: "We're looking for a corporate offsite for our team of 15. Interested in the Manali package.",
      status: "NEW",
      source: "PACKAGE_BOOKING",
    },
    {
      name: "Ananya Gupta",
      phone: "9988776655",
      email: "ananya.g@outlook.com",
      city: "Bengaluru",
      packageId: kedarnathPkg._id,
      groupSize: 1,
      preferredDate: "Any weekend in September",
      message: "Solo traveler, very interested in the Kedarnath trek. Is there a group forming soon?",
      status: "CONTACTED",
      source: "WEBSITE_FORM",
      adminNotes: "Called her — interested, waiting for September dates to be finalized.",
    },
    {
      name: "Rohit Verma",
      phone: "8877665544",
      email: "rohit@infosys.com",
      city: "Pune",
      company: "Infosys",
      packageId: rishikeshPkg._id,
      groupSize: 25,
      preferredDate: "Last weekend of July",
      message: "Team outing for 25 people. Need the Rishikesh adventure weekend.",
      status: "CONFIRMED",
      source: "PACKAGE_BOOKING",
      adminNotes: "Confirmed booking. Payment received via NEFT. Group captain assigned: Raj.",
    },
  ]);

  await GalleryItem.insertMany([
    {
      placeName: "Bhutan",
      imageUrl: "https://images.unsplash.com/photo-1598977123418-45f04b616a0e?auto=format&fit=crop&q=80&w=1200",
      caption: "Paro Taktsang hiking with the team",
      sortOrder: 1,
    },
    {
      placeName: "Kerala",
      imageUrl: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=1200",
      caption: "Cruising along the serene backwaters",
      sortOrder: 2,
    },
    {
      placeName: "Meghalaya",
      imageUrl: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&q=80&w=1200",
      caption: "Exploring deep root bridges",
      sortOrder: 3,
    },
    {
      placeName: "Uttarakhand",
      imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=1200",
      caption: "White water river rafting in Rishikesh",
      sortOrder: 4,
    },
  ]);

  await VideoTestimonial.insertMany([
    {
      title: "Sri Lanka Trip | WanderOn Reviews | Client Testimonials",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      sortOrder: 1,
    },
    {
      title: "Kedarnath Trek Review | Matka Trails Happy Customers",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      sortOrder: 2,
    },
  ]);

  console.log("✅ Leads, Gallery, and Testimonials created.");

  console.log("\n🎉 Database seeded successfully!");
  console.log("─────────────────────────────────");
  console.log("Admin Login Credentials:");
  console.log("  Email:    admin@matkatrails.com");
  console.log("  Password: admin123456");
  console.log("─────────────────────────────────");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
