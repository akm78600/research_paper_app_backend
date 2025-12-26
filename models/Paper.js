const mongoose = require('mongoose');

const paperSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a paper title']
    },
    authorName: {
        type: String,
        required: [true, 'Please add the first author name']
    },
    researchDomain: {
        type: String,
        required: [true, 'Please select a research domain'] ,
        enum: [ 'Computer Science' , 'Biology' , 'Physics' , 'Chemistry', 'Mathematics', 'Social Sciences']
    },
    readingStage: {
        type: String,
        required: [true, 'Please select a reading stage'],
        enum: ['Abstract Read', 'Introduction Done', 'Methodology Done', 'Results Analyzed', 'Fully Read', 'Notes Completed']
    },

    impactScore: {
        type: String,
        required: [true, 'Please select an impact score'],
        enum: [  'High', 'Medium', 'Low','Unknown'] 
    },
    citationCount: {
        type: Number,
        required: [true, 'Please add a citation count']
    },
   
}, {
    timestamps: true
});

module.exports = mongoose.model('Paper', paperSchema);
