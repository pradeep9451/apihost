const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

const apiData = require("./data.json");

app.get("/", (req, res) =>{
res.send("Hello yadav I am live");
 });

 app.get("/service", (req,res)=>{
   res.send(apiData);
 });

app.listen(port, () => {
     console.log("I am live again"); 
    });