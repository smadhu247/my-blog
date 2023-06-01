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
    try{
        return res.status(200).render('pages/home', {title: "Sanjana Madhu", error: false});
    } catch (e) {
        return res.render('pages/error', {title: "Error", error: e});
    }

});

router.get('/posts', async (req, res) => {
    try{
        postId = await postsData.getAllPosts();
        return res.status(200).render('pages/displayallposts', {title: "Sanjana Madhu", error: false});
    } catch (e) {
        return res.render('pages/error', {title: "Error", error: e});
    }
});

router.get('/title', async (req, res) => {

    try{
        postId = await postsData.getPostIdFromTitle(req.params.title);
    } catch (e) {
        return res.render('pages/error', {title: "Error", error: e});
    }
});

async function errorCheckLogin(username, password) {

    if(!username) throw "username parameter not provided";
    if(!password) throw "password parameter not provided";

    if(typeof username != "string") throw "username parameter is not a string";
    if(typeof password != "string") throw "password parameter is not a string";

    username = username.toLowerCase();
    username = username.trim();
    password = password.trim();

    if(username.length == 0) throw "username parameter is empty";
    if(password.length == 0) throw "password parameter is empty";

    if(username.length < 4) throw "username must be at least 4 characters long";
    if(password.length < 6) throw "password must be at least 6 characters long"; 

    if(/\s/.test(username)) throw "username should not contain spaces"
    if(/\s/.test(password)) throw "password should not contain spaces"

    var alphaNumerics = /^[0-9a-zA-Z]+$/;
    if(!username.match(alphaNumerics)) throw "username can only contain alphanumeric characters"
}

router.get('/upload', async (req, res) => {
    if (!isAuth) {
        try{
            return res.status(200).render('pages/signin', {title: "Sign in",  error: false});
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
        user = await postsData.createPost(xss(postDataBody.title), xss(postDataBody.content));
      } catch (e) {
        return res.status(400).render('pages/post', {title: "Upload Post", error: true, errorMessage: e});
    }

    try {
        if(post.postInserted == true) {
            return res.redirect('/displayonepost', {title: "Posts"});
        }
    } catch (e) {
        return res.status(500).render('pages/error', {title: "Error", error: "Internal Server Error"});
    }
});

router.get('/login', async (req, res) => {
    if (isAuth) {
        return res.status(200).render('pages/displayallposts', {title: "Home", error: false});
    }
    try{
        return res.status(200).render('pages/login', {title: "Login", error: false});
    } catch (e) {
        return res.render('pages/error', {title: "Error", error: e});
    }
});

router.post('/login', async (req, res) => {
    const userDataBody = req.body;
    try {
        await errorCheckLogin(xss(userDataBody.username), xss(userDataBody.password));
    } catch (e) {
        return res.status(400).render('pages/login', {title: "Login", error: true, errorMessage: e});
    }
    if (userDataBody.username == "smadhu" && userDataBody.password == "Thippanna@7186") {
        try {
            isAuth = true;
            return res.status(200).render('pages/displayallposts', {title: "Home", error: false});
        }
        catch(e) {
            return res.render('pages/error', {title: "Error", error: e});
        }
    }
    else {
        return res.render('pages/error', {title: "Error", error: "Incorrect username or password"});
    }
});

router.get('/logout', async (req, res) => {
    req.session.destroy();
    try {
        return res.status(200).render('pages/home', {title: "Home", error: false});
    }
    catch(e) {
        return res.render('pages/error', {title: "Error", error: "Error"});
    }
});
    
module.exports = router;
