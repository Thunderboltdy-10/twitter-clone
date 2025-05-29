import { initMongoose } from "@/lib/mongoose";
import Post from "@/models/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import Like from "@/models/Like";
import Follower from "@/models/Follower";

export default async function handle(req, res) {
    await initMongoose();
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
        return;
    }

    if (req.method === "POST") {
        const {text, parent, images} = req.body;
        const post = await Post.create({
            author: session.user.id,
            text,
            parent,
            images,
        });
        if (parent) {
            const parentPost = await Post.findById(parent);
            parentPost.commentsCount = await Post.countDocuments({parent});
            await parentPost.save();
        }
        res.json(post);
    }

    if (req.method === "GET") {
        const {id} = req.query;

        if (id) {
            const post = await Post.findById(id)
                .populate("author")
                .populate({
                    path: "parent",
                    populate: "author",
                })

            const likedByMe = await Like.find({
                author: post.author,
                post: post,
            });

            const parentLikedByMe = await Like.find({
                author: session.user.id,
                post: post.parent,
            })

            const idLikedByMe = likedByMe.map(like => like.post);
            const idParentLikedByMe = parentLikedByMe.map(like => like.post);

            res.json({post, idLikedByMe, idParentLikedByMe});
        } else {
            const parent = req.query.parent || null;
            const author = req.query.author;
            let searchFilter;

            if (!author && !parent) {
                const myFollows = await Follower.find({source: session.user.id}).exec();
                const idsOfPeopleIFollow = myFollows.map(f => f.destination);
                searchFilter = {author: [...idsOfPeopleIFollow, session.user.id]};
            }
            if (author) {
                searchFilter = {author}
            }
            if (parent) {
                searchFilter = {parent}
            }
            
            const posts = await Post.find(searchFilter)
                .populate("author")
                .populate({
                    path: "parent",
                    populate: "author",
                })
                .sort({createdAt: -1})
                .limit(20)
                .exec();

            const postsLikedByMe = await Like.find({
                author: session.user.id,
                post: posts.map(p => p._id),
            })

            const parentPostsLikedByMe = await Like.find({
                author: session.user.id,
                post: posts.map(p => p.parent),
            })

            const idsLikedByMe = postsLikedByMe.map(like => like.post);
            const idsParentLikedByMe = parentPostsLikedByMe.map(like => like.post);

            res.json({posts, idsLikedByMe, idsParentLikedByMe});
        }
    }
}