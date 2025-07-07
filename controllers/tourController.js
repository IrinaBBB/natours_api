const Tour = require('./../models/tourModel.js')
const APIFeatures = require('./../utils/apiFeatures.js')
const catchAsync = require('./../utils/catchAsync.js')
const AppError = require('./../utils/appError.js')

exports.aliasTopTours = (req, res, next) => {
    req.url =
        '/?sort=-ratingsAverage,price&fields=ratingsAverage,price,name,difficulty,summary&limit=5'
    next()
}

exports.getAllTours = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()

    const tours = await features.query

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours,
        },
    })
})

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id)

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour,
        },
    })
})

exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body)

    if (!newTour) {
        return next(new AppError('No tour found with that ID', 404))
    }

    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour,
        },
    })
})

exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    })

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour,
        },
    })
})

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id)

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404))
    }

    res.status(204).json({
        status: 'success',
        data: null,
    })
})

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
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
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
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
            $sort: { numTours: -1 },
        },
        {
            $limit: 6,
        },
    ])

    res.status(200).json({
        status: 'success',
        results: plan.length,
        data: {
            plan,
        },
    })
})
