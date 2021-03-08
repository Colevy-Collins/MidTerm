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
function checkIfUserIsSignedIn(req,res,next){
	console.log(req.session.user);
	if(req.session.user){
		next();
	}else{
		res.send('not signed in');
		return;
	}
}

function checkIfUserIsAdmin(req,res,next){
	if(req.session.user.role==1) next();
	else{
		res.send('you are not allowed here');
		return;
	}
}
//get the html page that displays post depending on user level
app.get('/',function(req,res,next){
	fs.readFile('public.html',function(err,data){
		res.send(data.toString());
	});
});

app.get('/private',checkIfUserIsSignedIn,function(req,res,next){
	fs.readFile('private.html',function(err,data){
		res.send(data.toString());
	});
});

app.get('/admin',checkIfUserIsSignedIn,checkIfUserIsAdmin,function(req,res,next){
	fs.readFile('admin.html',function(err,data){
		res.send(data.toString());
	});
});

//gets the aretical.html of post depending on user level
app.get('/artical',function(req,res,next){
	fs.readFile('artical.html',function(err,data){
		res.send(data.toString());
	});
});

app.get('/private/artical',function(req,res,next){
	fs.readFile('priavateartical.html',function(err,data){
		res.send(data.toString());
	});
});

app.get('/admin/artical',function(req,res,next){
	fs.readFile('articaladmin.html',function(err,data){
		res.send(data.toString());
	});
});

// gets post data on posts for the diffrent user level
app.get('/API/allposts',function(req,res,next){
	fs.readFile('data/posts.json',function(err,data){
		let posts=JSON.parse(data.toString());
		for(let i=0;i<posts.length;i++){
			if(posts[i].status > 0){
				posts[i]={};
			}
		}
		res.json(posts);
		
		return;
	});
});

app.get('/API/private/allposts',function(req,res,next){
	fs.readFile('data/posts.json',function(err,data){
		let posts=JSON.parse(data.toString());
		console.log(req.body.ID);
		for(let i=0;i<posts.length;i++){
			console.log(posts[i].ID);
			if(posts[i].ID != 6){
				posts[i]={};
			}
		}
		res.json(posts);
		
		return;
	});
});

app.get('/API/admin/allposts',function(req,res,next){
	fs.readFile('data/posts.json',function(err,data){
		let posts=JSON.parse(data.toString());
		res.json(posts);
		
		return;
	});
});
// gets the corresponding artical html data for the diffrent user levels
app.get('/API/oneposts',function(req,res,next){
	console.log(req.query.index);
	fs.readFile('data/posts.json',function(err,data){
		let index = req.query.index;
		let posts=JSON.parse(data.toString());
	    res.json(posts[index]);
		return;
	});
});

app.get('/API/private/oneposts',function(req,res,next){
	console.log(req.query.index);
	fs.readFile('data/posts.json',function(err,data){
		let index = req.query.index;
		let posts=JSON.parse(data.toString());
	    res.json(posts[index]);
		return;
	});
});

app.get('/API/admin/oneposts',function(req,res,next){
	console.log(req.query.index);
	fs.readFile('data/posts.json',function(err,data){
		let index = req.query.index;
		let posts=JSON.parse(data.toString());
	    res.json(posts[index]);
		return;
	});
});

//gets the registration form depending on user level 
app.get('/registration',function(req,res,next){
	fs.readFile('registration.html',function(err,data){
		res.send(data.toString());
	});
});

app.get('/adminregistration',checkIfUserIsSignedIn,checkIfUserIsAdmin,function(req,res,next){
	fs.readFile('adminregistration.html',function(err,data){
		res.send(data.toString());
	});
});

// get list of users
app.get('/API/users',function(req,res,next){
	fs.readFile('data/users.json',function(err,data){
		res.json(JSON.parse(data.toString()));
		return;
	});
});

// send user data to files depending on user level
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

app.post('/API/admin/users',function(req,res,next){
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
app.get('/auth/signin',function(req,res,next){
	fs.readFile('signin.html',function(err,data){
		res.send(data.toString());
	});
});

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

app.get('/auth/signout',function(req,res,next){
	req.session.user=null;
	res.send('signed out');
});

/////////////////////////////
//needs atticion//
///////////////////
// the following code deals with retriveing and posting material for post creation
app.get('/API/posts',checkIfUserIsSignedIn,function(req,res,next){
	if(!fs.existsSync('data/posts.json')){
		res.json([]);
		return;
	}
	var users=JSON.parse(fs.readFileSync('data/users.json'));
	fs.readFile('data/posts.json',function(err,data){
		var all_posts=JSON.parse(data.toString());
		for(let i=0;i<all_posts.length;i++){
			all_posts[i].author=users[all_posts[i].authorID].firstname+' '+users[all_posts[i].authorID].lastname;
		}
		
		if(req.session.user.role==1) res.json(all_posts);
		else{
			let filtered_posts=[];
			for(let i=0;i<all_posts.length;i++){
				if(all_posts[i].authorID==req.session.user.ID) filtered_posts.push(all_posts[i]);
			}
			res.json(filtered_posts);
		}
		return;
	});
});

app.post('/API/posts',checkIfUserIsSignedIn,function(req,res,next){
	var posts=[];
	if(fs.existsSync('data/posts.json')) posts=JSON.parse(fs.readFileSync('data/posts.json'));
	req.body.authorID=req.session.user.ID
	posts.push(req.body);
	fs.writeFile('data/posts.json',JSON.stringify(posts),function(err,data){
		res.json(posts);
	});
});
app.listen(port);
module.exports=app;