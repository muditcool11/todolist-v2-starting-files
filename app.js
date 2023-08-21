//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv").config();
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const db_id = process.env.DB_ID;
const db_key = process.env.DB_KEY;
mongoose.connect("mongodb+srv://"+db_id+":"+db_key+"@cluster0.yohcrac.mongodb.net/todolistDB", {
  useNewurlParser: true,
  useUnifiedTopology: true,
});
const itemsSchema = {
  name: String,
};
const Item = mongoose.model("Item", itemsSchema);

app.get("/", function (req, res) {
  const item1 = new Item({
    name: "Welcome to your todo list!",
  });
  const item2 = new Item({
    name: "Hit the + button to add a new item",
  });
  const item3 = new Item({
    name: "<-- Hit this to delete an item",
  });
  const defaultItems = [item1, item2, item3];

  Item.find({}).then((i) => {
    // console.log(i);
    if (i.length === 0) {
      Item.insertMany(defaultItems)
        .then(console.log("Default items inserted!"))
        .catch((err) => {
          console.log(err);
        });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: i });
    }
  });
});

app.get("/favicon.ico", (req, res) => {
  console.log("Favicon Requested");
});

const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("list", listSchema);

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  const item1 = new Item({
    name: "Welcome to your todo list!",
  });
  const item2 = new Item({
    name: "Hit the + button to add a new item",
  });
  const item3 = new Item({
    name: "<-- Hit this to delete an item",
  });
  const defaultItems = [item1, item2, item3];
  List.findOne({ name: customListName })
    .then((foundList) => {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });

  console.log(customListName);
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listTitle = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if (listTitle === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listTitle }).then((foundlist) => {
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/" + listTitle);
    });
  }
});

app.post("/delete", (req, res) => {
  const del_id = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.deleteOne({ _id: del_id }).then(() => {
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: del_id } } }
    ).then(() => {
      console.log("Item Delete Successful id:" + del_id);
      res.redirect("/"+listName);
    });
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT||3000, function () {
  console.log("Server started on port 3000");
});
