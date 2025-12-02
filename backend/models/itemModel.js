import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    // Basic Information
    name: { type: String, required: true, trim: true },
    brand: { 
        type: String, 
        required: true, 
        trim: true,
        enum: [
            "Nike", "Adidas", "Zara", "H&M", "Uniqlo", "Levi's", "Patagonia", "Vans", "Converse", "The North Face", "Supreme", "Stüssy", "Other"
        ]
    },
    description: { type: String, trim: true },
    category: { 
        type: String, 
        required: true,
        enum: ["tops", "bottoms", "dresses", "outerwear", "shoes", "accessories", "activewear", "swimwear", "loungewear", "underwear"]
    },
    subcategory: { type: String, trim: true },
    
    // Product Details
    price: { type: Number, required: true, min: 0 },
    availableSizes: { type: [String], required: true },
    availableColors: { 
        type: [String], 
        required: true,
        enum: [
            "Black", "White", "Gray", "Navy", "Brown", 
            "Beige", "Red", "Blue", "Green", "Pastels"
        ]
    },
    material: { type: String },
    pattern: { type: String, enum: ["solid", "striped", "plaid", "floral", "geometric", "animal print", "abstract", "other"] },
    
    // Dress code
    style: { 
        type: [String],
        enum: [
            "Streetwear", "Casual", "Athletic", "Formal", "Vintage", 
            "Minimalist", "Boho", "Preppy", "Grunge", "Techwear"
        ]
    },
    occasion: { type: [String], enum: ["everyday", "work", "party", "date night", "wedding", "vacation", "gym", "lounging"] },
    gender: { type: String, required: true, enum: ["men", "women", "unisex"] },
    fit: { type: String, enum: ["slim", "regular", "loose", "oversized", "tailored"] },
    
    // AWS S3 URLs
    images: [{ type: String, required: true }],
    
    // Stock by size and color
    // Nested map of size -> color -> quantity
    stock: {
        type: Map,
        of: {
            type: Map,
            of: Number
        },
        default: () => new Map()
    },
    
    // Metadata
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Item = mongoose.model("Item", itemSchema);
export default Item;
