import connectDB from "@/lib/db"
import Prompts from "@/models/Prompts"
//takes in email and returns prompts by that user
export async function GET(req : Request){
    try {
        await connectDB();
                const url = new URL(req.url);
        const email = url.searchParams.get('email');
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
            const{Prompt, email} = body;
            if(!Prompt|| !email){
                return Response.json({error: "prompt and email required"});
            }
            const prompt = await Prompts.create({Prompt, email});
            return Response.json(prompt, {status:200});

        }
        catch(error){
            return Response.json({error : "Failed to add prompt", details : String(error)}, {status:500});
        }
    }

