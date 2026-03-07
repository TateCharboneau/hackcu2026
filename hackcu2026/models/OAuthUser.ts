import mongoose from "mongoose"

const OAuthUserSchema = new mongoose.Schema({
    email : String,
    ID : Text
}) ;
export default mongoose.models.OAuthUser || mongoose.model("OAuthUser", OAuthUserSchema);
