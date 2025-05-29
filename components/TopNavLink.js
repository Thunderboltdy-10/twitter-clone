import Link from "next/link";
import { useRouter } from "next/router";

export default function TopNavLink({title="Tweet", url="/"}) {
    const router = useRouter();

    return (
        <button onClick={() => router.back()}>
            <div className="flex mb-2 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mr-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                {title}
            </div>
        </button>
    )
}