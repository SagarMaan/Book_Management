const { default: mongoose, isValidObjectId } = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const reviewModel = require("../model/reviewModel");
const bookModel = require("../model/bookModel");
const { validateName } = require("../validator/validator");


// ================================= Create Reviews For Books ==============================================//
const reviewBook = async function (req, res) {
    try {
        let data = req.body;
        const bookId = req.params.bookId;

        let { review, rating, reviewedBy } = data

        if (!bookId) {
            return res.status(400).send({ status: false, message: "please provide book id." });
        }
        if (!ObjectId.isValid(bookId)) {
            return res.status(400).send({ status: false, message: "Invalid book id." });
        }

        const checkBook = await bookModel.findOne({ _id: bookId, isDeleted: false });

        if (!checkBook) {
            return res.status(404).send({ status: false, message: "Book id does not exist in database." });
        }

        if (!rating) {
            return res.status(400).send({ status: false, message: "please provide rating, it is mandatory." });
        }
        rating = parseFloat(rating);
        if (!rating || (!(rating <= 5 && rating >= 1))) {
            return res.status(400).send({ status: false, message: "rating is invalid. It must be 1 to 5." });
        }
        data["rating"] = rating;

        if (review == "") {
            return res.status(400).send({ status: false, message: "review can't be empty." });
        }
        if (review) {
            if (typeof review != "string") {
                return res.status(400).send({ status: false, message: "review must be in string" });
            }
            if (!review.trim()) {
                return res.status(400).send({ status: false, message: "review can't be empty." });
            }
            review = review.trim();
            data["review"] = review;
        }

        if (reviewedBy == "") {
            data["reviewedBy"] = "Guest";
        }
        if (reviewedBy) {
            if (typeof reviewedBy != "string") {
                return res.status(400).send({ status: false, message: "reviewedBy must be string." });
            }
            reviewedBy = reviewedBy.trim();
            if (!validateName(reviewedBy)) {
                return res.status(400).send({ status: false, message: "reviewer name is invalid." });
            }
        }

        data['bookId'] = bookId;
        data['reviewedAt'] = Date.now();

        const reviewData = await reviewModel.create(data);

        let result = {
            _id: reviewData._id,
            bookId: reviewData.bookId,
            reviewedBy: reviewData.reviewedBy,
            reviewedAt: reviewData.reviewedAt,
            rating: reviewData.rating,
            review: reviewData.review
        }

        await bookModel.findOneAndUpdate(
            { _id: bookId },
            { $inc: { reviews: 1 } }
        );
        return res.status(201).send({ status: true, message: "Success", data: result });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

