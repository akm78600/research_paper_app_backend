const Paper = require('../models/Paper');

// @route   POST /api/papers
const createPaper = async (req, res) => {
    try {
        
        const paper = await Paper.create(req.body);
        res.status(201).json({ message: 'Paper created successfully', paper });
    } catch (error) {
        res.status(400).json({  message: `Error creating paper: ${error.message}` });
    }
};

// @route   POST /api/papers/library
const getPapers = async (req, res) => {
    try {

        /*
            CSV : comma seperate values 
            {   
               readingStage: ["Abstract Read" , "Fully Read"],
               researchDomain: ["Computer Science","Biology"],
               impactScore: ["High Impact","Low Impact"],
               dateAdded: "This Month"
            }
        */

        const { readingStage, researchDomain, impactScore, dateAdded } = req.body;
        let query = {};

        // Filters - Multiple options support (comma separated or arrays)
        if (readingStage.length > 0) {
            query.readingStage = { $in: readingStage };
        }
        if (researchDomain.length > 0) {
            query.researchDomain = { $in: researchDomain };
        }
        if ( impactScore.length > 0) {
            query.impactScore = { $in: impactScore };
        }

        // Date Filter
        if (dateAdded) {
            const now = new Date();
            let startDate;
            switch(dateAdded) {
                case 'This Week':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'This Month':
                    startDate = new Date(now.setMonth(now.getMonth() - 1));
                    break;
                case 'Last 3 Months':
                    startDate = new Date(now.setMonth(now.getMonth() - 3));
                    break;
                // 'All time' doesn't need a filter
            }
            if (startDate) {
                query.createdAt = { $gte: startDate } ;
            }
        }

        const papers = await Paper.find(query).sort({ createdAt: -1 } ) ;

        res.status(200).json(  papers );
    } catch (error) {
        res.status(500).json({  message: `Error fetching papers for library : ${error.message}` });
    }
};

// @route   GET /api/papers/analytics
const getAnalytics = async (req, res) => {
    try {
        /*
         Funnel Chart: Count at each Reading Stage
         A funnel chart is a data visualization tool that shows how 
         data progressively decreases through sequential stages of a process

         .aggregate() in mongoose runs an aggregation pipeline( array of pipeline stages )
         for complex data analysis and transformation.
         Each stage in the pipeline performs a specific operation on the documents passed from the previous stage. 
         $group: Groups documents by a specified field and performs aggregate functions  
         (like sum, avg, min, max) on the grouped data.
         returns an array of objects with _id as readingStage and count as number of papers in that readingStage         
         [
            { "_id": "To Read", "count": 2 } ,
            { "_id": "Reading", "count": 1 } ,
            { "_id": "Completed", "count": 1 }
         ]

  */
        const funnelData = await Paper.aggregate( [
            { 
                $group: {  _id: '$readingStage', count: { $sum: 1 } } 
            },
            { $sort: { count: -1 } } // Optional: Sort by count
        ] );



          // Stacked Bar Chart: Papers by Domain and Reading Stage
          // A stacked bar chart extends standard bar charts
         //  to show how a whole is composed of different parts, representing multiple variables within single bars

         // Each bar represents a category (in this case, research domain), 
         // and the height of the bar shows the total count of papers in that domain.
         // The different colors within each bar represent the count of papers at different reading stages.


         // Groups papers by researchDomain and readingStage
        // Counts how many papers are in each domain and stage
        const stackedBarData = await Paper.aggregate([
            {
                $group: {
                    _id: { researchDomain: '$researchDomain', readingStage: '$readingStage' },
                    count: { $sum: 1 }
                }
            }
        ]);



        // Scatter Plot
        // visually shows the relationship between two numerical variables using dots showcasing real distribution patterns

        // Requirement: Scatter plot with Citation Count on x-axis and papers grouped by Impact Score
        // We will send paper list with citationCount and impactScore
        const scatterData = await Paper.find( {} , 'title citationCount impactScore' ) ;

      

        // Summary
        const totalPapers = await Paper.countDocuments();
        const fullyReadCount = await Paper.countDocuments( { readingStage: 'Fully Read' } );

        const avgCitations = await Paper.aggregate( [    // avg citation per researchDomain
             { $group: { _id: "$researchDomain", avgCitations: { $avg: "$citationCount" } } }
        ]);

        res.status(200).json({
            funnelChart: funnelData,
            scatterPlot: scatterData,
            stackedBarChart: stackedBarData,
            summary: {
                totalPapers,  // completion rate of fullyRead/total take out by yourself
                fullyReadCount,
                avgCitationsByDomain: avgCitations
            }
        });

    } catch (error) {
        res.status(500).json({ message: `Error fetching analytics : ${error.message}` });
    }
};

module.exports = {
    createPaper,
    getPapers,
    getAnalytics
};
