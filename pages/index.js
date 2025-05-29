import Layout from "@/components/Layout";
import PostContent from "@/components/PostContent";
import PostForm from "@/components/PostForm";
import UsernameForm from "@/components/UsernameForm";
import useUserInfo from "@/hooks/useUserInfo";
import axios from "axios";
import {signOut, useSession} from "next-auth/react";
import { useRouter } from "next/router";
import {useEffect, useState} from "react";

export default function Home() {
    const {userInfo, setUserInfo, status: userInfoStatus} = useUserInfo();
    const [posts, setPosts] = useState([]);

    const [idsLikedByMe, setIdsLikedByMe] = useState([]);
    const [idsParentLikedByMe, setIdsParentLikedByMe] = useState([]);

    const router = useRouter();

    function fetchHomePosts() {
        axios.get("/api/posts").then(response => {
            setPosts(response.data.posts);
            setIdsLikedByMe(response.data.idsLikedByMe);
            setIdsParentLikedByMe(response.data.idsParentLikedByMe);
        })
    }

    async function logout() {
        setUserInfo(null);
        await signOut();
    }

    useEffect(() => {
        fetchHomePosts();
    }, []);

    if (userInfoStatus === "loading") {
        return "loading user info";
    }

    if (userInfo && !userInfo?.username) { 
        return <UsernameForm />;
    }

    if (!userInfo) {
        router.push("/login");
        return "no user info"
    }

    return (
        <Layout>
            <h1 className="text-lg font-bold p-4">Home</h1>
            <PostForm onPost={() => {fetchHomePosts();}}/>
            <div>
                {posts.length > 0 && posts.map(post => (
                    <div key={post._id} className="border-t border-twitterBorder p-5">
                        {post.parent && (
                            <div className="">
                                <div className="relative pb-10">
                                    <div
                                        className="w-0.5 bg-twitterBorder absolute left-5 bottom-0"
                                        style={{marginLeft: "2px", top: "45px"}}></div>
                                    <div className="">
                                        <PostContent {...post.parent} likedByMe={idsParentLikedByMe.includes(post.parent._id)}/>
                                    </div>
                                </div>
                            </div>
                        )}
                        <PostContent {...post} likedByMe={idsLikedByMe.includes(post._id)} />
                    </div>
                ))}
            </div>
            {userInfo && (
                <div className="p-5 text-center border-t border-twitterBorder">
                    <button className="bg-twitterWhite text-black px-5 py-2 rounded-full" onClick={logout}>Logout</button>
                </div>

            )}
        </Layout>
    );
}
