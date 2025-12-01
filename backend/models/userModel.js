import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    // Authentication
    username: {type: String, required: true, unique: true, trim: true},
    email: {type: String, required: true, unique: true, trim: true, lowercase: true, match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/},
    password: {type: String, required: true, minlength: 8, select: false},
    refreshToken: {type: String},
    
    // Profile details
    name: {type: String, trim: true},
    bio: {type: String, trim: true},
    gender: {type: String, enum: ["Male", "Female", "Unisex"]},
    dateOfBirth: {type: Date},

    // Swipes
    likedItems: [{type: mongoose.Schema.Types.ObjectId, ref: "Item"}],
    dislikedItems: [{type: mongoose.Schema.Types.ObjectId, ref: "Item"}],

    // Shopping
    cart: [{
        item: {type: mongoose.Schema.Types.ObjectId, ref: "Item"},
        selectedSize: {type: String, required: true},
        selectedColor: {type: String, required: true},
        quantity: {type: Number, default: 1, min: 1},
        dateAdded: {type: Date, default: Date.now}
    }],
    savedItems: [{type: mongoose.Schema.Types.ObjectId, ref: "Item"}],

    // Preferences captured during onboarding
    preferences: {
        shoeSize: { type: Number, min: 4, max: 23 },
        shirtSize: { type: String, enum: ["XS", "S", "M", "L", "XL", "XXL"] },
        pantsSize: { type: String, enum: ["26", "28", "30", "32", "34", "36", "38", "40"] },
        shortSize: { type: String, enum: ["XS", "S", "M", "L", "XL", "XXL"] },
        stylePreferences: {
            type: [String],
            enum: [
                "Streetwear", "Casual", "Athletic", "Formal", "Vintage", "Minimalist", "Boho", "Preppy", "Grunge", "Techwear"
            ],
            default: []
        },
        colorPreferences: {
            type: [String],
            enum: [
                "Black", "White", "Gray", "Navy", "Brown", "Beige", "Red", "Blue", "Green", "Pastels"
            ],
            default: []
        },
        favoriteBrands: {
            type: [String],
            enum: [
                "Nike", "Adidas", "Zara", "H&M", "Uniqlo", "Levi's", "Patagonia", "Vans", "Converse", "The North Face", "Supreme", "Stüssy", "Other"
            ],
            default: []
        },
        priceRange: { type: String, enum: ["$0-50", "$50-100", "$100-200", "$200+"] }
    },

    // Preference tallies for personalized feed
    preferenceTallies: {
        brands: {
            type: Map,
            of: Number,
            default: () => new Map()
        },
        styles: {
            type: Map,
            of: Number,
            default: () => new Map()
        },
        colors: {
            type: Map,
            of: Number,
            default: () => new Map()
        },
        priceRanges: {
            type: Map,
            of: Number,
            default: () => new Map()
        },
        categories: {
            type: Map,
            of: Number,
            default: () => new Map()
        },
        patterns: {
            type: Map,
            of: Number,
            default: () => new Map()
        }
    },

    // Metadata
    lastActive: {type: Date, default: Date.now},
}, {timestamps: true});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 15);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;