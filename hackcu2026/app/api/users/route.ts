import connectDB from "@/lib/db";
import OAuthUser from "@/models/OAuthUser";

export async function GET() {
  await connectDB();

  const users = await OAuthUser.find();
  console.log(users);
  return Response.json(users);
}
