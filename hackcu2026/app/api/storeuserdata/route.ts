import connectDB from "@/lib/db"
import OAuthUser from "@/models/OAuthUser"

export async function GET(){
    try {
        await connectDB();
        const userdata = await OAuthUser.find();
        if(userdata.length===0){
            return Response.json("no users found");
        }
        return Response.json(userdata);

        }
        catch(error){
            return Response.json({error : "failed to fetch users"});
        }
    }
    export async function POST(req:Request){
        try{
            const body = await req.json();
            const{email} = body;
            if(!email ){
                return Response.json({error: "email required"});
            }
            const user = await OAuthUser.create({email});
            return Response.json(user, {status:200});

        }
        catch(error){
            return Response.json({error : "failed to create user", details : String(error)}, {status:500});
        }
    }

