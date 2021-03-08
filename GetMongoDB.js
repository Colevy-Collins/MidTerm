const uri ="mongodb://localhost:27017";
const { MongoClient } = require("mongodb");
const client = new MongoClient(uri,{useUnifiedTopology:true});

async function run(){
  try {
    await client.connect();
    const database = client.db('blog');
    const collection = database.collection('posts');
   
    const query={status:'1'};
	const posts=await collection.find(query);
	if ((await posts.count()) === 0) {
      console.log("No documents found!");
    }
	await posts.forEach(function(posts){
		console.log(posts);
	});
   
   } finally {
    
    await client.close();
  }
}
run().catch(console.dir);