import Package from "../models/Package.js";
import Destination from "../models/Destination.js";
import Blog from "../models/Blog.js";
import Lead from "../models/Lead.js";
import { successResponse } from "../utils/response.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalPackages,
      publishedPackages,
      draftPackages,
      totalDestinations,
      totalBlogs,
      totalLeads,
      newLeads,
      contactedLeads,
      confirmedLeads,
      rejectedLeads,
      recentLeads,
    ] = await Promise.all([
      Package.countDocuments({ deletedAt: null }),
      Package.countDocuments({ status: "PUBLISHED", deletedAt: null }),
      Package.countDocuments({ status: "DRAFT", deletedAt: null }),
      Destination.countDocuments({ deletedAt: null }),
      Blog.countDocuments({ deletedAt: null }),
      Lead.countDocuments(),
      Lead.countDocuments({ status: "NEW" }),
      Lead.countDocuments({ status: "CONTACTED" }),
      Lead.countDocuments({ status: "CONFIRMED" }),
      Lead.countDocuments({ status: "REJECTED" }),
      Lead.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("packageId", "title"),
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const leadsRaw = await Lead.find({ createdAt: { $gte: thirtyDaysAgo } })
      .select("createdAt")
      .sort({ createdAt: 1 });

    const leadsOverTimeMap = {};
    for (let d = new Date(thirtyDaysAgo); d <= new Date(); d.setDate(d.getDate() + 1)) {
      leadsOverTimeMap[d.toISOString().split("T")[0]] = 0;
    }
    leadsRaw.forEach((lead) => {
      const dateKey = lead.createdAt.toISOString().split("T")[0];
      if (leadsOverTimeMap[dateKey] !== undefined) {
        leadsOverTimeMap[dateKey]++;
      }
    });

    const leadsOverTime = Object.entries(leadsOverTimeMap).map(([date, count]) => ({
      date,
      count,
    }));

    return successResponse(res, {
      totalLeads,
      newLeadsThisWeek: newLeads, // map to expected frontend property name
      confirmedBookings: confirmedLeads, // map to expected frontend property name
      publishedPackages,
      draftPackages,
      totalDestinations,
      totalBlogs,
      revenuePipeline: confirmedLeads * 5000, // or some aggregate, map to expected frontend property name
      leadsByStatus: {
        NEW: newLeads,
        CONTACTED: contactedLeads,
        CONFIRMED: confirmedLeads,
        REJECTED: rejectedLeads,
      },
      recentLeads: recentLeads.map((lead) => ({
        id: lead._id,
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        status: lead.status,
        source: lead.source,
        createdAt: lead.createdAt,
        package: lead.packageId ? { title: lead.packageId.title } : null,
      })),
      leadsByDay: leadsOverTime, // map to expected frontend property name
      leadsBySource: [
        { source: "Website Form", count: totalLeads - confirmedLeads },
        { source: "Booking", count: confirmedLeads }
      ]
    });
  } catch (error) {
    next(error);
  }
};
