import Avatar from "@/components/Avatar";
import Cover from "@/components/Cover";
import Layout from "@/components/Layout";
import PostContent from "@/components/PostContent";
import TopNavLink from "@/components/TopNavLink";
import useUserInfo from "@/hooks/useUserInfo";
import axios from "axios";
import { useRouter } from "next/router"
import { useEffect, useState } from "react";

export default function UserPage() {
    const router = useRouter();
    const {username} = router.query;
    const [profileInfo, setProfileInfo] = useState();
    const [originalUserInfo, setOriginalUserInfo] = useState();

    const {userInfo} = useUserInfo();
    const [posts, setPosts] = useState([]);
    const [editMode, setEditMode] = useState(false);

    const [isFollowing, setIsFollowing] = useState(false);

    const [postsLikedByMe, setPostsLikedByMe] = useState([]);
    const [parentPostsLikedByMe, setParentPostsLikedByMe] = useState([]);


    useEffect(() => {
        if (!username) {
            return;
        }

        axios.get("/api/users?username=" + username)
            .then(response => {
                setProfileInfo(response.data.user);
                setOriginalUserInfo(response.data.user);
                setIsFollowing(!!response.data.follow);
            })
    }, [username]);

    useEffect(() => {
        if (!profileInfo?._id) {
            return;
        }

        axios.get("/api/posts?author=" + profileInfo._id)
            .then(response => {
                setPosts(response.data.posts);
                setPostsLikedByMe(response.data.idsLikedByMe);
                setParentPostsLikedByMe(response.data.idsParentLikedByMe);
            })
    }, [profileInfo]);

    function updateUserImage(type, src) {
        setProfileInfo(prev => ({...prev, [type]:src}));
    }

    async function updateProfile() {
        const {bio, name, username} = profileInfo;
        await axios.put("/api/profile", {
            bio, name, username
        });
        setEditMode(false);
        setOriginalUserInfo(profileInfo);
        router.replace("/" + profileInfo.username);
    }

    function cancel() {
        setProfileInfo(prev => {
            const {bio, name, username} = originalUserInfo;
            return {...prev, bio, name, username};
        });
        setEditMode(false);
    }

    function toggleFollow() {
        setIsFollowing(prev => !prev);
        axios.post("/api/followers", {
            destination: profileInfo?._id,
        })
    }

    const isMyProfile = profileInfo?._id === userInfo?._id;

    return (
        <Layout>
            {!!profileInfo && (
                <div>
                    <div className="px-5 pt-2">
                        <TopNavLink title={profileInfo.name}/>
                    </div>
                    <Cover
                        src={profileInfo.cover}
                        editable={isMyProfile}
                        onChange={src => updateUserImage("cover", src)} />
                    <div className="flex justify-between">
                        <div className="ml-5 relative">
                            <div className="absolute -top-12 border-4 rounded-full border-black overflow-hidden">
                                <Avatar
                                    src={profileInfo.image}
                                    big
                                    editable={isMyProfile}
                                    onChange={src => updateUserImage("image", src)} />
                            </div>
                        </div>
                        <div className="p-2">
                            {!isMyProfile && (
                                <div>
                                    <button
                                        onClick={toggleFollow}
                                        className={(isFollowing ? "bg-twitterWhite text-black" : "bg-twitterBlue text-white") + " py-2 px-5 rounded-full"}>
                                        {isFollowing ? "Following": "Follow"}
                                    </button>
                                </div>
                            )}
                            {isMyProfile && (
                                <div>
                                    {!editMode && (
                                        <button onClick={() => setEditMode(true)} className="bg-twitterBlue text-white py-2 px-5 rounded-full">Edit Profile</button>
                                    )}
                                    {editMode && (
                                        <div>
                                            <button onClick={() => cancel()} className="bg-twitterWhite text-black py-2 px-5 rounded-full mr-2">Cancel</button>
                                            <button onClick={() => updateProfile()} className="bg-twitterBlue text-white py-2 px-5 rounded-full">Save Profile</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="px-5 mt-2">
                        {!editMode && (
                            <h1 className="font-bold text-xl leading-5">{profileInfo.name}</h1>
                        )}
                        {editMode && (
                            <div>
                                <input type="text" value={profileInfo.name}
                                    className="bg-twitterBorder p-2 mb-2 rounded-full"
                                    onChange={ev => setProfileInfo(prev => ({...prev, name:ev.target.value}))} />
                            </div>
                        )}

                        {!editMode && (
                            <h2 className="text-twitterLightGray text-sm">@{profileInfo.username}</h2>
                        )}
                        {editMode && (
                            <div>
                                <input type="text" value={profileInfo.username}
                                    className="bg-twitterBorder p-2 mb-2 rounded-full"
                                    onChange={ev => setProfileInfo(prev => ({...prev, username:ev.target.value}))} />
                            </div>
                        )}
                        
                        {!editMode && (
                            <div className="text-sm mt-2 mb-2">{profileInfo.bio}</div>
                        )}
                        {editMode && (
                            <div>
                                <textarea type="text" value={profileInfo.bio}
                                    className="bg-twitterBorder p-2 mb-2 rounded-2xl w-full"
                                    onChange={ev => setProfileInfo(prev => ({...prev, bio:ev.target.value}))} />
                            </div>
                        )}
                    </div>
                </div>
            )}
            {posts?.length > 0 && posts.map(post => (
                <div className="p-5 border-t border-twitterBorder" key={post._id}>
                    {post.parent && (
                        <div className="">
                            <div className="relative pb-10">
                                <div
                                    className="w-0.5 bg-twitterBorder absolute left-5 bottom-0"
                                    style={{marginLeft: "2px", top: "45px"}}></div>
                                <div className="">
                                    <PostContent {...post.parent} likedByMe={parentPostsLikedByMe.includes(post.parent._id)}/>
                                </div>
                            </div>
                        </div>
                    )}
                    <div>
                        <PostContent {...post} likedByMe={postsLikedByMe.includes(post._id)}/>
                    </div>
                </div>
                
            ))}
        </Layout>
    )
}