const asyncHandler = require("express-async-handler");
const Book = require("../models/bookmodel");

// @desc Get all books
// @route GET /api/books
// @access Private
const getBooks = asyncHandler(async (req, res) => {
  const books = await Book.find({user_id:req.user.id}); // no user filter
  res.status(200).json(books);
});

// @desc Create new book
// @route POST /api/books
// @access Private
const createBook = asyncHandler(async (req, res) => {
  const { title, author, genre, status } = req.body;

  if (!title) {
    res.status(400);
    throw new Error("Title is required");
  }

  const book = await Book.create({
    title,
    author,
    genre,
    status,
    user_id: req.user.id,
  });

  res.status(201).json(book);
});

// @desc Get single book
// @route GET /api/books/:id
// @access Private
const getBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

  res.status(200).json(book);
});

// @desc Update book
// @route PUT /api/books/:id
// @access Private
const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

if(book.user_id.toString()!== req.user.id){
  res.status(403);
  throw new Error("User don't have permission to update other user contacts");
}

  const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json(updatedBook);
});

// @desc Delete book
// @route DELETE /api/books/:id
// @access Private
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error("Book not found");
  }

if(book.user_id.toString()!== req.user.id){
  res.status(403);
  throw new Error("User don't have permission to update other user contacts");
}

  await book.deleteOne({_id:req.params.id});

  res.status(200).json({ message: "Book deleted" });
});

module.exports = {
  getBooks,
  createBook,
  getBook,
  updateBook,
  deleteBook,
};
