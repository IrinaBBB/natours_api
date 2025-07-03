const Tour = require('./../models/tourModel.js')
const APIFeatures = require('./../utils/apiFeatures.js')

exports.aliasTopTours = async (req, res, next) => {
    req.url =
        '/?sort=-ratingsAverage,price&fields=ratingsAverage,price,name,difficulty,summary&limit=5'
    next()
}

exports.getAllTours = async (req, res) => {
    try {
        // EXECUTE QUERY
        // Create a base query
        const query = Tour.find()

        // Apply API features
        const features = new APIFeatures(query, req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate()

        // Execute the final query
        const tours = await features.query

        // SEND RESPONSE
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours,
            },
        })
    } catch (e) {
        res.status(400).json({
            status: 'fail',
            message: e,
        })
    }
}

exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id)
        res.status(200).json({
            status: 'success',
            data: {
                tour,
            },
        })

    } catch (e) {
        res.status(400).json({
            status: 'fail',
            message: e,
        })
    }
}

exports.createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body)

        res.status(200).json({
            status: 'success',
            data: {
                tour: newTour,
            },
        })
    } catch (e) {
        res.status(400).json({
            status: 'fail',
            message: e,
        })
    }
}

exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        res.status(200).json({
            status: 'success',
            data: {
                tour,
            },
        })
    } catch (e) {
        res.status(400).json({
            status: 'fail',
            message: e,
        })
    }

}

exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id)
        res.status(204).json({
            status: 'success', data: null,
        })
    } catch (e) {
        res.status(400).json({
            status: 'fail',
            message: e,
        })
    }
}


exports.getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 } },
            },
            {
                $group:
                    {
                        _id: { $toUpper: '$difficulty' },
                        // _id: '$ratingsAverage',
                        num: { $sum: 1 },
                        numOfRatings: { $sum: '$ratingsQuantity' },
                        avgRating: { $avg: '$ratingsAverage' },
                        avgPrice: { $avg: '$price' },
                        minPrice: { $min: '$price' },
                        maxPrice: { $max: '$price' },
                    },
            },
            {
                $sort: { avgPrice: 1 },
            },
            {
                $match: { _id: { $ne: 'EASY' } },
            },
        ])
        res.status(200).json({
            status: 'success',
            data: {
                stats,
            },
        })
    } catch (e) {
        res.status(400).json({
            status: 'fail',
            message: e,
        })
    }
}

exports.getMonthlyPlan = async (req, res) => {
    try {
        const year = Number(req.params.year)
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates',
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),
                    },
                },
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTours: { $sum: 1 },
                    tours: { $push: '$name' },
                },
            },
            {
                $addFields: { month: '$_id' },
            },
            {
                $project: { _id: 0 },
            },
            {
                $sort: { numTourStats: -1 },
            },
            {
                $limit: 6
            }
        ])
        res.status(200).json({
            status: 'success',
            results: plan.length,
            data: {
                plan,
            },
        })
    } catch (e) {
        res.status(400).json({
            status: 'fail',
            message: e,
        })
    }
}















