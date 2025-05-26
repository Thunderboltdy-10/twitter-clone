import Layout from "@/components/Layout";
import PostContent from "@/components/PostContent";
import PostForm from "@/components/PostForm";
import TopNavLink from "@/components/TopNavLink";
import useUserInfo from "@/hooks/useUserInfo";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function PostPage() {
    const router = useRouter();
    const {id} = router.query;
    const [post, setPost] = useState();

    const [replies, setReplies] = useState([]);
    const [repliesLikedByMe, setRepliesLikedByMe] = useState([]);
    const {userInfo} = useUserInfo();

    const [likedByMe, setLikedByMe] = useState();

    function fetchData() {
        axios.get("/api/posts?id=" + id)
            .then(response => {
                setPost(response.data.post);
                setLikedByMe(response.data.idLikedByMe.length > 0 ? true: false);
            })
        axios.get("/api/posts?parent=" + id)
            .then(response => {
                setReplies(response.data.posts);
                setRepliesLikedByMe(response.data.idsLikedByMe);
            })
    }

    useEffect(() => {
        if (!id) {
            return;
        }
        fetchData();
    }, [id])

    return (
        <Layout>
            {!!post?._id && (
                <div className="px-5 py-2">
                    <TopNavLink />
                    {post.parent && (
                        <div className="pb-1">
                            <PostContent {...post.parent} />
                            <div className="ml-5 h-12 relative">
                                <div className="h-20 border-l-2 border-twitterBorder absolute -top-5"
                                    style={{marginLeft: "2px"}}></div>
                            </div>
                        </div>
                    )}
                    <div>
                        <PostContent {...post} big likedByMe={likedByMe} />
                    </div>
                </div>
            )}
            {!!userInfo && (
                <div className="border-t border-twitterBorder py-5">
                    <PostForm onPost={fetchData} parent={id} compact placeholder={"Reply"} />
                </div>
            )}
            <div>
                {replies.length > 0 && replies.map(reply => (
                    <div key={reply._id} className="p-5 border-t border-twitterBorder">
                        <PostContent {...reply} likedByMe={repliesLikedByMe.includes(reply._id)} />
                    </div>
                ))}
            </div>
        </Layout>
    );
}