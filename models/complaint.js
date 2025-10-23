import mongoose, { model, Schema } from "mongoose";

const complaintSchema = new Schema({
    volunteerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },

    reason: {
        type: String,
    }
}, { timestamps: true });

const Complaint = model('complaint', complaintSchema);
export default Complaint