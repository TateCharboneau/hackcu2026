import mongoose from "mongoose"

const PropmtsSchema = new mongoose.Schema({
    Prompt : String,
    email : String
}) ;
export default mongoose.models.Prompts || mongoose.model("Prompts", PropmtsSchema);
