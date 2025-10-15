import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true, trim: true},
    email: {type: String, required: true, unique: true, trim: true, lowercase: true},
    password: {type: String, required: true, minlength: 8, select: false},
    
    // Profile details
    name: {type: String, trim: true},
    bio: {type: String, trim: true},
    gender: {type: String, enum: ["male", "female", "non-binary", "prefer not to say", "other"]},
    dateOfBirth: {type: Date},
    profilePicture: {type: String, trim: true},

    // Swipes
    likedItems: [{type: mongoose.Schema.Types.ObjectId, ref: "Item"}],
    dislikedItems: [{type: mongoose.Schema.Types.ObjectId, ref: "Item"}],

    // Shopping
    cart: [{
        item: {type: mongoose.Schema.Types.ObjectId, ref: "Item"},
        dateAdded: {type: Date, default: Date.now}
    }
    ],
    savedItems: [{type: mongoose.Schema.Types.ObjectId, ref: "Item"}],

    // Preferences -- TO BE EXPANDED

    // Metadata
    lastActive: {type: Date, default: Date.now},
}, {timestamps: true});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 16);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;