import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event, { IEvent } from "@/database/event.model";

// Type for dynamic route parameters
interface RouteParams {
  params: Promise<{ slug: string }>;
}

// API response types for consistency
interface SuccessResponse {
  message: string;
  event: IEvent;
}

interface ErrorResponse {
  message: string;
  error?: string;
}

/**
 * Validates the slug parameter format.
 * Slugs should be lowercase, alphanumeric with hyphens only.
 */
function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * GET /api/events/[slug]
 * Fetches a single event by its slug.
 */
export async function GET(
  _req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    // Extract slug from dynamic route params
    const { slug } = await params;

    // Validate slug presence
    if (!slug || slug.trim() === "") {
      return NextResponse.json(
        { message: "Slug parameter is required" },
        { status: 400 }
      );
    }

    // Validate slug format
    const normalizedSlug = slug.trim().toLowerCase();
    if (!isValidSlug(normalizedSlug)) {
      return NextResponse.json(
        { message: "Invalid slug format. Use lowercase alphanumeric characters and hyphens only." },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Query event by slug (indexed field for performance)
    const event = await Event.findOne({ slug: normalizedSlug }).lean<IEvent>();

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        { message: `Event with slug '${normalizedSlug}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Event fetched successfully", event },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching event by slug:", error);
    return NextResponse.json(
      {
        message: "Error fetching event",
        error: process.env.NODE_ENV === "development" 
          ? (error instanceof Error ? error.message : "Unknown error")
          : undefined,
      },
      { status: 500 }
    );
  }}
