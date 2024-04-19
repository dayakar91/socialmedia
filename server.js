const express=require('express');
const app=express();
var bodyparse=require('body-parser');
const port=1000;
const mongoose = require('mongoose');
const User = require('./models/User');
const Story=require('./models/Story');

app.use(bodyparse.urlencoded({extended:true}));
app.use(bodyparse.json());

mongoose.connect('mongodb://localhost:27017/socialmedia')
.then(() => {
    console.log('Connected to Mongodb');
})
.catch((err) => {
    console.error('Error connecting to Mongodb:', err);
});


//User Register
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const bcrypt= require('bcrypt-nodejs');
        const saltrounds = 10;
        const pwd = password;
    
        const salt = bcrypt.genSaltSync(saltrounds);
        const hash_password = bcrypt.hashSync(pwd, salt);  

        const user = new User({ username, hash_password });
        await user.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

//User Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).send('User not found');
        }
        else{
            res.send('Login successful');
        }
        //Compare password
        user.comparePassword(password, (err, isMatch) => {
            if (err) {
                return res.status(500).send('Error comparing passwords');
            }
            if (isMatch) {
                res.send('Login successful');
            } else {
                res.status(401).send('Invalid password');
            }
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (error) {
        res.status(500).send(error);
    }
});



//Create Story
app.post('/api/stories', async (req, res) => {
    try {
        const { title, description, date, location } = req.body;
        const story = new Story({ title, description, date, location });
        await story.save();
        res.status(201).json(story);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//Update Story
app.put('/api/storiesupdate/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, location,date_modify } = req.body;
        const updatedStory = await Story.findByIdAndUpdate(id, { title, description,  location,date_modify }, { new: true });
        res.json(updatedStory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//Fetch Stories
app.get('/api/stories', async (req, res) => {
    try {
        const { filter, year } = req.query;
        let stories;
        if (filter === 'All') {
            if (year) {
                // Fetch stories for the specified year
                const startDate = new Date(year, 0, 1); 
                const endDate = new Date(year, 11, 31); 
                stories = await Story.find({ date: { $gte: startDate, $lte: endDate } });
            } else {
                // Fetch all stories
                stories = await Story.find();
            }
        } else {
            return res.status(400).json({ message: 'Invalid filter' });
        }
        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});


app.listen(port,()=>{
    console.log(`app running at http://localhost:${port}`);
});