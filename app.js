//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _=require("lodash");
mongoose.connect("mongodb+srv://admin-yush:yushajay@cluster0.x2h7y.mongodb.net/todolistDB?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology: true})
const app = express();
const thingSchema={
  addition:String
}
const listSchema={
  name:String,
  things:[thingSchema]
}
const Thing=mongoose.model("thing",thingSchema);
const List=mongoose.model("list",listSchema);
const thing1=new Thing({
  addition:"work"
})
const thing2=new Thing({
  addition:"homework"
})
const thing3=new Thing({
  addition:"test"
})
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res) {
  const day = date.getDate();
  Thing.find(function(err,results){
    if(err)
    console.log(err);
    else if(results.length==0){
      //we add items only when there are no items in there ie only once
      Thing.insertMany([thing1,thing2,thing3],function(err){
        if(err)
        console.log(err);
        else
        console.log("added successfully all the default items");
      });
      //since currently result is empty so we can't render right now so we call it
      //back again so that this time result has some values and we are able
      //to use it to show output
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: day, newListItems: results});
    }
  });
});

app.post("/", function(req, res){
  const day = date.getDate();

  const item = req.body.newItem;
  if(req.body.list==day){
    if(item!==""){

      const newThing=new Thing({
        addition:item
      });
      newThing.save();
    }
    res.redirect("/");
  }
  else{
    List.findOne({name:req.body.list},function(err,result){
      const newThing=new Thing({
        addition:item
      });
      result.things.push(newThing);
      result.save();
      res.redirect("/"+result.name);
    })
  }
});
app.post("/delete",function(req,res){
  const day = date.getDate();
  let id=req.body.checkbox;
  let listName=req.body.listName;
  if(listName==day){
    Thing.deleteOne({_id:id},function(err){});
    res.redirect("/");
  }
  else{
    //this is to prevent edeprication warning when we use findOneAndUpdate
    mongoose.set('useFindAndModify', false);
    //watch the portion of the viseo to get it properly
    List.findOneAndUpdate({name:listName},
      {$pull:{things:{_id:id}}},
      function(err,result){
      result.save();
    })
    res.redirect("/"+listName);
  }
});
app.get("/:parameter",function(req,res){
  let nameIt=_.capitalize(req.params.parameter);
  // console.log(name);
  List.findOne({name:nameIt},function(err,result){
  if (!result) {
    //console.log(result);
    let listsItem = new List({
      name: nameIt,
      things: [thing1, thing2, thing3]
    });
    listsItem.save();
    console.log(nameIt + " has been saved");
    res.redirect("/" + nameIt);
  }
  else {
    res.render("list", {listTitle: nameIt,newListItems: result.things});
  }
  });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
