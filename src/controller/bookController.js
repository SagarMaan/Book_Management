const moment = require("moment");
const { isValidObjectId } = require("mongoose");

const bookModel = require("../model/bookModel.js");
const userModel = require("../model/userModel");
const reviewModel = require("../model/reviewModel");
const { validateISBN } = require("../validator/validator.js");
const {uploadFile} = require("../AWS/awsConfiguration");


// ===================================== Create Books =====================================================//
const createBook = async function (req, res) {
    try {
        let body = req.body;
        let { title, excerpt, ISBN, category, subcategory, releasedAt } = body;

        if (Object.keys(body).length == 0) {
            return res.status(400).send({ status: false, message: "Body can not be empty" });
        }

        if (title && typeof title != "string") {
            return res.status(400).send({ status: false, message: "Title must be in string" });
        }
        if (!title || !title.trim()) {
            return res.status(400).send({ status: false, message: "Title must be present in body and can't be empty." });
        }
        title = title.toLowerCase().trim();
        let checkTitle = await bookModel.findOne({ title: title });
        if (checkTitle) {
            return res.status(400).send({ status: false, message: "This title already in use for other book" });
        }

        if (excerpt && typeof excerpt != "string") {
            return res.status(400).send({ status: false, message: "Excerpt must be in string" });
        }
        if (!excerpt || !excerpt.trim()) {
            return res.status(400).send({ status: false, message: " Excerpt must be present in body and can't be empty." });
        }
        excerpt = excerpt.trim();

        if (ISBN && typeof ISBN != "string") {
            return res.status(400).send({ status: false, message: "ISBN must be in string" });
        }
        if (!ISBN || !ISBN.trim()) {
            return res.status(400).send({ status: false, message: " ISBN must be present in body and it can't be empty." });
        }
        if (!validateISBN(ISBN.trim())) {
            return res.status(400).send({ status: false, message: " Invalid ISBN number it should contain only 13 digits" });
        }
        const checkISBN = await bookModel.findOne({ ISBN: ISBN });
        if (checkISBN) {
            return res.status(400).send({ status: false, message: "This ISBN number is already alotted." });
        }

        if (category && typeof category != "string") {
            return res.status(400).send({ status: false, message: "category must be in string" });
        }
        if (!category || !category.trim()) {
            return res.status(400).send({ status: false, message: "Category must be present in body and can't be empty." });
        }
        category = category.trim();

        if (subcategory && typeof subcategory != "string") {
            return res.status(400).send({ status: false, message: "subcategory must be in string" });
        }
        if (!subcategory || !subcategory.trim()) {
            return res.status(400).send({ status: false, message: "Subategory must be present in body and can't be empty." });
        }
        subcategory = subcategory.trim();

        if (releasedAt && typeof releasedAt != "string") {
            return res.status(400).send({ status: false, message: "releasedAt must be in string" });
        }
        if (!releasedAt || !releasedAt.trim()) {
            return res.status(400).send({ status: false, message: "releasedAt must be present in body and can't be empty." });
        }
        let trimReleasedAt = releasedAt.trim();
        if (moment(trimReleasedAt, "YYYY-MM-DD").format("YYYY-MM-DD") !== trimReleasedAt) {
            return res.status(400).send({ status: false, message: "Please enter the Date in the format of 'YYYY-MM-DD'." });
        }

        let files = req.files
        if (files && files.length > 0) {
            let uploadFileURL = await uploadFile(files[0])
            body.bookCover = uploadFileURL
            
            const uniqueCover = await bookModel.findOne({ bookCover: uploadFileURL })
            if (uniqueCover) {
                return res.status(400).send({ status: false, message: "Book cover is already exist." })
            }
            
        } else {
            return res.status(400).send({ status: false, message: "No file found" })
        }

        const bookList = await bookModel.create(body);

        res.status(201).send({ status: true, message: "Success", data: bookList });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

