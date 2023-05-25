const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/students")
.then(() => {
    console.log("Your database successfully connected....");
}).catch((err) => {
    console.log("Database not connected!!!!");
})

