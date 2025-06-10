const MeetingHistory = require('../../model/schema/meeting')
const mongoose = require('mongoose')
const { Contact } = require('../../model/schema/contact')

const add = async (req, res) => {
    try {
        const {
            agenda,
            attendes,
            attendesLead,
            location,
            related,
            dateTime,
            notes
        } = req.body;

        console.log('Received meeting data:', {
            agenda,
            attendes,
            attendesLead,
            location,
            related,
            dateTime,
            notes,
            userId: req.user._id
        });

        if (!agenda || !dateTime) {
            return res.status(400).json({
                error: 'Agenda and dateTime are required fields'
            });
        }

        let validAttendes = [];
        if (attendes && Array.isArray(attendes)) {
            validAttendes = attendes.filter(id => mongoose.Types.ObjectId.isValid(id))
                .map(id => new mongoose.Types.ObjectId(id));
        }

        let validAttendesLead = [];
        if (attendesLead && Array.isArray(attendesLead)) {
            validAttendesLead = attendesLead.filter(id => mongoose.Types.ObjectId.isValid(id))
                .map(id => new mongoose.Types.ObjectId(id));
        }

        const meeting = new MeetingHistory({
            agenda,
            attendes: validAttendes,
            attendesLead: validAttendesLead,
            location,
            related,
            dateTime,
            notes,
            createBy: new mongoose.Types.ObjectId(req.user.userId)
        });

        console.log('Attempting to save meeting:', meeting);

        const savedMeeting = await meeting.save();
        console.log('Meeting saved successfully:', savedMeeting);

        const populatedMeeting = await MeetingHistory.findById(savedMeeting._id)
            .populate({
                path: 'attendes',
                select: 'firstName lastName email',
                model: 'Contacts'
            })
            .populate({
                path: 'attendesLead',
                select: 'firstName lastName email',
                model: 'Leads'
            })
            .populate({
                path: 'createBy',
                select: 'firstName lastName',
                model: 'User'
            });

        res.status(201).json({
            message: 'Meeting created successfully',
            meeting: populatedMeeting
        });
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({
            error: 'Failed to create meeting',
            details: error.message
        });
    }
};

const index = async (req, res) => {
    try {
        const query = { ...req.query, deleted: false };
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build the query
        const meetingsQuery = MeetingHistory.find(query)
            .populate('attendes', 'firstName lastName email')
            .populate('attendesLead', 'firstName lastName email')
            .populate('createBy', 'firstName lastName')
            .sort({ dateTime: -1 })
            .skip(skip)
            .limit(limit);

        const [meetings, total] = await Promise.all([
            meetingsQuery.exec(),
            MeetingHistory.countDocuments(query)
        ]);

        res.status(200).json({
            meetings,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({
            error: 'Failed to fetch meetings'
        });
    }
};

const view = async (req, res) => {
    try {
        const meeting = await MeetingHistory.findOne({
            _id: req.params.id,
            deleted: false
        })
        .populate('attendes', 'firstName lastName email')
        .populate('attendesLead', 'firstName lastName email')
        .populate('createBy', 'firstName lastName');

        if (!meeting) {
            return res.status(404).json({
                error: 'Meeting not found'
            });
        }

        res.status(200).json(meeting);
    } catch (error) {
        console.error('Error fetching meeting:', error);
        res.status(500).json({
            error: 'Failed to fetch meeting'
        });
    }
};

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            agenda,
            attendes,
            attendesLead,
            location,
            related,
            dateTime,
            notes
        } = req.body;

        const meeting = await MeetingHistory.findOneAndUpdate(
            { _id: id, deleted: false },
            {
                agenda,
                attendes: attendes ? attendes.map(id => new mongoose.Types.ObjectId(id)) : [],
                attendesLead: attendesLead ? attendesLead.map(id => new mongoose.Types.ObjectId(id)) : [],
                location,
                related,
                dateTime,
                notes
            },
            { new: true }
        )
        .populate('attendes', 'firstName lastName email')
        .populate('attendesLead', 'firstName lastName email')
        .populate('createBy', 'firstName lastName');

        if (!meeting) {
            return res.status(404).json({
                error: 'Meeting not found'
            });
        }

        res.status(200).json({
            message: 'Meeting updated successfully',
            meeting
        });
    } catch (error) {
        console.error('Error updating meeting:', error);
        res.status(500).json({
            error: 'Failed to update meeting'
        });
    }
};

const deleteData = async (req, res) => {
    try {
        const meeting = await MeetingHistory.findOne({
            _id: req.params.id,
            deleted: false
        });

        if (!meeting) {
            return res.status(404).json({
                error: 'Meeting not found'
            });
        }
        meeting.deleted = true;
        await meeting.save();

        res.status(200).json({
            message: 'Meeting deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting meeting:', error);
        res.status(500).json({
            error: 'Failed to delete meeting'
        });
    }
};

const deleteMany = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                error: 'Invalid meeting IDs provided'
            });
        }

        const result = await MeetingHistory.updateMany(
            {
                _id: { $in: ids },
                deleted: false
            },
            {
                $set: { deleted: true }
            }
        );

        res.status(200).json({
            message: 'Meetings deleted successfully',
            deletedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error deleting meetings:', error);
        res.status(500).json({
            error: 'Failed to delete meetings'
        });
    }
};

module.exports = { add, index, view, deleteData, deleteMany ,update };