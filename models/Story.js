const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    },
    date_modify:{
        type:Date
    },
    location:{ 
        type: String
    }
});

const Story = mongoose.model('Story', storySchema);

module.exports = Story;
