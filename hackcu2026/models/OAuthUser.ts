import mongoose from "mongoose"

const OAuthUserSchema = new mongoose.Schema({
    email : String
}) ;
export default mongoose.models.OAuthUser || mongoose.model("OAuthUser", OAuthUserSchema);
