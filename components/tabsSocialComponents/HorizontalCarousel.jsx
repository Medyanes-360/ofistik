"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  BiHeart,
  BiBookmark,
  BiComment,
  BiShare,
  BiSolidBookmark,
} from "react-icons/bi";
import { AiFillHeart } from "react-icons/ai";
import CarouselCardHeader from "./carouselCardHeader";
import VideoPlayer from "./videoPlayer";
import CommentForm from "./commentForm";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import SocialImage from "./socialImage";
import { useProfileStore } from "@/store/useProfileStore";

function HorizontalCarousel({ mainPosts, setMainPosts }) {
  const [openFullCaption, setOpenFullCaption] = useState(undefined);
  const [openCommentPage, setOpenCommentPage] = useState(undefined);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [liked, setLiked] = useState(undefined);
  const openCarouselRef = useRef(null);
  const commentRef = useRef(null);
  const popoverRef = useRef(null);
  const dialogContentRef = useRef(null);
  const isMobile = useMediaQuery(1024);
  const openPageId = useProfileStore((state) => state.openPageId);
  const setOpenpageId = useProfileStore((state) => state.setOpenpageId);

  const handleClose = () => {
    setOpenpageId(null);
    setOpenCommentPage(null);
    setOpenFullCaption(undefined);
  };

  const handleSave = (index) => {
    setMainPosts(
      mainPosts.map((post, i) =>
        i === index ? { ...post, saveBook: !post.saveBook } : post
      )
    );
  };

  const handleLiked = (index) => {
    if (mainPosts[index]?.isLiked == false) {
      setLiked(index);
    }

    // Beğeni animasyonunu geri almak için bir süre bekleyebilirsiniz.
    setTimeout(() => {
      setLiked(undefined);
    }, 1000);
    setMainPosts(
      mainPosts.map((post, i) =>
        i === index ? { ...post, isLiked: !post.isLiked } : post
      )
    );
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        !(
          dialogContentRef.current &&
          dialogContentRef.current.contains(e.target)
        ) &&
        !(
          dialogContentRef.current &&
          !dialogContentRef.current.contains(e.target)
        ) &&
        !(popoverRef.current && popoverRef.current.contains(e.target)) &&
        openCarouselRef.current &&
        !openCarouselRef.current.contains(e.target)
      ) {
        if (openCommentPage == undefined && openCommentPage == null) {
          handleClose();
        }
      }
    };
    const closeCommentPage = (e) => {
      if (
        (openCommentPage != null || openCommentPage != undefined) &&
        commentRef.current &&
        !commentRef.current.contains(e.target)
      ) {
        setOpenCommentPage(undefined);
      }
    };

    // Event listener'ı ekleyin
    document.addEventListener("mousedown", handleOutsideClick);
    document?.addEventListener("mousedown", closeCommentPage);
    // Temizlik işlemi
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document?.removeEventListener("mousedown", closeCommentPage);
    };
  }, [handleClose]);

  const handleFocus = (index) => {
    document?.querySelectorAll(".commentInput")[index]?.focus();
  };

  useEffect(() => {
    if (openPageId == null) {
      document.body.style.overflow = "auto";
    } else {
      document.body.style.overflow = "hidden";
    }

    const carousel = openCarouselRef?.current?.childNodes[0];
    let totalHeight = carousel?.scrollHeight;
    for (let i = 0; i < mainPosts.length; i++) {
      totalHeight -= carousel?.childNodes[i].scrollHeight;
    }
    const carouselGapHeight = totalHeight / (mainPosts.length - 1);

    let startHeigth = 0;
    for (let i = 0; i < openPageId; i++) {
      startHeigth += carousel?.childNodes[i].scrollHeight;
    }
    carousel?.scrollTo({
      top: openPageId == 0 ? 0 : startHeigth + carouselGapHeight * openPageId,
      left: 0,
    });
  }, [openPageId]);

  const timeStamp = (targetDate) => {
    const currentDate = new Date();
    const targetDateTime = new Date(targetDate);
    const differenceInMilliseconds = currentDate - targetDateTime;
    const differenceInSeconds = differenceInMilliseconds / 1000;
    const differenceInMinutes = differenceInSeconds / 60;
    const differenceInHours = differenceInMinutes / 60;
    const differenceInDays = differenceInHours / 24;

    return differenceInDays >= 1
      ? `${Math.floor(differenceInDays)} gün önce`
      : differenceInHours >= 1
      ? `${Math.floor(differenceInHours)} saat önce`
      : differenceInMinutes >= 1
      ? `${Math.floor(differenceInMinutes)} dakika önce`
      : differenceInSeconds >= 1
      ? `${Math.floor(differenceInSeconds)} saniye önce`
      : "az önce";
  };

  return (
    <>
      <div
        className={`w-full h-screen fixed  top-0 left-0 bg-white/60 backdrop-blur-sm flex justify-center items-end z-[45] md:items-center ${
          openPageId != null ? "block" : "hidden"
        }`}
      >
        <div
          id="openCarousel"
          className="w-full max-w-fit lg:h-[85vh] lg:max-w-[70%] relative lg:rounded-lg sm:mt-0"
          ref={openCarouselRef}
        >
          <div
            className={` flex flex-col overflow-y-auto lg:gap-6 w-full max-w-[500px] h-full sm:w-[550px] max-h-[95vh] md:max-h-[85vh]  lg:max-w-full lg:w-full mt-8`}
          >
            {mainPosts.map((post, index) => (
              <div key={index} className={` pt-1 basis-1 relative h-full lg:`}>
                <div
                  className={`lg:grid grid-cols-2   bg-primary rounded-lg h-fit  `}
                >
                  <CarouselCardHeader
                    options={2}
                    post={post}
                    openCommentPage={openCommentPage}
                    openCarouselRef={openCarouselRef}
                    type={"horizontalPage"}
                    popoverRef={popoverRef}
                    dialogContentRef={dialogContentRef}
                    className={
                      "h-fit flex col-start-2 lg:border-b md:items-center px-4 xl:px-5"
                    }
                  />
                  <div
                    className={`post flex items-center relative row-span-3 row-start-1  lg:rounded-lg `}
                    id={index}
                  >
                    {post.video_url ? (
                      <VideoPlayer
                        url={post.video_url}
                        index={index}
                        handleLiked={handleLiked}
                        loading="lazy"
                        isVideoMuted={isVideoMuted}
                        setIsVideoMuted={setIsVideoMuted}
                      />
                    ) : (
                      <SocialImage
                        post={post}
                        index={index}
                        handleLiked={handleLiked}
                      />
                    )}
                    <AiFillHeart
                      className={`
                                            ${
                                              liked == index
                                                ? "scale-[10]"
                                                : "scale-0"
                                            }
                                            absolute
                                            transition-all
                                            duration-300 
                                            top-1/2 left-1/2
                                            transform
                                            -translate-x-1/2
                                            -translate-y-1/2
                                            text-red-600
                                            opacity-80
                                            `}
                    />
                  </div>
                  <div className="hidden lg:flex flex-col px-4 xl:px-5 py-4 border-b min-h-[30vh] h-full max-h-[30vh] overflow-x-hidden overflow-y-auto col-start-2 ">
                    <div className="">
                      <div className={`h-fit`} id={post.comments[0]?.id}>
                        <span className="mr-2 text-white">{post.username}</span>
                        <span className={`text-white/80 whitespace-wrap`}>
                          {post.caption.length <= 100 ? (
                            post.caption
                          ) : openFullCaption == index ? (
                            post.caption
                          ) : (
                            <>
                              <span>{post.caption.slice(0, 90)}... </span>
                              <span
                                onClick={() => {
                                  setOpenFullCaption(index);
                                }}
                                className="text-cyan-200 hover:text-cyan-400 cursor-pointer"
                              >
                                devamını gör
                              </span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="ml-2 mt-2 text-white">
                      {post.comments != 0 ? (
                        post.comments.map((comment, index) => (
                          <div key={index} className="mt-2  ">
                            <span>{comment.username}</span>{" "}
                            <span className="text-white/80 max-w-[300px] h-fit whitespace-wrap">
                              {comment.comment}{" "}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center">No comment yet.</div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 text-white h-fit py-2 col-start-2 col-span-1 ">
                    <div className="flex justify-between xl:text-xl 2xl:text-2xl px-2 ">
                      <div className="flex gap-3 ">
                        <button
                          className="cursor-pointer active:scale-90 transition-all duration-150"
                          onClick={() => handleLiked(index)}
                        >
                          {post.isLiked ? (
                            <AiFillHeart
                              className="md:stroke-1 stroke-red-500  text-red-500"
                              size={24}
                            />
                          ) : (
                            <BiHeart className="md:stroke-1" size={24} />
                          )}
                        </button>
                        <button
                          className="cursor-pointer active:scale-90"
                          onClick={() => {
                            isMobile && setOpenCommentPage(index);
                            handleFocus(index);
                          }}
                        >
                          <BiComment className="md:stroke-1" size={24} />
                        </button>
                        <button className="cursor-pointer active:scale-90">
                          <BiShare className="md:stroke-1" size={24} />
                        </button>
                      </div>
                      <div>
                        <button
                          className="cursor-pointer active:scale-90"
                          onClick={() => handleSave(index)}
                        >
                          {post.saveBook ? (
                            <BiSolidBookmark
                              className="md:stroke-1"
                              size={24}
                            />
                          ) : (
                            <BiBookmark className="md:stroke-1" size={24} />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="text-white px-2">
                      <span>{post.likes} beğenme,</span>{" "}
                      <button
                        onClick={() => {
                          setOpenCommentPage(index);
                          handleFocus(index);
                        }}
                      >
                        {post.comments.length} yorum
                      </button>
                    </div>
                    <div
                      className={`block lg:hidden h-fit px-2`}
                      id={post.comments[0]?.id}
                    >
                      <span className="mr-2">{post.username}</span>
                      <span className={`text-white/80 whitespace-wrap`}>
                        {openFullCaption == index ? (
                          post.caption
                        ) : (
                          <>
                            <span>{post.caption.slice(0, 18)}... </span>
                            <span
                              onClick={() => {
                                setOpenFullCaption(index);
                              }}
                              className="text-cyan-200 hover:text-cyan-400 cursor-pointer"
                            >
                              devamını gör
                            </span>
                          </>
                        )}{" "}
                      </span>
                    </div>
                    <div className="text-white px-2">
                      {timeStamp(post.timestamp)}
                    </div>
                    <div className="hidden lg:block border-t">
                      <CommentForm
                        posts={mainPosts}
                        index={index}
                        setMainPosts={setMainPosts}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            className="w-4 h-4 md:w-6 md:h-6 rounded-md p-4 cursor-pointer transition-all duration-700  bg-gray-200/50 hover:bg-red-500 group absolute right-0 top-0"
            onClick={() => handleClose()}
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 512 512"
              className="text-txtRed transition-all duration-700 rotate-180 flex absolute group-hover:opacity-0 group-hover:rotate-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              height="30"
              width="30"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M289.94 256l95-95A24 24 0 00351 127l-95 95-95-95a24 24 0 00-34 34l95 95-95 95a24 24 0 1034 34l95-95 95 95a24 24 0 0034-34z"></path>
            </svg>
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              className="text-white rotate-0 transition-all duration-700 opacity-0 group-hover:block group-hover:rotate-180 group-hover:opacity-100 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              height="30"
              width="30"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4.5 12.75a.75.75 0 0 1 .75-.75h13.5a.75.75 0 0 1 0 1.5H5.25a.75.75 0 0 1-.75-.75Z"></path>
            </svg>
          </div>
        </div>
        {isMobile && (
          <div
            className={`${
              openCommentPage != undefined && isMobile
                ? "flex lg:hidden backdrop-blur-[2px]  "
                : "hidden"
            } z-[999] flex-col absolute justify-center  items-center  w-full  h-screen text-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
          >
            <div
              ref={commentRef}
              className="relative bg-black w-10/12 rounded-md max-w-[400px]"
            >
              <div className="flex justify-between p-3 border-b border-input items-center">
                <span>{mainPosts[openCommentPage]?.comments.length} yorum</span>
                <button
                  className="
                        border
                        border-input
                        text-black
                        bg-background
                        hover:bg-accent
                        hover:text-accent-foreground
                        w-8 h-8
                        rounded-full
                        "
                  onClick={() => {
                    setOpenCommentPage(undefined);
                  }}
                >
                  X
                </button>
              </div>
              <div
                className={`flex flex-col px-3 overflow-y-auto overflow-x-hidden max-h-[400px] `}
              >
                {mainPosts[openCommentPage]?.comments.length != 0 ? (
                  mainPosts[openCommentPage]?.comments.map((comment, index) => (
                    <div key={index} className="mt-2  ">
                      <span>{comment.username}</span>{" "}
                      <span className="text-white/80 max-w-[300px] h-fit whitespace-wrap">
                        {comment.comment}{" "}
                      </span>
                    </div>
                  ))
                ) : (
                  <span>hiç yorum yok.</span>
                )}
              </div>
              <div>
                <CommentForm
                  posts={mainPosts}
                  index={openCommentPage}
                  setMainPosts={setMainPosts}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default HorizontalCarousel;
