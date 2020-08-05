require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const encrypt = require('mongoose-encryption');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

mongoose.connect('mongodb+srv://Abdus:21@cluster0.r2uaj.mongodb.net/wiseDB', {useNewUrlParser : true, useUnifiedTopology: true, useFindAndModify: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  }
});

const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  }
});

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Comment = mongoose.model('Comment', commentSchema);

app.route('/')
   .get(function(req, res){
     res.sendFile(__dirname + '/login.html');
   })
   .post(function(req, res){
     //check login conditions
     const name = req.body.name;
     const password = req.body.password;

     User.findOne({name: name}, function(err, foundUser){
       if(err){
         console.log(err);
         }else{
           if(foundUser){
             if(foundUser.password === password){
               res.redirect('/main');
             }else{
               res.redirect('/');
             }
           }else{
             res.redirect('/');
           }
         }
     });
   });

app.route('/main')
   .get(function(req, res){
     Post.find({}, function(err, postList){
       if(!err){
         res.render('main', {postList: postList});
       }
     });
   });

app.route('/compose')
   .get(function(req, res){
     res.render('compose');
   })
   .post(function(req, res){
     //manipulate mongoose
     const title = req.body.postTitle;
     const body = req.body.postBody;

     const post = new Post({
       title: title,
       body: body
     });

     post.save();

     res.redirect('/main');
   });


app.route('/sign')
   .post(function(req, res){
     res.sendFile(__dirname + '/signup.html');
   });

app.route('/signup')
   .post(function(req, res){
     const name = req.body.name;
     const password = req.body.password;

     const user = new User({
       name: name,
       password: password
     });

     user.save();
     console.log('Successfully saved user info to database...');

     res.redirect('/');
   });

app.route('/comments')
   .get(function(req, res){
     Comment.find({}, function(err, commentList){
       if(!err){
         res.render('comments', {commentList: commentList});
       }else{
         console.log(err);
       }
     });
   })
   .post(function(req, res){
     const commentBody = req.body.commentBody;
     const commentAuthor = req.body.commentAuthor;

     const newComment = new Comment({
       comment: commentBody,
       author: commentAuthor
     });
     newComment.save();

     res.redirect('/comments');
   });

app.listen(3000, function(){
  console.log('Server started on port 3000 ...');
});
