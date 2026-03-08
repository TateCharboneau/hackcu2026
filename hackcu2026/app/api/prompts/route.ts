import { auth } from "@/auth";
import connectDB from "@/lib/db"
import Prompts from "@/models/Prompts"
//takes in email and returns prompts by that user
export async function GET(req : Request){
    try {


        const session = await auth();
        if(!session?.user) console.error("No auth data");

        const email = session?.user?.email
        await connectDB();
      
        if (!email) {
            return Response.json({ error: "email query parameter required" }, { status: 400 });
        }
        const promptdata = await Prompts.find({email});
        if(!promptdata || promptdata.length===0){
            return Response.json("no prompts found");
        }
        return Response.json(promptdata, { status: 200 });
        }
        catch(error){
            return Response.json({error : "failed to fetch Prompts"});
        }
    }
    export async function POST(req:Request){
        try{
            const body = await req.json();
            const { rawText, parsedTrade, flags, simulationResult, email } = body;
            if(!rawText || !parsedTrade || !email){
                return Response.json({error: "rawText, parsedTrade, and email are required"}, {status: 400});
            }
            const prompt = await Prompts.create({ email, rawText, parsedTrade, flags, simulationResult });
            return Response.json(prompt, {status:201});

        }
        catch(error){
            return Response.json({error : "Failed to add data", details : String(error)}, {status:500});
        }
    }

