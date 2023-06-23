const express = require('express');
const router = express.Router();
const data = require('../data');
const postsData = data.posts;
const { ObjectId } = require('mongodb');
const { posts } = require('../data');
const xss = require('xss');
let isAuth = false;

async function errorCheckPost(title, content) {
    if(!title) throw "title parameter not provided";
    if(!content) throw "content parameter not provided";
  
    if(typeof title != "string") throw "title parameter is not a string";
    if(typeof content != "string") throw "content parameter is not a string";

    title = title.trim();
    content = content.trim();

    if(title.length == 0) throw "title parameter is empty";
    if(content.length == 0) throw "content parameter is empty";
}

router.get('/', async (req, res) => {
    let log_in_bool = true
    if (isAuth) {
        log_in_bool = false
    }   
    try{
        return res.status(200).render('pages/home', {title: "Sanjana Madhu", error: false, login: log_in_bool});
    } catch (e) {
        return res.render('pages/error', {title: "Error", error: e, login: log_in_bool});
    }
});

router.get('/posts', async (req, res) => {
    let log_in_bool = true
    let posts
    if (isAuth) {
        log_in_bool = false
    }   
    try{
        posts = await postsData.getAllPosts();
        posts.reverse();
        if (posts.length == 0) {
            return res.status(200).render('pages/displayallposts', {title: "Blog Posts", error: false, login: log_in_bool, isPost: false, post: posts});
        }
        else{
            return res.status(200).render('pages/displayallposts', {title: "Blog Posts", error: false, login: log_in_bool, isPost: true, post: posts});
        }
    } catch (e) {
        return res.render('pages/error', {title: "Error", error: e, login: log_in_bool});
    }
});

router.get('/blogpost/:id', async (req, res) => {
    let post;
    let log_in_bool = true
    if (isAuth) {
        log_in_bool = false
    } 
    try{

        post = await postsData.getPost(req.params.id);
        return res.status(200).render('pages/displayonepost', {title: "Blog Posts", error: false, login: log_in_bool, post: post});
    } catch (e) {
        console.log(e)
        return res.render('pages/error', {title: "Error", error: "This post does not exist"});
    }
});

router.get('/upload', async (req, res) => {
    if (isAuth) {
        try{
            return res.status(200).render('pages/post', {title: "Upload post",  error: false});
        } catch (e) {
            return res.render('pages/error', {title: "Error", error: e});
        }
    }
});

router.post('/upload', async (req, res) => {
    const postDataBody = req.body;
    let post;
    try {
        await errorCheckPost(xss(postDataBody.title), xss(postDataBody.content));
    } catch (e) {
        return res.status(400).render('pages/post', {title: "Upload post", error: true, errorMessage: e});
    }
    try {       
        post = await postsData.createPost(xss(postDataBody.title), xss(postDataBody.content));
      } catch (e) {
        return res.status(400).render('pages/post', {title: "Upload Post", error: true, errorMessage: e});
    }

    try {
        if(post.postInserted == true) {
            return res.redirect('/posts');
        }
    } catch (e) {
        return res.status(500).render('pages/error', {title: "Error", error: "Internal Server Error"});
    }
});

router.get('/login', async (req, res) => {
    if (isAuth) {
        return res.status(200).render('pages/displayallposts', {title: "Home", error: false, login: false});
    }
    try{
        return res.status(200).render('pages/login', {title: "Login", error: false, login: false});
    } catch (e) {
        return res.render('pages/error', {title: "Error", error: e, login: true});
    }
});

router.post('/login', async (req, res) => {
    const userDataBody = req.body;
    if (userDataBody.username == "smadhu" && userDataBody.password == "Thippanna@7186") {
        try {
            isAuth = true;
            return res.status(200).render('pages/post', {title: "Post", error: false, login: false});
        }
        catch(e) {
            return res.render('pages/error', {title: "Error", error: e, login: true});
        }
    }
    else {
        return res.render('pages/error', {title: "Error", error: "Incorrect username or password", login: true});
    }
});

router.get('/logout', async (req, res) => {
    isAuth = false;
    try {
        return res.status(200).render('pages/home', {title: "Home", error: false, login: true});
    }
    catch(e) {
        return res.render('pages/error', {title: "Error", error: "Error", login: true});
    }
});
    
module.exports = router;
