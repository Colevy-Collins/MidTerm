var fs=require('fs');
var path=require('path');
var express=require('express');
var session=require('express-session');
var bodyParser=require('body-parser');
const bcrypt=require('bcrypt');
var port=5199;

var app=express();
app.use(express.static(path.join(__dirname,'static_files')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(session({secret:'my password'}));

// functions to check user Authinication

// this function checks if user is loged in
function checkIfUserIsSignedIn(req,res,next){
	console.log(req.session.user);
	if(req.session.user){
		next();
	}else{
		res.send('not signed in');
		return;
	}
}

// this fuction checks if user is an admin
function checkIfUserIsAdmin(req,res,next){
	if(req.session.user.role==1) next();
	else{
		res.send('you are not allowed here');
		return;
	}
}
//get the html page that displays post depending on user level

// this retives the public html file 
app.get('/',function(req,res,next){
	fs.readFile('public.html',function(err,data){
		res.send(data.toString());
	});
});

// this retives the private html file 
app.get('/private',checkIfUserIsSignedIn,function(req,res,next){
	fs.readFile('private.html',function(err,data){
		res.send(data.toString());
	});
});

// this retives the admin html file 
app.get('/admin',checkIfUserIsSignedIn,checkIfUserIsAdmin,function(req,res,next){
	fs.readFile('admin.html',function(err,data){
		res.send(data.toString());
	});
});

//this retives the private post html file
app.get('/private/posts',checkIfUserIsSignedIn,function(req,res,next){
	fs.readFile('private_posts.html',function(err,data){
		res.send(data.toString());
	});
});

//this retives the private edit post html file
app.get('/private/edit/posts',checkIfUserIsSignedIn,function(req,res,next){
	fs.readFile('private_post_edit.html',function(err,data){
		res.send(data.toString());
	});
});

//this retives the admin edit html file
app.get('/admin/edit',checkIfUserIsSignedIn,checkIfUserIsAdmin,function(req,res,next){
	fs.readFile('admin_edit.html',function(err,data){
		res.send(data.toString());
	});
});

//gets the aretical.html of post depending on user level

// this retives the public artical html file 
app.get('/artical',function(req,res,next){
	fs.readFile('artical.html',function(err,data){
		res.send(data.toString());
	});
});

// this retives the private artical html file 
app.get('/private/artical',function(req,res,next){
	fs.readFile('privateartical.html',function(err,data){
		res.send(data.toString());
	});
});

// this retives the admin artical html file 
app.get('/admin/artical',checkIfUserIsSignedIn,checkIfUserIsAdmin,function(req,res,next){
	fs.readFile('articaladmin.html',function(err,data){
		res.send(data.toString());
	});
});

// gets post data on posts for the diffrent user level

// this retives the post data for the public html file 
app.get('/API/allposts',function(req,res,next){
	let users =JSON.parse(fs.readFileSync('data/users.json'));
	fs.readFile('data/posts.json',function(err,data){
		let posts=JSON.parse(data.toString());
		for(let i=0;i<posts.length;i++){
			if(posts[i].status != 0){
				posts[i]={};
			}else{
				posts[i].author = users[posts[i].authorID].firstname;
			}
		}
		console.log(posts);
		res.json(posts);
		
		return;
	});
});

// this retives the post data for the private html file 
app.get('/API/private/allposts',checkIfUserIsSignedIn,function(req,res,next){
	fs.readFile('data/posts.json',function(err,data){
		let users =JSON.parse(fs.readFileSync('data/users.json'));
		console.log(users);
		let posts=JSON.parse(data.toString());
		console.log(req.session.user.ID);
		for(let i=0;i<posts.length;i++){
			console.log(posts[i].ID);
			if(req.session.user.ID != posts[i].authorID){
				posts[i]={};
			}else{
				posts[i].author = users[req.session.user.ID].firstname;
			}
		}
		res.json(posts);
		
		return;
	});
});

// this retives the post data for the admin html file 
app.get('/API/admin/allposts',checkIfUserIsSignedIn,checkIfUserIsAdmin,function(req,res,next){
	fs.readFile('data/posts.json',function(err,data){
		let posts=JSON.parse(data.toString());
		for(let i=0;i<posts.length;i++){
			if(posts[i].status < 0){
				posts[i]={};
			}
		}
		res.json(posts);
		
		return;
	});
});

// gets the corresponding artical html data for the diffrent user levels

// this retives the post data for the public artical html file 
app.get('/API/oneposts',function(req,res,next){
	console.log(req.query.index);
	fs.readFile('data/posts.json',function(err,data){
		let index = req.query.index;
		let posts=JSON.parse(data.toString());
	    res.json(posts[index]);
		return;
	});
});

// this retives the post data for the private artical html file 
app.get('/API/private/oneposts',checkIfUserIsSignedIn,function(req,res,next){
	console.log(req.query.index);
	let users =JSON.parse(fs.readFileSync('data/users.json'));
	fs.readFile('data/posts.json',function(err,data){
		let index = req.query.index;
		let posts=JSON.parse(data.toString());
		let post=posts[index]
		post.author = users[req.session.user.ID].firstname;
	    res.json(post);
		return;
	});
});

// this retives the post data for the admin artical html file 
app.get('/API/admin/oneposts',checkIfUserIsSignedIn,checkIfUserIsAdmin,function(req,res,next){
	console.log(req.query.index);
	let users =JSON.parse(fs.readFileSync('data/users.json'));
	fs.readFile('data/posts.json',function(err,data){
		let index = req.query.index;
		let posts=JSON.parse(data.toString());
		let post=posts[index]
		post.author = users[req.session.user.ID].firstname;
	    res.json(post);
		return;
	});
});

// this retives the post data for the private edit html file 
app.get('/API/private/edit/oneposts',checkIfUserIsSignedIn,function(req,res,next){
	console.log(req.query.index);
	fs.readFile('data/posts.json',function(err,data){
		let index = req.query.index;
		let posts=JSON.parse(data.toString());
	    res.json(posts[index]);
		return;
	});
});

// this retives the post data for the private edit html file 
app.get('/API/admin/edit/oneposts',checkIfUserIsSignedIn,checkIfUserIsAdmin,function(req,res,next){
	console.log(req.query.index);
	fs.readFile('data/posts.json',function(err,data){
		let index = req.query.index;
		let posts=JSON.parse(data.toString());
	    res.json(posts[index]);
		return;
	});
});

//gets the registration form depending on user level 

// this retives the registration html file 
app.get('/registration',function(req,res,next){
	fs.readFile('registration.html',function(err,data){
		res.send(data.toString());
	});
});

// this retives the admin registration html file 
app.get('/adminregistration',checkIfUserIsSignedIn,checkIfUserIsAdmin,function(req,res,next){
	fs.readFile('adminregistration.html',function(err,data){
		res.send(data.toString());
	});
});

// this retives a list of users
app.get('/API/users',function(req,res,next){
	fs.readFile('data/users.json',function(err,data){
		res.json(JSON.parse(data.toString()));
		return;
	});
});

// this sends user data to ther users file from registration html file
app.post('/API/users',function(req,res,next){
	fs.readFile('data/users.json',function(err,data){
		users=JSON.parse(data.toString());
		req.body.password=bcrypt.hashSync(req.body.password,10);
		console.log(users);
		req.body.role=0;
		for(let i=0;i<users.length;++i){
			if(req.body.email == users[i].email){
				res.json({status:"faild",msg:"user email already in use"});
				return;
			}
		};
		users.push(req.body);
		//console.log(users);
		fs.writeFile('data/users.json',JSON.stringify(users),function(err,data){
			res.json(users);
		});
	});
});

// this sends user data to ther users file from admin registration html file
app.post('/API/admin/users',checkIfUserIsSignedIn,checkIfUserIsAdmin,function(req,res,next){
	fs.readFile('data/users.json',function(err,data){
		users=JSON.parse(data.toString());
		req.body.password=bcrypt.hashSync(req.body.password,10);
		console.log(users);
		for(let i=0;i<users.length;++i){
			if(req.body.email == users[i].email){
				res.json({status:"faild",msg:"user email already in use"});
				return;
			}
		};
		users.push(req.body);
		//console.log(users);
		fs.writeFile('data/users.json',JSON.stringify(users),function(err,data){
			res.json(users);
		});
	});
});

//User sign in and sign out 
// this retrives the sigin html file 
app.get('/auth/signin',function(req,res,next){
	fs.readFile('signin.html',function(err,data){
		res.send(data.toString());
	});
});

// sign a user out
app.get('/auth/signout',function(req,res,next){
	req.session.user=null;
	res.send('signed out');
});

// this check signs in the users to there account
app.post('/auth/API/signin',function(req,res,next){
	console.log(req.body);
	fs.readFile('data/users.json',function(err,data){
		let users=JSON.parse(data.toString());
		for(let i=0;i<users.length;i++){
			if(users[i].email==req.body.email){
				if(bcrypt.compareSync(req.body.password,users[i].password)){
					req.session.user={
						ID:i,
						firstname:users[i].firstname,
						lastname:users[i].lastname,
						role:users[i].role					
					}
					res.json({'status':1,'message':'authentication is successful'});
				}
				return;
			}	
		}
		res.json({status:-1,message:'authentication is unsuccessful'});
		return;
	});
});

app.put('/API/privat/edit/posts',checkIfUserIsSignedIn,function(req,res,next){
	var posts=[];
	if(fs.existsSync('data/posts.json')) posts=JSON.parse(fs.readFileSync('data/posts.json'));
	req.body.authorID=req.session.user.ID
	posts[req.query.index]=req.body;
	fs.writeFile('data/posts.json',JSON.stringify(posts),function(err,data){
		res.json(posts);
	});
});

app.put('/API/admin/edit/posts',checkIfUserIsSignedIn,function(req,res,next){
	var posts=[];
	if(fs.existsSync('data/posts.json')) posts=JSON.parse(fs.readFileSync('data/posts.json'));
	req.body.authorID=req.session.user.ID
	posts[req.query.index]=req.body;
	fs.writeFile('data/posts.json',JSON.stringify(posts),function(err,data){
		res.json(posts);
	});
});

app.delete('/API/private/delete/posts',checkIfUserIsSignedIn,function(req,res,next){
	var posts=[];
	if(fs.existsSync('data/posts.json')) posts=JSON.parse(fs.readFileSync('data/posts.json'));
	posts[req.query.index]={};
	posts[req.query.index].author= -1;
	fs.writeFile('data/posts.json',JSON.stringify(posts),function(err,data){
		res.json(posts);
	});
});

app.delete('/API/admin/delete/posts',checkIfUserIsSignedIn,checkIfUserIsAdmin,function(req,res,next){
	var posts=[];
	if(fs.existsSync('data/posts.json')) posts=JSON.parse(fs.readFileSync('data/posts.json'));
	posts[req.query.index]={};
	posts[req.query.index].author= -1;
	posts[req.query.index].status= -1;
	fs.writeFile('data/posts.json',JSON.stringify(posts),function(err,data){
		res.json(posts);
	});
});

app.post('/API/posts',checkIfUserIsSignedIn,function(req,res,next){
	var posts=[];
	if(fs.existsSync('data/posts.json')) posts=JSON.parse(fs.readFileSync('data/posts.json'));
	req.body.authorID=req.session.user.ID;
	posts.push(req.body);
	console.log(req.body);
	fs.writeFile('data/posts.json',JSON.stringify(posts),function(err,data){
		res.json(posts);
	});
});

app.listen(port);
module.exports=app;