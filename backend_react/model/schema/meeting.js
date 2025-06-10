const mongoose = require('mongoose');

const meetingHistory = new mongoose.Schema({
    agenda: { 
        type: String, 
        required: [true, 'Agenda is required'],
        trim: true
    },
    attendes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contacts',
        default: []
    }],
    attendesLead: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Leads',
        default: []
    }],
    location: {
        type: String,
        trim: true
    },
    related: {
        type: String,
        trim: true
    },
    dateTime: {
        type: String,
        required: [true, 'DateTime is required'],
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    // meetingReminders: { type: String, required: true },
    createBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, 'Creator is required']
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Add index for better query performance
meetingHistory.index({ dateTime: 1 });
meetingHistory.index({ createBy: 1 });
meetingHistory.index({ deleted: 1 });

module.exports = mongoose.model('Meetings', meetingHistory, 'Meetings');
