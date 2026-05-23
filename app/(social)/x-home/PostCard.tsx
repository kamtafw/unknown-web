"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { EllipsisVertical, Repeat } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ProfilePopup from "./main-popup/ProfilePopup";
import MoreOptionsPopup from "./main-popup/MoreOptionsPopup";
import MediaGallery from "./MediaGallery";
import PostActions from "./PostActions";

interface Post {
  id: number;
  name: string;
  username: string;
  time: string;
  location: string;
  content: string;
  media: string[];
  profilePic: string;
  likes: number;
  comments: number;
  reposts: number;
  isRepost?: boolean;
  originalPost?: {
    id: number;
    name: string;
    username: string;
    time: string;
    location: string;
    content: string;
    media: string[];
    profilePic: string;
    likes: number;
    comments: number;
    reposts: number;
  } | null;
}

interface PostCardProps {
  post: Post;
  isLiked: boolean;
  isBookmarked: boolean;
  onRepost: (postId: number) => void;
  isReposted: boolean;
  showSharePopup: boolean;
  showProfilePopup: boolean;
  showRepostPopup: boolean;
  onLike: (postId: number) => void;
  onBookmark: (postId: number) => void;
  onShowSharePopup: (show: boolean) => void;
  onShowProfilePopup: (show: boolean) => void;
  onShowRepostPopup: (show: boolean) => void;
  onReadPost: (content: string) => void;
  onMute: (username: string) => void;
  onRequestNote: () => void;
  onBlock: (username: string) => void;
  onExpandMedia: (media: string[], index: number) => void;
  sharePopupRef: React.RefObject<HTMLDivElement | null>;
  repostPopupRef: React.RefObject<HTMLDivElement | null>;
  formatNumber: (num: number) => string;
  registerVideo?: (videoId: string, element: HTMLVideoElement | null) => void;
  handleVideoPlay?: (videoElement: HTMLVideoElement) => void;
  allowVideoControls?: boolean;
}

export default function PostCard({
  post,
  isLiked,
  isBookmarked,
  onRepost,
  isReposted,
  showSharePopup,
  showProfilePopup,
  showRepostPopup,
  onLike,
  onBookmark,
  onShowSharePopup,
  onShowProfilePopup,
  onShowRepostPopup,
  onReadPost,
  onMute,
  onRequestNote,
  onBlock,
  onExpandMedia,
  sharePopupRef,
  repostPopupRef,
  formatNumber,
  registerVideo,
  handleVideoPlay,
  allowVideoControls = true,
}: PostCardProps) {
  const router = useRouter();

  const handlePostClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "VIDEO" ||
      target.tagName === "IMG" ||
      target.tagName === "BUTTON" ||
      target.closest("button") ||
      target.closest("video") ||
      target.closest("img")
    ) {
      return;
    }
    router.push("/home/post");
  };

  return (
    <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4 hover:bg-gray-50/50 transition-colors">
      {post.isRepost && (
        <div className="flex items-center gap-2 mb-2 text-gray-500">
          <Repeat className="h-4 w-4" />
          <span className="text-sm font-medium">{post.name} reposted</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="flex items-start flex-1 min-w-0">
          <div className="relative">
            <div
              className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0 group"
              onMouseEnter={() => onShowProfilePopup(true)}
              onMouseLeave={() => {
                setTimeout(() => {
                  onShowProfilePopup(false);
                }, 100);
              }}
            >
              <Image
                src={
                  post.isRepost && post.originalPost
                    ? post.originalPost.profilePic
                    : post.profilePic
                }
                alt={
                  post.isRepost && post.originalPost
                    ? post.originalPost.name
                    : post.name
                }
                width={48}
                height={48}
                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
              />
            </div>
            {showProfilePopup && (
              <div
                className="absolute top-0 left-0 z-50"
                onMouseEnter={() => onShowProfilePopup(true)}
                onMouseLeave={() => onShowProfilePopup(false)}
              >
                <ProfilePopup
                  name={
                    post.isRepost && post.originalPost
                      ? post.originalPost.name
                      : post.name
                  }
                  username={
                    post.isRepost && post.originalPost
                      ? post.originalPost.username
                      : post.username
                  }
                  profilePic={
                    post.isRepost && post.originalPost
                      ? post.originalPost.profilePic
                      : post.profilePic
                  }
                  location={
                    post.isRepost && post.originalPost
                      ? post.originalPost.location
                      : post.location
                  }
                  onClose={() => onShowProfilePopup(false)}
                />
              </div>
            )}
          </div>
          <div className="ml-2 sm:ml-3 flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-1">
              <button
                className="font-semibold text-sm sm:text-base hover:underline truncate"
                onClick={() => router.push(`/home/social-profile`)}
                aria-label={`View ${
                  post.isRepost && post.originalPost
                    ? post.originalPost.name
                    : post.name
                }'s profile`}
              >
                {post.isRepost && post.originalPost
                  ? post.originalPost.name
                  : post.name}
              </button>
              <span className="text-xs sm:text-sm text-gray-500 truncate">
                {post.isRepost && post.originalPost
                  ? post.originalPost.username
                  : post.username}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {post.isRepost && post.originalPost
                ? post.originalPost.time
                : post.time}{" "}
              ·{" "}
              {post.isRepost && post.originalPost
                ? post.originalPost.location
                : post.location}
            </p>
          </div>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="p-1 rounded-full hover:bg-gray-100 flex-shrink-0 ml-2"
              aria-label="More options"
            >
              <EllipsisVertical className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 p-0" asChild>
            <div>
              <MoreOptionsPopup
                username={post.username}
                postContent={post.content}
                onReadPost={(content: string) => {
                  onReadPost(content);
                  const trigger = document.querySelector('[data-state="open"]');
                  if (trigger) {
                    (trigger as HTMLElement).click();
                  }
                }}
                onMute={onMute}
                onRequestNote={onRequestNote}
                onBlock={onBlock}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div
        className={`ml-0 sm:ml-0 ${allowVideoControls ? "cursor-pointer" : ""}`}
        onClick={allowVideoControls ? handlePostClick : undefined}
      >
        <p className="text-sm sm:text-base text-gray-900 mb-2 sm:mb-3 leading-relaxed">
          {post.isRepost && post.originalPost
            ? post.originalPost.content
            : post.content}
        </p>

        <MediaGallery
          media={
            post.isRepost && post.originalPost
              ? post.originalPost.media
              : post.media
          }
          postId={post.id}
          onExpandMedia={onExpandMedia}
          registerVideo={registerVideo}
          handleVideoPlay={handleVideoPlay}
          allowVideoControls={allowVideoControls}
          onClick={
            allowVideoControls ? undefined : () => router.push("/home/post")
          }
        />

        <PostActions
          post={post}
          isLiked={isLiked}
          onRepost={onRepost}
          isBookmarked={isBookmarked}
          isReposted={isReposted}
          showSharePopup={showSharePopup}
          showRepostPopup={showRepostPopup}
          onLike={onLike}
          onBookmark={onBookmark}
          onShowSharePopup={onShowSharePopup}
          onShowRepostPopup={onShowRepostPopup}
          sharePopupRef={sharePopupRef}
          repostPopupRef={repostPopupRef}
          formatNumber={formatNumber}
        />
      </div>
    </div>
  );
}
