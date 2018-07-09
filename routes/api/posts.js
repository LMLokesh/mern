const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Importing Models
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

// Validation
const validatePostInput = require("../../validation/post");

// @route GET api/posts/test
// @desc Tests post route
// @access Pulbic
router.get("/test", (req, res) => res.json({ msg: "posts test  works" }));

// @route Get api/posts
// @desc Getting Posts
// @access Public
router.get("/", (req, res) => {
  Post.find(req.params.id)
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ noPostsFound: "No Posts found" }));
});
// @route Get api/posts/:id
// @desc Getting Post
// @access Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .sort({ data: -1 })
    .then(posts => res.json(posts))
    .catch(err =>
      res.status(404).json({ noPostFound: "No Post found by that ID" })
    );
});
// @route POST api/posts
// @desc Create Post
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    //Checking Validation
    if (!isValid) {
      // if any errors, send 400 with errors
      return res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.name,
      user: req.user.id
    });
    newPost.save().then(post => res.json(post));
  }
);
// @route Delete api/posts/:id
// @desc Delete Post
// @access Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findById(req.user.id)
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            // Check for post Owner
            if (post.user != req.user.id) {
              return res
                .status(401)
                .json({ notAutherized: "User not authorized" });
            }
            // Delete
            post.remove().then(() => {
              res.json({ success: true });
            });
          })
          .catch(err => res.status(404).json({ noFound: "Post not found" }));
      })
      .catch(err => res.status(404).json({ noFound: "Profile not found" }));
  }
);
// @route Post api/posts/like/:id
// @desc Likes Post
// @access Private
router.post(
  "/likes/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findById(req.user.id)
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            if (
              post.likes.filter(like => like.user.toString() === req.user.id)
                .length > 0
            ) {
              return res
                .status(400)
                .json({ alreadyliked: "User already liked this post" });
            }
            // Add user id to likes array
            post.likes.unshift({ user: req.user.id });
            //save
            post.save().then(post => res.json(post));
          })
          .catch(err => res.status(404).json({ noFound: "Post not found" }));
      })
      .catch(err => res.status(404).json({ noFound: "Profile not found" }));
  }
);
// @route Post api/posts/un-like/:id
// @desc un-likes Post
// @access Private
router.post(
  "/un-likes/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findById(req.user.id)
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            if (
              post.likes.filter(like => like.user.toString() === req.user.id)
                .length === 0
            ) {
              return res
                .status(400)
                .json({ noliked: "User have not yet liked this post" });
            }
            // Remove user id to likes array
            const removeIndex = post.likes
              .map(item => item.user.toString())
              .indexOf(req.user.id);
            //Splice out of array
            post.likes.splice(removeIndex, 1);
            //save
            post.save().then(post => res.json(post));
          })
          .catch(err => res.status(404).json({ noFound: "Post not found" }));
      })
      .catch(err => res.status(404).json({ noFound: "Profile not found" }));
  }
);
// @route Post api/posts/comment/:id
// @desc Add Comment to Post
// @access Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    //Checking Validation
    if (!isValid) {
      // if any errors, send 400 with errors
      return res.status(400).json(errors);
    }
    Profile.findById(req.user.id).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          const newComment = {
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user.id
          };
          // Add to comments array
          post.comments.unshift(newComment);

          // Save
          post.save().then(post => res.json(post));
        })
        .catch(err =>
          res.status(404).json({ postnotfound: "Post is not found" })
        );
    });
  }
);
// @route Delete api/posts/comment/:id/:comment_id
// @desc Remove Comment from Post
// @access Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        // Check to see if comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: "Comment does not exists " });
        }

        // Get Remove index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        // splice comment out of array
        post.comments.splice(removeIndex, 1);

        post.save().then(post => res.json(post));
      })
      .catch(err => res.json({ postnotfound: "Requested post is not found" }));
  }
);
module.exports = router;
