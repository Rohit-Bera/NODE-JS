// packages imported
const { request, response, query } = require("express");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Friend = require("./friend");  //friend.js file
const nodemailer = require("nodemailer");
const axios = require("axios");




//using middleware -> which will act as a function and when it will run 
//it will store details/data from the postman created api and will keep in the body-parser
//after this command the data in json.format is stored in app.use..
app.use(bodyParser.json())

//mongodb+srv://RohanNaruto:<password>@cluster0.qwi7t.mongodb.net/<dbname>?retryWrites=true&w=majority
//mongoose ko mongodb and Nodejs ko connect karta hai
mongoose.connect(
    "mongodb+srv://RohanNaruto:NeverGiveUp@cluster0.qwi7t.mongodb.net/FriendDatabase?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
)
    .then((result) => {
        console.log(" Frienddatabase connected..");
    })
    .catch((err) => {
        console.log("error database connection failed..");
        console.log("because error is /n ", err);
    });


//creating objects of dummy freinds..
const dummyfriends = [
    { id: "1", name: "rohit", age: 19, type: "closefriend" },
    { id: "2", name: "manthan", age: 20, type: "closefriend" },
    { id: "3", name: "harry", age: 21, type: "bestfriend" },
    { id: "4", name: "dweep", age: 23, type: "friend" },
]


//getting friendlists..
app.get(`/getList`, (request, response) => {
    response.json(dummyfriends);
})

//getting friends by id.. through get meyhod
app.get(`/getfriendbyid/:id`, (request, response) => {
    const id = request.params.id;

    const friend = dummyfriends.filter((item) => item.id == id);

    console.log("friend : ", friend);
    response.send(friend);
})

// adding friends through post method in postman -> which will show the data of the dummyfriends in postman postapi
// data is created and stored in desktop , frontend not database;
app.post(`/addFriend`, (request, response) => {
    // app.use will use the bodyparser middleware and will keep in the request.body... 
    console.log(request.body);

    const friendname = request.body;
    dummyfriends.push(friendname);
    console.log(dummyfriends);
    response.json(dummyfriends); // sends json.format data in postman
})

// getting friends with the get method from mongoDB.
app.get(`/getfriendsFromMongo`, (request, response) => {
    Friend.find((err, Friend) => {
        if (err) {
            console.log("no databases...");
        }
        else {
            console.log("friends are :: ", Friend);
            response.json(Friend);
        }
    })
});


// getting friends by id  with get method from mongoDB
app.get(`/getFriendIDMongo`, (request, response) => {

    const id = "600ebd70905cc4edc474600c";
    Friend.findById(id, (err, Friend) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log("friendbyId : where Id = " + id + " and info is :-", Friend);
            response.json(Friend);
        }
    })
})

//getting friends by name with get method and query is findbyName
app.get(`/getNameFromMongo/:name`, (request, response) => {
    const Name = { name: request.params.name };
    Friend.findOne(Name, (err, friend) => {
        if (err) {
            console.log("error is :", err);
        }
        else {
            console.log("friend name is ::", friend);

            response.json(friend);
        }
    })
})

// get friend name after filtering.... from mongo

// app.get(`/getAgebyFilter/:age`,(request,response) => {
//     const Age = request.params.age; 
//     Friend.find(Age , (err,friend) => {
//         if(err)
//         {
//             console.log("error is :",err);
//         }
//         else{
//             console.log("age you entered is : ",age);

//             query.filter()
//         }
//     })

// })

// middle ware function
const checkAge = (request, response, next) => {
    const age = request.body.Age;

    if (age >= 18) {
        next();
    }
    else {
        response.json("age must be greater than 18");
    }
};


//                 post method
// to post data into monogodatabase
// creating and posting data in Mongo database
app.post(`/addFriendinDB`, checkAge , async (request, response) => {
    try {
        const user = request.body; // name of friend is taken from the user using postman and stored in user through body-parser

        const exist = await Friend.findOne({ name: user.name });  // findone method will find data from the database as its is already stored in the user
        // as user.name and condition is run..

        if (exist) {
            console.log("data already exist...");
            response.json('data already exist...: ');
        }
        else {
            const newFriend = new Friend(user);  // if doesnot exist then new object / new user is created as just like MODEL-SCHEMA(friendschema)
            //and it is exported... and in this newfriend new user user is created.

            await newFriend.save(); //  the new user is created stays in the frontend not backend ,,,
            // to store in database save mehtod is stored....

            console.log(" added friend is :: ", newFriend);
            response.json(newFriend);
        }

    } catch (error) {
        console.log("error is :: ", error);
    }
})

//                 put method
// to update using put method in database
app.put(`/updateFriend/:id`, async (request, response) => {
    const _id = request.params.id;
    const body = request.body; // to take data from the body..

    try {
        // findby id finds data and updates the data. id is stored as from the user , body which the user sets into the postman , new is set to say that it is updated and true..
        const data = await Friend.findByIdAndUpdate({ _id }, { $set: body }, { new: true });

        if (!data) //if the data which is stored 
        {
            return response.json("user not found");
        }

        response.json(data); //if the data is found it will update.. 
    } catch (error) {
        console.log('error: ', error);
    }
})

//                  delete method
// to delete from database
app.delete(`/deleteFromDB/:id`, async (request, response) => {
    const _id = request.params.id;
    try {
        const user = await Friend.findByIdAndDelete({ _id });

        if (!user) {
            return response.json(`not found with ythis id in database`);
        }

        response.json(user)
    } catch (error) {
        console.log('error: ', error);
    }
})

// sending mail througyh nodemailer using get resquest
app.get(`/sendMail`, async (request, response) => {
    try {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'rohit.glsica19@gmail.com',
                pass: 'rohit#@1979'
            }
        });

        var mailOptions = {
            from: 'rohit.glsica19@gmail.com',
            to: 'rohitnitaibera@gmail.com',
            subject: 'Sending Email using Node.js',
            text: 'That was easy!'
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    } catch (error) {
        console.log('error: ', error);

    }
})


// key  8ed9020abaea846ec55254dc0058d844  -- weatherstack
app.get("/showWeather/:place", async (request, response) => {
    const anyPlace = request.params.place;
    try {

        const answer = await axios.get(`http://api.weatherstack.com/current?access_key=8ed9020abaea846ec55254dc0058d844&query=${anyPlace}`);

        response.json(answer.data);
        //console.log('answer: ', answer);

    } catch (error) {
        console.log('error: ', error);
    }
})

//-------------------------------------------------------------------------------------------------------------------------------------------------

const port = 5800;
// to create server port.. local host
app.listen(port, () => {
    console.log(`server is created on port 5800`);
})