"use client";

import { useState, useRef, useEffect } from "react";
import {
  useGetFollowingFeed,
  useLikePost,
  useRepostPost,
} from "@/services/social/useSocialService";
import PostCard from "./PostCard";
import MediaViewer from "./MediaViewer";
import ReadPostPopup from "./main-popup/ReadPostPopup";
import MutePopup from "./main-popup/MutePopup";
import RequestNotePopup from "./main-popup/RequestNotePopup";
import BlockPopup from "./main-popup/BlockPopup";

interface FollowingPageProps {
  bookmarkedPosts: number[];
  repostedPosts: number[];
  showSharePopup: number | null;
  showMorePopup: number | null;
  showProfilePopup: number | null;
  showRepostPopup: number | null;
  setBookmarkedPosts: React.Dispatch<React.SetStateAction<number[]>>;
  setRepostedPosts: React.Dispatch<React.SetStateAction<number[]>>;
  setShowSharePopup: React.Dispatch<React.SetStateAction<number | null>>;
  setShowMorePopup: React.Dispatch<React.SetStateAction<number | null>>;
  setShowProfilePopup: React.Dispatch<React.SetStateAction<number | null>>;
  setShowRepostPopup: React.Dispatch<React.SetStateAction<number | null>>;
  sharePopupRef: React.RefObject<HTMLDivElement | null>;
  morePopupRef: React.RefObject<HTMLDivElement | null>;
  profilePicRef: React.RefObject<HTMLDivElement | null>;
  profilePopupRef: React.RefObject<HTMLDivElement | null>;
  repostPopupRef: React.RefObject<HTMLDivElement | null>;
  formatNumber: (num: number) => string;
}

export default function FollowingPage({
  bookmarkedPosts,
  showSharePopup,
  showProfilePopup,
  showRepostPopup,
  setBookmarkedPosts,
  setShowSharePopup,
  setShowProfilePopup,
  setShowRepostPopup,
  sharePopupRef,
  repostPopupRef,
  formatNumber,
}: FollowingPageProps) {
  const { data: posts = [], isLoading, error } = useGetFollowingFeed();
  const { mutate: likePostMutation } = useLikePost();
  const { mutate: repostPostMutation } = useRepostPost();

  const [showReadPostPopup, setShowReadPostPopup] = useState<{
    show: boolean;
    content: string;
  }>({ show: false, content: "" });
  const [showMutePopup, setShowMutePopup] = useState<{
    show: boolean;
    username: string;
  }>({ show: false, username: "" });
  const [showRequestNotePopup, setShowRequestNotePopup] = useState(false);
  const [showBlockPopup, setShowBlockPopup] = useState<{
    show: boolean;
    username: string;
  }>({ show: false, username: "" });
  const [expandedMedia, setExpandedMedia] = useState<{
    show: boolean;
    media: string[];
    currentIndex: number;
  } | null>(null);

  const [currentlyPlaying, setCurrentlyPlaying] =
    useState<HTMLVideoElement | null>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleExpandMedia = (media: string[], index: number = 0) => {
    setExpandedMedia({ show: true, media, currentIndex: index });
  };

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (!entry.isIntersecting && !video.paused) {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    videoRefs.current.forEach((video) => {
      if (observerRef.current) {
        observerRef.current.observe(video);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [posts]);

  const handleVideoPlay = (videoElement: HTMLVideoElement) => {
    if (currentlyPlaying && currentlyPlaying !== videoElement) {
      currentlyPlaying.pause();
    }
    setCurrentlyPlaying(videoElement);
  };

  const registerVideo = (videoId: string, element: HTMLVideoElement | null) => {
    if (element) {
      videoRefs.current.set(videoId, element);
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    } else {
      videoRefs.current.delete(videoId);
    }
  };

  const handleLike = (postId: number) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      likePostMutation({ postUuid: post.postId, postPkid: post.id });
    }
  };

  const handleRepost = (postId: number) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      repostPostMutation({ postUuid: post.postId, postPkid: post.id });
    }
  };

  const handleBookmark = (postId: number) => {
    setBookmarkedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading posts...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center p-8 text-red-500">
        Error loading posts
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {posts.slice(0, 4).map((post) => (
        <PostCard
          key={post.id}
          post={post}
          isLiked={post.likedByMe}
          onRepost={handleRepost}
          isBookmarked={bookmarkedPosts.includes(post.id)}
          isReposted={post.repostedByMe}
          showSharePopup={showSharePopup === post.id}
          showProfilePopup={showProfilePopup === post.id}
          showRepostPopup={showRepostPopup === post.id}
          onLike={handleLike}
          onBookmark={handleBookmark}
          onShowSharePopup={(show) => setShowSharePopup(show ? post.id : null)}
          onShowProfilePopup={(show) =>
            setShowProfilePopup(show ? post.id : null)
          }
          onShowRepostPopup={(show) =>
            setShowRepostPopup(show ? post.id : null)
          }
          onReadPost={(content) =>
            setShowReadPostPopup({ show: true, content })
          }
          onMute={(username) => setShowMutePopup({ show: true, username })}
          onRequestNote={() => setShowRequestNotePopup(true)}
          onBlock={(username) => setShowBlockPopup({ show: true, username })}
          onExpandMedia={handleExpandMedia}
          sharePopupRef={sharePopupRef}
          repostPopupRef={repostPopupRef}
          formatNumber={formatNumber}
          registerVideo={registerVideo}
          handleVideoPlay={handleVideoPlay}
          allowVideoControls={true}
        />
      ))}

      {/* Modals */}
      {showReadPostPopup.show && (
        <ReadPostPopup
          onClose={() => setShowReadPostPopup({ show: false, content: "" })}
          postContent={showReadPostPopup.content}
        />
      )}
      {showMutePopup.show && (
        <MutePopup
          onClose={() => setShowMutePopup({ show: false, username: "" })}
          username={showMutePopup.username}
        />
      )}
      {showRequestNotePopup && (
        <RequestNotePopup onClose={() => setShowRequestNotePopup(false)} />
      )}
      {showBlockPopup.show && (
        <BlockPopup
          onClose={() => setShowBlockPopup({ show: false, username: "" })}
          username={showBlockPopup.username}
        />
      )}
      {expandedMedia && (
        <MediaViewer
          media={expandedMedia.media}
          currentIndex={expandedMedia.currentIndex}
          onClose={() => setExpandedMedia(null)}
          onPrevious={() =>
            setExpandedMedia({
              ...expandedMedia,
              currentIndex: expandedMedia.currentIndex - 1,
            })
          }
          onNext={() =>
            setExpandedMedia({
              ...expandedMedia,
              currentIndex: expandedMedia.currentIndex + 1,
            })
          }
        />
      )}
    </div>
  );
}
