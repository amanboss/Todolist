const express=require("express")
const bodyparser=require("body-parser")
const https=require("https")
const mongoose =require("mongoose")
const _=require("lodash")
const app=express()
app.set("view engine","ejs")
app.use(bodyparser.urlencoded({extended:true}))
app.use(express.static("public"))

const todoschema = {
  //initialize todolist Schema
  name: String
};

const List = mongoose.model("List", todoschema);

const item1 = new List({
  name: "WELCOME TO-DO-LIST",
});

const item2 = new List({
  name: "HIT + TO SAVE THE ITEM",
});

const item3 = new List({
  name: "<-- HIT THIS TO DELETE ITEM",
});

const defaultItems = [item1, item2, item3];

mongoose.connect('mongodb+srv://aman:aman123@cluster0.4afssvp.mongodb.net/todolist')
// ...
const customlistschema = {
  name: String,
  item: [todoschema],
};

const CustomList = mongoose.model("CustomList", customlistschema);

app.get("/",async function (req, res) {
  const myitems=await List.find({});
  if (myitems.length===0) {
    // Insert default items into the database
    await List.insertMany(defaultItems);
  }
  res.render("list", { thistitle: "Today", addlist: myitems });
})

app.post("/", async function(req,res){
  const task=req.body.task
  const listname=req.body.button
  const item=new List({ name:task})
  if(listname==="Today"){
     //if the thistitle equals today save it in root route
    item.save()
    res.redirect("/")
  }
  else{
    //If not equal today find the custom list name from customlist model and save it
    const mylists=await CustomList.findOne({name: listname})
    mylists.item.push(item)
    await mylists.save()
    res.redirect("/"+mylists.name)
  }

})

app.post("/delete", async function(req, res) {
  const itemId=req.body.check;
  const deletedname=req.body.deletedname;
  if(deletedname==="Today"){
    const deletedItem = await List.findByIdAndRemove(itemId)
    res.redirect("/")
  }
  else {
    const mydeletedcustomlist=await CustomList.findOneAndUpdate({name: deletedname},{$pull: {item :{_id: itemId}}})
    res.redirect("/"+mydeletedcustomlist.name)
  }
});

app.get("/:customlistname", async function (req, res) {
  const customlistname = _.capitalize(req.params.customlistname);
    // Find the custom list with the specified name
    const mylists = await CustomList.findOne({ name: customlistname });

    if (mylists) {
      res.render("list",{ thistitle: mylists.name, addlist: mylists.item})
    } else {
      // Create a new custom list with the default items
      const customlist = new CustomList({
        name: customlistname,
        item: defaultItems,
      });
      // Save the new custom list to the database
      await customlist.save();
      res.redirect("/"+customlistname)
    }
});




app.listen(5000,function(){
    console.log("server is running on 5000");
})
