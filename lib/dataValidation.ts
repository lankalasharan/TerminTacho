/**
 * Data validation for timeline submissions
 */

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate timeline submission data
 */
export function validateTimelineSubmission(data: {
  submittedAt: string | Date;
  decisionAt: string | null | Date;
  status: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];
  const submitted = new Date(data.submittedAt);
  const decision = data.decisionAt ? new Date(data.decisionAt) : null;

  // Check submission date is not in future
  if (submitted > new Date()) {
    errors.push({
      field: "submittedAt",
      message: "Submission date cannot be in the future",
    });
  }

  // Check submission date is not too old (>5 years)
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
  if (submitted < fiveYearsAgo) {
    errors.push({
      field: "submittedAt",
      message: "Submission date is too far in the past (>5 years)",
    });
  }

  // If decision date is provided, validate it
  if (decision) {
    // Decision date cannot be in future
    if (decision > new Date()) {
      errors.push({
        field: "decisionAt",
        message: "Decision date cannot be in the future",
      });
    }

    // Decision date must be after submission date
    if (decision < submitted) {
      errors.push({
        field: "decisionAt",
        message: "Decision date must be after submission date",
      });
    }

    // Processing time cannot exceed 3 years (1095 days)
    const processingDays = Math.floor(
      (decision.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (processingDays > 1095) {
      errors.push({
        field: "decisionAt",
        message: "Processing time exceeds 3 years - likely invalid",
      });
    }

    // Flag suspiciously short processing times (< 1 day)
    if (processingDays < 0) {
      errors.push({
        field: "decisionAt",
        message: "Decision cannot come before submission",
      });
    }
  }

  // Validate status
  if (!["pending", "approved", "rejected"].includes(data.status)) {
    errors.push({
      field: "status",
      message: 'Status must be "pending", "approved", or "rejected"',
    });
  }

  return errors;
}

/**
 * Validate review data
 */
export function validateReview(data: {
  overallRating: number;
  serviceRating?: number;
  staffRating?: number;
  speedRating?: number;
  title?: string;
  content: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate overall rating
  if (!Number.isInteger(data.overallRating) || data.overallRating < 1 || data.overallRating > 5) {
    errors.push({
      field: "overallRating",
      message: "Overall rating must be between 1 and 5",
    });
  }

  // Validate optional ratings
  [
    { rating: data.serviceRating, field: "serviceRating" },
    { rating: data.staffRating, field: "staffRating" },
    { rating: data.speedRating, field: "speedRating" },
  ].forEach(({ rating, field }) => {
    if (rating !== undefined && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
      errors.push({
        field,
        message: `${field} must be between 1 and 5`,
      });
    }
  });

  // Validate content
  if (!data.content || data.content.trim().length < 10) {
    errors.push({
      field: "content",
      message: "Review must be at least 10 characters long",
    });
  }

  if (data.content.length > 5000) {
    errors.push({
      field: "content",
      message: "Review cannot exceed 5000 characters",
    });
  }

  // Validate title if provided
  if (data.title) {
    if (data.title.length < 3) {
      errors.push({
        field: "title",
        message: "Title must be at least 3 characters",
      });
    }
    if (data.title.length > 200) {
      errors.push({
        field: "title",
        message: "Title cannot exceed 200 characters",
      });
    }
  }

  // Check for spam patterns: all CAPS
  if (data.content.toUpperCase() === data.content && data.content.length > 50) {
    errors.push({
      field: "content",
      message: "Review appears to be spam (all caps)",
    });
  }

  // Check for excessive special characters (spam indicator)
  const specialCharCount = (data.content.match(/[!@#$%^&*]/g) || []).length;
  if (specialCharCount > data.content.length * 0.3) {
    errors.push({
      field: "content",
      message: "Review contains too many special characters",
    });
  }

  return errors;
}
