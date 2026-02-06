const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [200, 'Product name cannot exceed 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Product price is required'],
            min: [0, 'Price cannot be negative'],
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Product category is required'],
        },
        stock: {
            type: Number,
            required: [true, 'Stock quantity is required'],
            min: [0, 'Stock cannot be negative'],
            default: 0,
        },
        images: [
            {
                type: String,
                trim: true,
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
        unit: {
            type: String,
            enum: ['kg', 'g', 'lb', 'piece', 'dozen', 'liter', 'ml'],
            default: 'kg',
        },
        views: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });

productSchema.virtual('inStock').get(function () {
    return this.stock > 0;
});

productSchema.methods.incrementViews = function () {
    this.views += 1;
    return this.save();
};

productSchema.methods.toJSON = function () {
    const obj = this.toObject({ virtuals: true });
    delete obj.__v;
    return obj;
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
