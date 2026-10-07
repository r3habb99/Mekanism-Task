import { Category, Book } from '../models/index.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        });

        if (existingCategory) {
            return sendError(res, 409, 'Category already exists with this name');
        }

        const category = await Category.create({
            name: name.trim(),
            description: description?.trim() || '',
        });

        return sendSuccess(res, 201, 'Category created successfully', category);
    } catch (error) {
        return sendError(res, 500, 'Error creating category', error.message);
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        return sendSuccess(res, 200, 'Categories retrieved successfully', categories);
    } catch (error) {
        return sendError(res, 500, 'Error fetching categories', error.message);
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return sendError(res, 404, 'Category not found');
        }

        return sendSuccess(res, 200, 'Category retrieved successfully', category);
    } catch (error) {
        return sendError(res, 500, 'Error fetching category', error.message);
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (name) {
            const existingCategory = await Category.findOne({
                name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
                _id: { $ne: req.params.id },
            });
            if (existingCategory) {
                return sendError(res, 409, 'Another category already exists with this name');
            }
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return sendError(res, 404, 'Category not found');
        }

        return sendSuccess(res, 200, 'Category updated successfully', updatedCategory);
    } catch (error) {
        return sendError(res, 400, 'Error updating category', error.message);
    }
};

export const deleteCategory = async (req, res) => {
    try {
        // Check if any books are linked to this category
        const booksCount = await Book.countDocuments({ category: req.params.id });
        if (booksCount > 0) {
            return sendError(
                res,
                400,
                `Cannot delete category: ${booksCount} book(s) are currently associated with it`
            );
        }

        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return sendError(res, 404, 'Category not found');
        }

        return sendSuccess(res, 200, 'Category deleted successfully');
    } catch (error) {
        return sendError(res, 500, 'Error deleting category', error.message);
    }
};
