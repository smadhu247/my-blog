const mongoCollections = require('../config/mongoCollections');
const posts = mongoCollections.posts;
const bcrypt = require ('bcrypt');
const { ObjectId } = require('mongodb');
const { get } = require('express/lib/request');

async function createPost(title, content, date) {

    if(!title) throw "title parameter not provided";
    if(!content) throw "content parameter not provided";
    if(!date) throw "content parameter not provided";

    if(typeof title != "string") throw "title parameter is not a string";
    if(typeof content != "string") throw "content parameter is not a string";

    title = title.trim();
    content = content.trim();

    if(title.length == 0) throw "title parameter is empty";
    if(content.length == 0) throw "content parameter is empty";
    if(date.length == 0) throw "content parameter is empty";

    const postsCollection = await posts();
    const post = await postsCollection.findOne({ title: title });

    // let today = new Date().toISOString().slice(0, 10)

    let newPost = {
        title: title,
        content: content,
        date: date,
        author: "Sanjana Madhu",
    };

    const insertInfo = await postsCollection.insertOne(newPost);
    if (insertInfo.insertedCount === 0) throw 'could not add post to the database';

    let obj = {postInserted: true}
    return obj;
}

async function getAllPosts() {
    const postsCollection = await posts();
    const postsList = await postsCollection.find({ }).sort({date:1}).toArray();

    console.log(postsList)

    for(let i = 0; i < postsList.length; i++) {
        let id = postsList[i]._id.toString();
        postsList[i]._id = id.toString();
    }

    return postsList;
}

async function getPost(postId) {

    if(!postId) throw "postId parameter not provided";
    if(typeof postId != "string") throw "postId is not a string";
    postId = postId.trim();
    if(postId.length == 0) throw "postId is an empty string";

    if(!ObjectId.isValid(postId)) throw "postId provided is not a valid ObjectId";

    const postsCollection = await posts();
    const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
    if (post === null) throw 'No post with that id';
    post._id = post._id.toString();
    return post;
}

async function getPostIdFromTitle(title) {

    if(!title) throw "title parameter not provided";
    if(typeof title != "string") throw "title is not a string";
    title = title.trim();
    if(title.length == 0) throw "title is an empty string";

    const postsCollection = await posts();
    const post = await postsCollection.findOne({ title: title });
    if (post === null) throw 'No post with that title';

    let postId = post._id.toString();

    return postId;
}

async function removePost(postId) {
    if(!postId) throw "postId parameter not provided";
    if(typeof postId != "string") throw "postId is not a string";
    postId = postId.trim();
    if(postId.length == 0) throw "postId is an empty string";

    if(!ObjectId.isValid(postId)) throw "postId provided is not a valid ObjectId";

    const postsCollection = await posts();

    const post = await this.get(postId);
    let title = post.title;

    const deletionInfo = await postsCollection.deleteOne({ _id: ObjectId(postId) });

    if (deletionInfo.deletedCount === 0) {
      throw `Could not delete post with id of ${postId}`;
    }

    return title + " has been successfully deleted!"; 
}

async function updatePost(postId, title, content) {

    if(!title) throw "title parameter not provided";
    if(!content) throw "content parameter not provided";

    if(typeof title != "string") throw "title parameter is not a string";
    if(typeof content != "string") throw "content parameter is not a string";

    title = title.trim();
    content = content.trim();

    if(title.length == 0) throw "title parameter is empty";
    if(content.length == 0) throw "content parameter is empty";

    const postsCollection = await posts();
    const updatedPostData = {};

    updatedPostData.title = title;
    updatedPostData.content = content;

    await postsCollection.updateOne({ _id: ObjectId(postId) }, { $set: updatedPostData });

    return "Post has been updated";
}

module.exports = {
    createPost,
    getAllPosts,
    getPost,
    getPostIdFromTitle,
    removePost,
    updatePost
}