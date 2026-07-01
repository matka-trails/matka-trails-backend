import FAQ from "../models/FAQ.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const createFaq = async (req, res, next) => {
  try {
    const { blogId, packageId, question, answer, sortOrder } = req.body;

    if (!question || !answer) {
      return errorResponse(res, "question and answer are required.", "VALIDATION_ERROR", 400);
    }
    if (!blogId && !packageId) {
      return errorResponse(
        res,
        "Either blogId or packageId must be provided.",
        "VALIDATION_ERROR",
        400
      );
    }

    const faq = await FAQ.create({
      blogId: blogId || null,
      packageId: packageId || null,
      question: question.trim(),
      answer: answer.trim(),
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
    });

    return successResponse(res, faq, 201);
  } catch (error) {
    next(error);
  }
};

export const updateFaq = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question, answer, sortOrder } = req.body;

    const faq = await FAQ.findById(id);
    if (!faq) {
      return errorResponse(res, "FAQ not found.", "NOT_FOUND", 404);
    }

    if (question) faq.question = question.trim();
    if (answer) faq.answer = answer.trim();
    if (sortOrder !== undefined) faq.sortOrder = Number(sortOrder);

    await faq.save();
    return successResponse(res, faq);
  } catch (error) {
    next(error);
  }
};

export const deleteFaq = async (req, res, next) => {
  try {
    const { id } = req.params;

    const faq = await FAQ.findByIdAndDelete(id);
    if (!faq) {
      return errorResponse(res, "FAQ not found.", "NOT_FOUND", 404);
    }

    return successResponse(res, { message: "FAQ deleted." });
  } catch (error) {
    next(error);
  }
};

export const bulkReplaceFaqs = async (req, res, next) => {
  try {
    const { blogId, packageId, faqs } = req.body;

    if (!Array.isArray(faqs)) {
      return errorResponse(res, "faqs must be an array.", "VALIDATION_ERROR", 400);
    }
    if (!blogId && !packageId) {
      return errorResponse(res, "Either blogId or packageId is required.", "VALIDATION_ERROR", 400);
    }

    const filter = blogId ? { blogId } : { packageId };

    await FAQ.deleteMany(filter);

    const newFaqs = await FAQ.insertMany(
      faqs.map((f, idx) => ({
        blogId: blogId || null,
        packageId: packageId || null,
        question: f.question?.trim() || "",
        answer: f.answer?.trim() || "",
        sortOrder: f.sortOrder !== undefined ? Number(f.sortOrder) : idx,
      }))
    );

    return successResponse(res, newFaqs);
  } catch (error) {
    next(error);
  }
};
