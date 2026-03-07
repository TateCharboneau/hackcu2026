import connectDB from "@/lib/db";

export async function GET() {
  try {
    await connectDB();

    return Response.json({
      message: "MongoDB connected successfully"
    });

  } catch (error) {
    return Response.json({
      error: "Database connection failed",
      details: error
    });
  }
}
