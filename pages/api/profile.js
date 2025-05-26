import { initMongoose } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import User from "@/models/User";

export default async function handle (req, res) {
    await initMongoose();
    const {bio, name, username} = req.body;
    const session = await getServerSession(req, res, authOptions);
    
    await User.findByIdAndUpdate(session.user.id, {bio, name, username});
    res.json("ok");
}