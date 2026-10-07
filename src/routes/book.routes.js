import { Router } from 'express';
import { createBook, getBooks, updateBook, deleteBook } from '../controllers/book.controller.js';
import { validateCreateBook, validateUpdateBook, validateBookId } from '../validators/book.validator.js';

const router = Router();

router.post('/create', validateCreateBook, createBook);
router.get('/view', getBooks);
router.patch('/:id', validateBookId, validateUpdateBook, updateBook);
router.delete('/:id', validateBookId, deleteBook);

export default router;
