import type { GradeCatalog } from './types';

/**
 * The approved lesson hierarchy: Grade → Topic → Unit → Lesson.
 *
 * Generated from the academy's LESSONS documents (one per grade, 550 lessons).
 * Titles are copied verbatim; they are the only thing this file contains —
 * lesson *content* lives in `content/` and is attached by lesson id.
 * Do not edit titles, order or numbering here without the academy's approval.
 */
export const LESSON_CATALOG: GradeCatalog[] = [
  {
    grade: 1,
    label: "GRADE 1 — FOUNDATION MATHEMATICS",
    topics: [
      {
        number: 1,
        title: "Number Sense and Counting",
        units: [
          {
            number: 1,
            title: "Counting & Number Line Foundations (1–100)",
            lessons: [
              "Counting Forwards and Backwards",
              "Reading and Writing Numbers to 100",
              "Number Sequences and Missing Numbers",
              "Understanding and Using the Number Line",
              "Counting in Steps of 2, 5, and 10",
            ],
          },
          {
            number: 2,
            title: "Numbers to 20",
            lessons: [
              "Counting Objects to 20",
              "Reading, Writing, and Representing Numbers to 20",
              "Comparing Numbers to 20",
              "Ordering Numbers to 20",
              "Building and Breaking Apart Numbers to 20",
            ],
          },
        ],
      },
      {
        number: 2,
        title: "Addition and Subtraction",
        units: [
          {
            number: 3,
            title: "Number Bonds & Making 10",
            lessons: [
              "Understanding Parts and Wholes",
              "Finding Number Pairs That Make 5",
              "Finding Number Pairs That Make 10",
              "Finding Missing Parts in Number Bonds",
              "Using Number Bonds to Solve Problems",
            ],
          },
          {
            number: 4,
            title: "Mental Addition & Subtraction Strategies",
            lessons: [
              "Adding by Counting On",
              "Subtracting by Counting Back",
              "Making 10 to Add",
              "Using Doubles and Near Doubles",
              "Solving Addition and Subtraction Word Problems",
            ],
          },
        ],
      },
      {
        number: 4,
        title: "Introduction to Fractions",
        units: [
          {
            number: 5,
            title: "Equal Parts vs. Unequal Parts",
            lessons: [
              "Understanding Wholes and Parts",
              "Identifying Equal and Unequal Parts",
              "Dividing Shapes into Equal Parts",
              "Recognizing Halves in Shapes and Objects",
              "Recognizing Quarters in Shapes and Objects",
            ],
          },
        ],
      },
      {
        number: 5,
        title: "Measurement, Time, and Money",
        units: [
          {
            number: 6,
            title: "Measuring Length (Centimeters & Meters)",
            lessons: [
              "Comparing Objects by Length",
              "Understanding Longer, Shorter, and the Same Length",
              "Measuring Length Using Non-Standard Units",
              "Measuring Length in Centimeters",
              "Understanding Meters and Choosing Suitable Units",
            ],
          },
          {
            number: 7,
            title: "Reading Analog & Digital Clocks (Hours, Half-Hours, Minutes)",
            lessons: [
              "Understanding Clock Faces and Clock Hands",
              "Reading O'Clock Times",
              "Reading Half-Past Times",
              "Matching Analog and Digital Times",
              "Understanding Minutes and Reading Times to Five-Minute Intervals",
            ],
          },
        ],
      },
      {
        number: 6,
        title: "Geometry and Spatial Reasoning",
        units: [
          {
            number: 8,
            title: "2D Shapes, Sides, & Vertices",
            lessons: [
              "Recognizing Circles, Triangles, Squares, and Rectangles",
              "Counting Sides of 2D Shapes",
              "Understanding Vertices and Counting Corners",
              "Comparing and Sorting 2D Shapes",
              "Recognizing Shapes in Everyday Objects",
            ],
          },
        ],
      },
      {
        number: 7,
        title: "Introduction to Equations",
        units: [
          {
            number: 9,
            title: "Understanding the Equals Sign (=) & Balance Scales",
            lessons: [
              "Understanding Equality as Balance",
              "Finding Equal Groups and Quantities",
              "Completing Number Sentences with the Equals Sign",
              "Finding Missing Numbers in Simple Equations",
              "Solving Balance Puzzles with Numbers",
            ],
          },
        ],
      },
      {
        number: 8,
        title: "Mathematical Reasoning and Puzzles",
        units: [
          {
            number: 10,
            title: "Sorting, Venn Diagrams, & Picture Charts",
            lessons: [
              "Sorting Objects by One Attribute",
              "Sorting Objects by Two Attributes",
              "Understanding Groups and Overlapping Groups",
              "Reading and Creating Simple Picture Charts",
              "Solving Sorting and Classification Puzzles",
            ],
          },
        ],
      },
    ],
  },
  {
    grade: 2,
    label: "GRADE 2 — FOUNDATION MATHEMATICS",
    topics: [
      {
        number: 1,
        title: "Number Sense and Counting",
        units: [
          {
            number: 1,
            title: "Place Value: Ones, Tens, and Hundreds",
            lessons: [
              "Understanding Hundreds, Tens, and Ones",
              "Representing Numbers with Place-Value Blocks",
              "Writing Numbers in Expanded Form",
              "Identifying the Value of Each Digit",
              "Building and Decomposing Three-Digit Numbers",
            ],
          },
          {
            number: 2,
            title: "Skip-Counting & Number Patterns (by 2s, 5s, 10s, 100s)",
            lessons: [
              "Skip-Counting Forwards and Backwards by 2s",
              "Skip-Counting Forwards and Backwards by 5s",
              "Skip-Counting Forwards and Backwards by 10s",
              "Counting by 100s",
              "Finding Rules and Missing Numbers in Number Patterns",
            ],
          },
        ],
      },
      {
        number: 2,
        title: "Addition and Subtraction",
        units: [
          {
            number: 3,
            title: "Two-Digit Addition & Subtraction (With & Without Regrouping)",
            lessons: [
              "Adding Two-Digit Numbers Without Regrouping",
              "Subtracting Two-Digit Numbers Without Regrouping",
              "Adding Two-Digit Numbers with Regrouping",
              "Subtracting Two-Digit Numbers with Regrouping",
              "Solving Addition and Subtraction Word Problems",
            ],
          },
        ],
      },
      {
        number: 3,
        title: "Multiplication and Division",
        units: [
          {
            number: 4,
            title: "Equal Groups, Repeated Addition, & Arrays",
            lessons: [
              "Understanding Equal Groups",
              "Representing Equal Groups with Repeated Addition",
              "Introducing Multiplication as Equal Groups",
              "Representing Multiplication with Arrays",
              "Solving Problems Using Groups and Arrays",
            ],
          },
          {
            number: 5,
            title: "Core Times Tables (2s, 3s, 4s, 5s, 10s)",
            lessons: [
              "Multiplying by 2",
              "Multiplying by 3",
              "Multiplying by 4",
              "Multiplying by 5",
              "Multiplying by 10 and Connecting the Times Tables",
            ],
          },
          {
            number: 6,
            title: "Fair Sharing & Introduction to Division",
            lessons: [
              "Understanding Fair Sharing",
              "Sharing Objects into Equal Groups",
              "Understanding Division as Equal Sharing",
              "Dividing by Grouping",
              "Connecting Multiplication and Division",
            ],
          },
        ],
      },
      {
        number: 4,
        title: "Introduction to Fractions",
        units: [
          {
            number: 7,
            title: "Halves, Quarters, Thirds, & Unit Fractions",
            lessons: [
              "Understanding Fractions as Equal Parts of a Whole",
              "Recognizing and Representing Halves",
              "Recognizing and Representing Quarters",
              "Recognizing and Representing Thirds",
              "Understanding Unit Fractions and Their Numerators and Denominators",
            ],
          },
        ],
      },
      {
        number: 5,
        title: "Measurement, Time, and Money",
        units: [
          {
            number: 8,
            title: "Calendars, Days, Weeks, & Elapsed Time",
            lessons: [
              "Naming and Ordering the Days of the Week",
              "Understanding Months and Reading a Calendar",
              "Counting Days and Weeks on a Calendar",
              "Reading and Comparing Clock Times",
              "Calculating Simple Elapsed Time",
            ],
          },
          {
            number: 9,
            title: "Counting Coins, Bills, & Making Change",
            lessons: [
              "Recognizing Coins and Banknotes",
              "Finding the Value of Collections of Money",
              "Counting Money in Different Combinations",
              "Finding Different Ways to Make the Same Amount",
              "Solving Simple Shopping and Change Problems",
            ],
          },
        ],
      },
      {
        number: 6,
        title: "Geometry and Spatial Reasoning",
        units: [
          {
            number: 10,
            title: "Symmetry, Flips, & Spatial Patterns",
            lessons: [
              "Recognizing Symmetrical Shapes",
              "Finding Lines of Symmetry",
              "Completing Symmetrical Pictures and Shapes",
              "Understanding Flips and Reflections",
              "Solving Spatial and Shape-Pattern Puzzles",
            ],
          },
        ],
      },
      {
        number: 7,
        title: "Introduction to Equations",
        units: [
          {
            number: 11,
            title: "Missing-Number Addition & Subtraction Puzzles",
            lessons: [
              "Finding Missing Numbers in Addition Sentences",
              "Finding Missing Numbers in Subtraction Sentences",
              "Using the Inverse Relationship Between Addition and Subtraction",
              "Solving Missing-Number Puzzles with Boxes and Symbols",
              "Solving Multi-Step Number Puzzles",
            ],
          },
        ],
      },
      {
        number: 8,
        title: "Mathematical Reasoning and Puzzles",
        units: [
          {
            number: 12,
            title: "Visual Pattern & Grid Logic Puzzles",
            lessons: [
              "Identifying and Extending Visual Patterns",
              "Finding Missing Shapes in Patterns",
              "Understanding Rows, Columns, and Grids",
              "Solving Number and Shape Grid Puzzles",
              "Solving Multi-Clue Logic Puzzles",
            ],
          },
        ],
      },
    ],
  },
  {
    grade: 3,
    label: "GRADE 3 — FOUNDATION MATHEMATICS",
    topics: [
      {
        number: 1,
        title: "Number Sense and Counting",
        units: [
          {
            number: 1,
            title: "Rounding & Estimating Quantities",
            lessons: [
              "Understanding Rounding and Place Value",
              "Rounding Numbers to the Nearest 10",
              "Rounding Numbers to the Nearest 100",
              "Estimating Sums and Differences",
              "Choosing Reasonable Estimates in Everyday Problems",
            ],
          },
        ],
      },
      {
        number: 2,
        title: "Addition and Subtraction",
        units: [
          {
            number: 2,
            title: "Three-Digit Addition & Subtraction",
            lessons: [
              "Adding Three-Digit Numbers Without Regrouping",
              "Adding Three-Digit Numbers with Regrouping",
              "Subtracting Three-Digit Numbers Without Regrouping",
              "Subtracting Three-Digit Numbers with Regrouping",
              "Solving Multi-Step Addition and Subtraction Problems",
            ],
          },
          {
            number: 3,
            title: "Visual Bar Models for Word Problems",
            lessons: [
              "Understanding Parts and Wholes with Bar Models",
              "Representing Addition Problems with Bar Models",
              "Representing Subtraction Problems with Bar Models",
              "Finding Missing Values in Bar Models",
              "Solving Word Problems Using Bar Models",
            ],
          },
        ],
      },
      {
        number: 3,
        title: "Multiplication and Division",
        units: [
          {
            number: 4,
            title: "Extended Times Tables (6s, 7s, 8s, 9s) & Properties",
            lessons: [
              "Multiplying by 6",
              "Multiplying by 7",
              "Multiplying by 8",
              "Multiplying by 9",
              "Using Multiplication Properties and Known Facts",
            ],
          },
          {
            number: 5,
            title: "Division With Remainders & Fact Families",
            lessons: [
              "Understanding Division as Equal Grouping",
              "Introducing Remainders in Division",
              "Representing Division with Remainders",
              "Connecting Multiplication and Division Fact Families",
              "Solving Division Word Problems with Remainders",
            ],
          },
        ],
      },
      {
        number: 4,
        title: "Introduction to Fractions",
        units: [
          {
            number: 6,
            title: "Building Non-Unit Fractions & Fractions on a Number Line",
            lessons: [
              "Understanding Numerators and Denominators",
              "Building Fractions with Equal Parts",
              "Representing Non-Unit Fractions with Visual Models",
              "Placing Fractions on a Number Line",
              "Identifying Fractions Between 0 and 1",
            ],
          },
          {
            number: 7,
            title: "Comparing Simple Fractions & Visual Equivalents",
            lessons: [
              "Comparing Fractions with the Same Denominator",
              "Comparing Unit Fractions",
              "Comparing Fractions Using Visual Models",
              "Understanding Equivalent Fractions with Pictures",
              "Finding Simple Equivalent Fractions",
            ],
          },
        ],
      },
      {
        number: 5,
        title: "Measurement, Time, and Money",
        units: [
          {
            number: 8,
            title: "Measuring Mass & Capacity (Grams, Kilograms, Liters)",
            lessons: [
              "Understanding Mass and Weight in Everyday Contexts",
              "Measuring Mass in Grams",
              "Measuring Mass in Kilograms",
              "Understanding Capacity and Measuring in Liters",
              "Comparing and Solving Mass and Capacity Problems",
            ],
          },
        ],
      },
      {
        number: 6,
        title: "Geometry and Spatial Reasoning",
        units: [
          {
            number: 9,
            title: "3D Solids & Flat Faces",
            lessons: [
              "Recognizing Cubes, Cuboids, Spheres, and Cylinders",
              "Recognizing Cones and Pyramids",
              "Counting Faces, Edges, and Vertices",
              "Comparing 3D Solids by Their Properties",
              "Identifying 3D Shapes in Everyday Objects",
            ],
          },
          {
            number: 10,
            title: "Counting Grid Squares for Perimeter & Area",
            lessons: [
              "Understanding Perimeter as Distance Around a Shape",
              "Calculating Perimeter by Adding Side Lengths",
              "Understanding Area as Surface Covered",
              "Measuring Area by Counting Grid Squares",
              "Comparing Shapes by Perimeter and Area",
            ],
          },
        ],
      },
      {
        number: 7,
        title: "Introduction to Equations",
        units: [
          {
            number: 11,
            title: "Missing-Number Multiplication & Division Puzzles",
            lessons: [
              "Finding Missing Factors in Multiplication",
              "Finding Missing Numbers in Division",
              "Using Multiplication to Solve Division Puzzles",
              "Solving Missing-Number Problems with Boxes",
              "Applying Fact Families to Multi-Step Puzzles",
            ],
          },
          {
            number: 12,
            title: "Working Backward to Solve Number Riddles",
            lessons: [
              "Understanding Inverse Operations",
              "Working Backward from an Addition Result",
              "Working Backward from a Subtraction Result",
              "Working Backward with Multiplication and Division",
              "Solving Multi-Step Number Riddles",
            ],
          },
        ],
      },
      {
        number: 8,
        title: "Mathematical Reasoning and Puzzles",
        units: [
          {
            number: 13,
            title: "Two-Step Everyday Story Problems",
            lessons: [
              "Identifying the Information in a Word Problem",
              "Choosing the First Operation in a Two-Step Problem",
              "Choosing the Second Operation",
              "Solving Two-Step Problems with All Four Operations",
              "Checking Answers and Solving Everyday Challenges",
            ],
          },
          {
            number: 14,
            title: "Junior Math Olympiad Warm-Ups",
            lessons: [
              "Finding Hidden Rules in Number Patterns",
              "Solving Number and Shape Logic Puzzles",
              "Using Organized Counting Strategies",
              "Solving Simple Deduction Problems",
              "Applying Multiple Strategies to Challenge Problems",
            ],
          },
        ],
      },
    ],
  },
  {
    grade: 4,
    label: "GRADE 4 — INTERMEDIATE MATHEMATICS",
    topics: [
      {
        number: 1,
        title: "Place Value and Multi-Digit Operations",
        units: [
          {
            number: 1,
            title: "Large Numbers up to Millions & Billions",
            lessons: [
              "Understanding Place Value in Large Numbers",
              "Reading and Writing Numbers up to Millions",
              "Reading and Writing Numbers up to Billions",
              "Expanded Form and the Value of Each Digit",
              "Comparing and Ordering Large Numbers",
            ],
          },
          {
            number: 2,
            title: "Rounding, Estimation, & Mental Checks",
            lessons: [
              "Rounding Large Numbers to a Given Place",
              "Estimating Sums and Differences",
              "Estimating Products and Quotients",
              "Using Inverse Operations to Check Answers",
              "Choosing Reasonable Estimates in Multi-Step Problems",
            ],
          },
          {
            number: 3,
            title: "Multi-Digit Multiplication",
            lessons: [
              "Multiplying by Multiples of 10 and 100",
              "Multiplying Two-Digit Numbers by One-Digit Numbers",
              "Multiplying Two-Digit Numbers by Two-Digit Numbers",
              "Understanding Partial Products and the Area Model",
              "Solving Multi-Digit Multiplication Problems",
            ],
          },
          {
            number: 4,
            title: "Long Division & Interpreting Remainders",
            lessons: [
              "Understanding Division with Larger Numbers",
              "Dividing with a One-Digit Divisor",
              "Using Long Division Step by Step",
              "Interpreting Remainders in Different Situations",
              "Checking Division with Multiplication",
            ],
          },
        ],
      },
      {
        number: 2,
        title: "Factors, Multiples, and Divisibility",
        units: [
          {
            number: 5,
            title: "Factors, Multiples, & Divisibility Rules (2, 3, 5, 9, 10)",
            lessons: [
              "Finding Factors of Whole Numbers",
              "Identifying Multiples and Common Multiples",
              "Testing Divisibility by 2, 5, and 10",
              "Testing Divisibility by 3 and 9",
              "Applying Divisibility Rules to Solve Problems",
            ],
          },
          {
            number: 6,
            title: "Prime & Composite Numbers",
            lessons: [
              "Understanding Prime and Composite Numbers",
              "Identifying Prime Numbers",
              "Identifying Composite Numbers",
              "Finding Factor Pairs",
              "Classifying Numbers Using Factors and Divisibility",
            ],
          },
        ],
      },
      {
        number: 3,
        title: "Fractions",
        units: [
          {
            number: 7,
            title: "Equivalent Fractions & Simplifying",
            lessons: [
              "Understanding Equivalent Fractions",
              "Generating Equivalent Fractions with Multiplication",
              "Generating Equivalent Fractions with Division",
              "Simplifying Fractions to Their Lowest Terms",
              "Finding Missing Numerators and Denominators",
            ],
          },
        ],
      },
      {
        number: 4,
        title: "Decimals and Percentages",
        units: [
          {
            number: 8,
            title: "Decimal Place Value & Comparing Decimals",
            lessons: [
              "Understanding Tenths and Hundredths",
              "Reading and Writing Decimal Numbers",
              "Representing Decimals with Place-Value Models",
              "Comparing Decimals Using Place Value",
              "Ordering Decimals and Identifying Equivalent Decimals",
            ],
          },
        ],
      },
      {
        number: 8,
        title: "Algebraic Expressions",
        units: [
          {
            number: 9,
            title: "Variables & Evaluating Expressions",
            lessons: [
              "Understanding Variables as Unknown or Changing Values",
              "Translating Words into Algebraic Expressions",
              "Evaluating Expressions by Substituting Values",
              "Understanding the Order of Operations",
              "Evaluating Multi-Step Expressions",
            ],
          },
        ],
      },
      {
        number: 9,
        title: "Equations and Inequalities",
        units: [
          {
            number: 10,
            title: "Visual Balance Models & One-Step Equations",
            lessons: [
              "Representing Equality with Balance Models",
              "Solving Addition Equations",
              "Solving Subtraction Equations",
              "Solving Multiplication and Division Equations",
              "Checking Solutions to One-Step Equations",
            ],
          },
        ],
      },
      {
        number: 10,
        title: "Coordinate Geometry",
        units: [
          {
            number: 11,
            title: "Plotting Points in Quadrant 1 & All Four Quadrants",
            lessons: [
              "Understanding the Coordinate Plane and Axes",
              "Reading Ordered Pairs",
              "Plotting Points in the First Quadrant",
              "Plotting Points in All Four Quadrants",
              "Identifying Coordinates and Patterns on a Grid",
            ],
          },
        ],
      },
      {
        number: 11,
        title: "Geometry",
        units: [
          {
            number: 12,
            title: "Lines, Angles, & Angle Pairs (Complementary, Supplementary, Vertical)",
            lessons: [
              "Identifying Lines, Rays, and Line Segments",
              "Recognizing and Measuring Angles",
              "Understanding Complementary and Supplementary Angles",
              "Identifying Vertically Opposite Angles",
              "Finding Missing Angles Using Angle Relationships",
            ],
          },
          {
            number: 13,
            title: "Triangles & Quadrilaterals (Properties & Angle Sums)",
            lessons: [
              "Classifying Triangles by Sides",
              "Classifying Triangles by Angles",
              "Identifying and Classifying Quadrilaterals",
              "Understanding Interior Angle Sums",
              "Solving Problems Using Shape Properties and Angle Sums",
            ],
          },
        ],
      },
      {
        number: 12,
        title: "Measurement, Scale, and Rates",
        units: [
          {
            number: 14,
            title: "Metric Unit Conversions (Length, Mass, Volume)",
            lessons: [
              "Understanding Metric Units and Their Relationships",
              "Converting Between Millimeters, Centimeters, and Meters",
              "Converting Between Grams and Kilograms",
              "Converting Between Milliliters and Liters",
              "Solving Measurement Conversion Problems",
            ],
          },
        ],
      },
      {
        number: 13,
        title: "Data and Statistics",
        units: [
          {
            number: 15,
            title: "Reading & Building Bar, Line, & Pie Charts",
            lessons: [
              "Reading and Interpreting Bar Charts",
              "Creating Bar Charts from Data",
              "Reading and Interpreting Line Graphs",
              "Understanding and Interpreting Pie Charts",
              "Choosing Suitable Charts and Comparing Data",
            ],
          },
        ],
      },
      {
        number: 14,
        title: "Probability and Counting",
        units: [
          {
            number: 16,
            title: "Likelihood Scale & Theoretical Probability",
            lessons: [
              "Understanding Impossible, Unlikely, Likely, and Certain",
              "Describing the Likelihood of Everyday Events",
              "Identifying Possible Outcomes of Simple Experiments",
              "Understanding Theoretical Probability",
              "Comparing Probabilities and Predicting Outcomes",
            ],
          },
        ],
      },
      {
        number: 15,
        title: "Logic, Sequences, and Combinatorics",
        units: [
          {
            number: 17,
            title: "Arithmetic & Geometric Number Sequences",
            lessons: [
              "Identifying Arithmetic Sequences",
              "Finding Common Differences and Missing Terms",
              "Identifying Geometric Sequences",
              "Finding Common Ratios and Missing Terms",
              "Discovering Rules and Solving Sequence Puzzles",
            ],
          },
        ],
      },
    ],
  },
  {
    grade: 5,
    label: "GRADE 5 — INTERMEDIATE MATHEMATICS",
    topics: [
      {
        number: 1,
        title: "Place Value and Multi-Digit Operations",
        units: [
          {
            number: 1,
            title: "Order of Operations (PEMDAS / BODMAS)",
            lessons: [
              "Understanding the Order of Operations",
              "Evaluating Expressions with Brackets",
              "Evaluating Expressions with Multiplication and Division",
              "Evaluating Expressions with Addition and Subtraction",
              "Solving Multi-Step Numerical Expressions",
            ],
          },
        ],
      },
      {
        number: 2,
        title: "Factors, Multiples, and Divisibility",
        units: [
          {
            number: 2,
            title: "Prime Factorization & Factor Trees",
            lessons: [
              "Understanding Prime Factorization",
              "Building Factor Trees",
              "Finding Prime Factors of Composite Numbers",
              "Writing Prime Factorization with Exponents",
              "Solving Problems Using Prime Factorization",
            ],
          },
          {
            number: 3,
            title: "Greatest Common Factor (GCF) & Least Common Multiple (LCM)",
            lessons: [
              "Finding the Greatest Common Factor",
              "Finding the Least Common Multiple",
              "Using Prime Factorization to Find the GCF",
              "Using Prime Factorization to Find the LCM",
              "Applying GCF and LCM to Word Problems",
            ],
          },
        ],
      },
      {
        number: 3,
        title: "Fractions",
        units: [
          {
            number: 4,
            title: "Improper Fractions & Mixed Numbers",
            lessons: [
              "Understanding Proper and Improper Fractions",
              "Converting Improper Fractions to Mixed Numbers",
              "Converting Mixed Numbers to Improper Fractions",
              "Comparing Improper Fractions and Mixed Numbers",
              "Solving Problems with Mixed Numbers",
            ],
          },
          {
            number: 5,
            title: "Adding & Subtracting Fractions (Unlike Denominators)",
            lessons: [
              "Finding Common Denominators",
              "Adding Fractions with Unlike Denominators",
              "Subtracting Fractions with Unlike Denominators",
              "Simplifying Fraction Sums and Differences",
              "Solving Word Problems with Fraction Operations",
            ],
          },
        ],
      },
      {
        number: 4,
        title: "Decimals and Percentages",
        units: [
          {
            number: 6,
            title: "Adding, Subtracting, Multiplying, & Dividing Decimals",
            lessons: [
              "Adding Decimals by Aligning Place Values",
              "Subtracting Decimals by Aligning Place Values",
              "Multiplying Decimals by Whole Numbers",
              "Dividing Decimals by Whole Numbers",
              "Solving Multi-Step Decimal Problems",
            ],
          },
          {
            number: 7,
            title: "Converting Between Fractions, Decimals, & Percentages",
            lessons: [
              "Understanding Fractions, Decimals, and Percentages",
              "Converting Fractions to Decimals",
              "Converting Decimals to Percentages",
              "Converting Percentages to Fractions and Decimals",
              "Representing the Same Value in Three Forms",
            ],
          },
        ],
      },
      {
        number: 5,
        title: "Ratios and Proportions",
        units: [
          {
            number: 8,
            title: "Writing & Simplifying Ratios",
            lessons: [
              "Understanding Ratios as Comparisons",
              "Writing Ratios in Different Forms",
              "Comparing Part-to-Part and Part-to-Whole Ratios",
              "Simplifying Ratios",
              "Solving Everyday Ratio Problems",
            ],
          },
          {
            number: 9,
            title: "Equivalent Ratios & Ratio Tables",
            lessons: [
              "Understanding Equivalent Ratios",
              "Generating Equivalent Ratios",
              "Building and Completing Ratio Tables",
              "Finding Missing Values in Ratio Tables",
              "Applying Equivalent Ratios to Real-World Problems",
            ],
          },
        ],
      },
      {
        number: 6,
        title: "Negative Numbers",
        units: [
          {
            number: 10,
            title: "Integers Below Zero & Real-World Contexts (Temperature, Elevation)",
            lessons: [
              "Understanding Positive and Negative Numbers",
              "Locating Integers on a Number Line",
              "Understanding Negative Temperatures",
              "Representing Elevation Above and Below Sea Level",
              "Interpreting Positive and Negative Changes in Context",
            ],
          },
          {
            number: 11,
            title: "Comparing Integers & Absolute Value",
            lessons: [
              "Comparing Positive and Negative Integers",
              "Ordering Integers on a Number Line",
              "Understanding Absolute Value as Distance from Zero",
              "Comparing Absolute Values",
              "Solving Integer Comparison and Distance Problems",
            ],
          },
        ],
      },
      {
        number: 7,
        title: "Powers and Roots",
        units: [
          {
            number: 12,
            title: "Exponents as Repeated Multiplication",
            lessons: [
              "Understanding Bases and Exponents",
              "Writing Repeated Multiplication with Exponents",
              "Evaluating Powers of Whole Numbers",
              "Distinguishing Powers from Multiplication",
              "Applying Exponents to Numerical Patterns",
            ],
          },
          {
            number: 13,
            title: "Squares, Cubes, & Powers of 10",
            lessons: [
              "Understanding Square Numbers",
              "Understanding Cube Numbers",
              "Finding Squares and Cubes of Whole Numbers",
              "Understanding Powers of 10",
              "Using Squares, Cubes, and Powers of 10 in Problems",
            ],
          },
        ],
      },
      {
        number: 8,
        title: "Algebraic Expressions",
        units: [
          {
            number: 14,
            title: "Translating Word Phrases into Algebra",
            lessons: [
              "Understanding Variables and Algebraic Symbols",
              "Translating Addition and Subtraction Phrases",
              "Translating Multiplication and Division Phrases",
              "Writing Expressions with Multiple Operations",
              "Interpreting and Evaluating Expressions from Word Problems",
            ],
          },
        ],
      },
      {
        number: 9,
        title: "Equations and Inequalities",
        units: [
          {
            number: 15,
            title: "Two-Step Linear Equations",
            lessons: [
              "Understanding Two-Step Equations",
              "Solving Equations with Addition and Multiplication",
              "Solving Equations with Subtraction and Multiplication",
              "Solving Equations with Division and Addition or Subtraction",
              "Checking Solutions and Solving Word Problems",
            ],
          },
        ],
      },
      {
        number: 10,
        title: "Coordinate Geometry",
        units: [
          {
            number: 16,
            title: "Horizontal & Vertical Distance on the Grid",
            lessons: [
              "Identifying Horizontal and Vertical Movements",
              "Finding Horizontal Distance Between Points",
              "Finding Vertical Distance Between Points",
              "Calculating Distances Between Grid Points",
              "Solving Coordinate Grid Distance Problems",
            ],
          },
        ],
      },
      {
        number: 11,
        title: "Geometry",
        units: [
          {
            number: 17,
            title: "Perimeter & Area of Polygons (Rectangles, Triangles, Trapezoids)",
            lessons: [
              "Finding the Perimeter of Polygons",
              "Calculating the Area of Rectangles",
              "Calculating the Area of Triangles",
              "Understanding and Calculating the Area of Trapezoids",
              "Solving Multi-Step Perimeter and Area Problems",
            ],
          },
        ],
      },
      {
        number: 12,
        title: "Measurement, Scale, and Rates",
        units: [
          {
            number: 18,
            title: "Scale Drawings, Blueprints, & Map Distances",
            lessons: [
              "Understanding Scale and Scale Drawings",
              "Reading and Interpreting Scale Statements",
              "Calculating Actual Distances from Scaled Drawings",
              "Creating Simple Scale Drawings",
              "Solving Map and Blueprint Measurement Problems",
            ],
          },
        ],
      },
      {
        number: 13,
        title: "Data and Statistics",
        units: [
          {
            number: 19,
            title: "Mean, Median, Mode, & Range",
            lessons: [
              "Understanding Mean as an Average",
              "Calculating the Mean of a Data Set",
              "Finding the Median of Ordered Data",
              "Identifying the Mode and Range",
              "Comparing Data Sets Using Mean, Median, Mode, and Range",
            ],
          },
        ],
      },
    ],
  },
  {
    grade: 6,
    label: "GRADE 6 — INTERMEDIATE MATHEMATICS",
    topics: [
      {
        number: 3,
        title: "Fractions",
        units: [
          {
            number: 1,
            title: "Multiplying Fractions & Whole Numbers",
            lessons: [
              "Multiplying Fractions by Whole Numbers",
              "Multiplying a Whole Number by a Fraction",
              "Multiplying Fractions Using Visual Models",
              "Multiplying Fractions by Fractions",
              "Solving Word Problems with Fraction Multiplication",
            ],
          },
          {
            number: 2,
            title: "Dividing Fractions & Visual Fraction Models",
            lessons: [
              "Understanding Division of Fractions",
              "Dividing Whole Numbers by Unit Fractions",
              "Dividing Fractions by Whole Numbers",
              "Dividing Fractions Using Visual Models",
              "Solving Fraction Division Word Problems",
            ],
          },
        ],
      },
      {
        number: 4,
        title: "Decimals and Percentages",
        units: [
          {
            number: 3,
            title: "Finding Percentages of Quantities & Percent Change",
            lessons: [
              "Finding 10%, 25%, 50%, and Other Common Percentages",
              "Calculating a Percentage of a Quantity",
              "Finding What Percentage One Quantity Is of Another",
              "Calculating Percentage Increase",
              "Calculating Percentage Decrease and Percent Change",
            ],
          },
          {
            number: 4,
            title: "Applied Percentages: Discounts, Taxes, & Simple Interest",
            lessons: [
              "Calculating Discounts and Sale Prices",
              "Calculating Tax and Final Prices",
              "Finding Original Prices from Discounts",
              "Understanding Simple Interest",
              "Solving Everyday Financial Percentage Problems",
            ],
          },
        ],
      },
      {
        number: 5,
        title: "Ratios and Proportions",
        units: [
          {
            number: 5,
            title: "Unit Rates & Best-Buy Comparisons",
            lessons: [
              "Understanding Rates and Unit Rates",
              "Calculating Price per Unit",
              "Comparing Speeds and Other Everyday Rates",
              "Comparing Unit Prices to Find the Best Buy",
              "Solving Multi-Step Rate Problems",
            ],
          },
          {
            number: 6,
            title: "Solving Proportions & Cross-Multiplication",
            lessons: [
              "Understanding Proportions as Equivalent Ratios",
              "Finding Missing Values in Proportions",
              "Solving Proportions Using Equivalent Ratios",
              "Introducing Cross-Multiplication",
              "Solving Real-World Proportion Problems",
            ],
          },
          {
            number: 7,
            title: "Proportional Sharing & Mixture Problems",
            lessons: [
              "Dividing Quantities in a Given Ratio",
              "Finding Each Share in Proportional Sharing",
              "Scaling Recipes and Mixtures",
              "Solving Mixture Problems with Ratios",
              "Applying Proportional Reasoning to Multi-Step Problems",
            ],
          },
        ],
      },
      {
        number: 6,
        title: "Negative Numbers",
        units: [
          {
            number: 8,
            title: "Adding & Subtracting Negative Numbers",
            lessons: [
              "Adding Integers on a Number Line",
              "Adding Positive and Negative Integers",
              "Subtracting Integers on a Number Line",
              "Subtracting Negative Numbers",
              "Solving Real-World Integer Addition and Subtraction Problems",
            ],
          },
        ],
      },
      {
        number: 7,
        title: "Powers and Roots",
        units: [
          {
            number: 9,
            title: "Square Roots & Cube Roots",
            lessons: [
              "Understanding Square Roots",
              "Finding Square Roots of Perfect Squares",
              "Understanding Cube Roots",
              "Finding Cube Roots of Perfect Cubes",
              "Solving Problems with Squares, Square Roots, Cubes, and Cube Roots",
            ],
          },
        ],
      },
      {
        number: 8,
        title: "Algebraic Expressions",
        units: [
          {
            number: 10,
            title: "Combining Like Terms",
            lessons: [
              "Identifying Like and Unlike Terms",
              "Understanding Coefficients and Constants",
              "Combining Like Terms Using Addition",
              "Combining Like Terms Using Subtraction",
              "Simplifying Multi-Term Algebraic Expressions",
            ],
          },
          {
            number: 11,
            title: "Distributive Property & Expanding Brackets",
            lessons: [
              "Understanding the Distributive Property",
              "Expanding Brackets with Addition",
              "Expanding Brackets with Subtraction",
              "Expanding Expressions with Negative Coefficients",
              "Expanding and Simplifying Algebraic Expressions",
            ],
          },
        ],
      },
      {
        number: 9,
        title: "Equations and Inequalities",
        units: [
          {
            number: 12,
            title: "Equations with Variables on Both Sides",
            lessons: [
              "Understanding Variables on Both Sides of an Equation",
              "Collecting Variable Terms on One Side",
              "Solving Equations with Variables on Both Sides",
              "Solving Equations with Brackets on Both Sides",
              "Checking Solutions and Solving Equation Word Problems",
            ],
          },
          {
            number: 13,
            title: "Writing & Graphing Inequalities on a Number Line",
            lessons: [
              "Understanding Inequality Symbols",
              "Translating Word Statements into Inequalities",
              "Representing Inequalities on a Number Line",
              "Solving One-Step Inequalities",
              "Interpreting and Checking Inequality Solutions",
            ],
          },
        ],
      },
      {
        number: 10,
        title: "Coordinate Geometry",
        units: [
          {
            number: 14,
            title: "Reflections & Translations on the Coordinate Plane",
            lessons: [
              "Understanding Translations on a Coordinate Grid",
              "Translating Points Horizontally and Vertically",
              "Understanding Reflections Across the Axes",
              "Reflecting Points and Shapes on the Coordinate Plane",
              "Combining Translations and Reflections",
            ],
          },
        ],
      },
      {
        number: 11,
        title: "Geometry",
        units: [
          {
            number: 15,
            title: "Circles: Radius, Diameter, Circumference, & Area",
            lessons: [
              "Identifying the Center, Radius, and Diameter",
              "Understanding the Relationship Between Radius and Diameter",
              "Understanding Pi and Circumference",
              "Calculating the Circumference of a Circle",
              "Understanding and Calculating the Area of a Circle",
            ],
          },
          {
            number: 16,
            title: "3D Nets & Surface Area",
            lessons: [
              "Understanding 3D Solids and Their Nets",
              "Identifying Nets of Cubes and Cuboids",
              "Connecting 2D Nets to 3D Shapes",
              "Calculating Surface Area by Adding Face Areas",
              "Solving Surface-Area Problems with 3D Solids",
            ],
          },
        ],
      },
      {
        number: 13,
        title: "Data and Statistics",
        units: [
          {
            number: 17,
            title: "Choosing the Best Average & Spotting Outliers",
            lessons: [
              "Comparing Mean, Median, and Mode",
              "Choosing an Appropriate Average for a Data Set",
              "Understanding Outliers in Data",
              "Exploring How Outliers Affect the Mean and Median",
              "Interpreting and Comparing Data Sets with Outliers",
            ],
          },
          {
            number: 18,
            title: "Histograms & Frequency Tables",
            lessons: [
              "Understanding Frequency and Tally Tables",
              "Organizing Data into Frequency Tables",
              "Understanding Class Intervals in Grouped Data",
              "Reading and Interpreting Histograms",
              "Creating Histograms and Comparing Distributions",
            ],
          },
        ],
      },
      {
        number: 14,
        title: "Probability and Counting",
        units: [
          {
            number: 19,
            title: "Experimental Probability & Simulations",
            lessons: [
              "Understanding Experimental Probability",
              "Recording Outcomes of Repeated Experiments",
              "Calculating Experimental Probabilities",
              "Comparing Experimental and Theoretical Probability",
              "Using Simulations to Investigate Chance",
            ],
          },
        ],
      },
      {
        number: 15,
        title: "Logic, Sequences, and Combinatorics",
        units: [
          {
            number: 20,
            title: "Visual Growth Patterns & Finding the n-th Term",
            lessons: [
              "Identifying Visual Growth Patterns",
              "Building Tables for Growing Patterns",
              "Finding the Rule for a Growing Pattern",
              "Connecting Pattern Rules to Algebraic Expressions",
              "Finding and Using the n-th Term of a Sequence",
            ],
          },
        ],
      },
    ],
  },
  {
    grade: 7,
    label: "GRADE 7 — INTERMEDIATE MATHEMATICS",
    topics: [
      {
        number: 6,
        title: "Negative Numbers",
        units: [
          {
            number: 1,
            title: "Multiplying & Dividing Negative Numbers",
            lessons: [
              "Understanding the Rules for Multiplying Integers",
              "Multiplying Positive and Negative Numbers",
              "Understanding the Rules for Dividing Integers",
              "Dividing Positive and Negative Numbers",
              "Solving Multi-Step Problems with Integer Operations",
            ],
          },
        ],
      },
      {
        number: 7,
        title: "Powers and Roots",
        units: [
          {
            number: 2,
            title: "Basic Exponent Laws & Scientific Notation Intro",
            lessons: [
              "Multiplying Powers with the Same Base",
              "Dividing Powers with the Same Base",
              "Understanding Zero and Negative Exponents",
              "Understanding Scientific Notation",
              "Converting Between Scientific Notation and Standard Form",
            ],
          },
        ],
      },
      {
        number: 8,
        title: "Algebraic Expressions",
        units: [
          {
            number: 3,
            title: "Factoring Simple Linear Expressions",
            lessons: [
              "Understanding Factors in Algebraic Expressions",
              "Finding the Greatest Common Factor of Terms",
              "Factoring Expressions Using the Greatest Common Factor",
              "Factoring Expressions with Positive and Negative Terms",
              "Expanding and Factoring Expressions: Connecting the Two Processes",
            ],
          },
        ],
      },
      {
        number: 9,
        title: "Equations and Inequalities",
        units: [
          {
            number: 4,
            title: "Solving One- & Two-Step Inequalities",
            lessons: [
              "Understanding Inequalities and Their Solutions",
              "Solving One-Step Inequalities Using Addition and Subtraction",
              "Solving One-Step Inequalities Using Multiplication and Division",
              "Solving Two-Step Inequalities",
              "Graphing and Checking Inequality Solutions",
            ],
          },
        ],
      },
      {
        number: 10,
        title: "Coordinate Geometry",
        units: [
          {
            number: 5,
            title: "Plotting Linear Patterns & Intro to Slope",
            lessons: [
              "Identifying Patterns in Coordinate Tables",
              "Plotting Ordered Pairs on the Coordinate Plane",
              "Connecting Tables, Patterns, and Graphs",
              "Understanding Slope as Steepness and Rate of Change",
              "Finding Slope from Simple Graphs and Points",
            ],
          },
        ],
      },
      {
        number: 11,
        title: "Geometry",
        units: [
          {
            number: 6,
            title: "Volume of Prisms & Cylinders",
            lessons: [
              "Understanding Volume and Cubic Units",
              "Calculating the Volume of Rectangular Prisms",
              "Finding the Volume of Triangular Prisms",
              "Understanding and Calculating the Volume of Cylinders",
              "Solving Multi-Step Volume Problems",
            ],
          },
        ],
      },
      {
        number: 12,
        title: "Measurement, Scale, and Rates",
        units: [
          {
            number: 7,
            title: "Time, Speed, & Distance Fundamentals",
            lessons: [
              "Understanding the Relationship Between Distance, Speed, and Time",
              "Calculating Speed from Distance and Time",
              "Calculating Distance from Speed and Time",
              "Calculating Travel Time from Distance and Speed",
              "Converting Units and Solving Everyday Travel Problems",
            ],
          },
          {
            number: 8,
            title: "Relative Speed & Multi-Leg Journey Problems",
            lessons: [
              "Understanding Relative Speed",
              "Calculating Relative Speed When Moving in the Same Direction",
              "Calculating Relative Speed When Moving in Opposite Directions",
              "Solving Journeys with Multiple Stages",
              "Solving Multi-Step Journey Problems with Schedules and Stops",
            ],
          },
        ],
      },
      {
        number: 13,
        title: "Data and Statistics",
        units: [
          {
            number: 9,
            title: "Interpreting Misleading Graphs & Real Data",
            lessons: [
              "Recognizing Different Types of Graphs",
              "Identifying Truncated Axes and Misleading Scales",
              "Understanding How Graph Design Can Distort Comparisons",
              "Evaluating Claims Made from Data",
              "Analyzing Real Data and Communicating Evidence-Based Conclusions",
            ],
          },
        ],
      },
      {
        number: 14,
        title: "Probability and Counting",
        units: [
          {
            number: 10,
            title: "Sample Spaces, Grids, & Tree Diagrams",
            lessons: [
              "Understanding Outcomes and Sample Spaces",
              "Listing Outcomes Systematically",
              "Representing Possible Outcomes with Grids",
              "Constructing and Reading Tree Diagrams",
              "Calculating Probabilities from Sample Spaces",
            ],
          },
          {
            number: 11,
            title: "Compound Events (Independent & Dependent)",
            lessons: [
              "Understanding Compound Events",
              "Identifying Independent and Dependent Events",
              "Calculating Probabilities of Independent Events",
              "Calculating Probabilities of Dependent Events",
              "Solving Multi-Step Compound Probability Problems",
            ],
          },
        ],
      },
      {
        number: 15,
        title: "Logic, Sequences, and Combinatorics",
        units: [
          {
            number: 12,
            title: "The Counting Principle & Permutations",
            lessons: [
              "Using Organized Lists and Tables to Count Outcomes",
              "Understanding the Fundamental Counting Principle",
              "Applying the Counting Principle to Multi-Stage Choices",
              "Understanding Permutations and Ordered Arrangements",
              "Solving Counting Problems Involving Arrangements",
            ],
          },
          {
            number: 13,
            title: "Combinations & Handshake-Style Problems",
            lessons: [
              "Understanding Combinations as Selections Without Order",
              "Distinguishing Combinations from Permutations",
              "Counting Pairs and Groups Systematically",
              "Solving Handshake and Connection Problems",
              "Applying Combinations to Real-World Counting Problems",
            ],
          },
          {
            number: 14,
            title: "Deductive Logic Grids, Pigeonhole Principle, & Olympiad Puzzles",
            lessons: [
              "Organizing Clues in Deductive Logic Grids",
              "Using Elimination to Solve Logic Puzzles",
              "Understanding the Pigeonhole Principle",
              "Applying the Pigeonhole Principle to Counting Problems",
              "Solving Multi-Step Mathematical Olympiad Puzzles",
            ],
          },
        ],
      },
      {
        number: 16,
        title: "Real-World Math Projects",
        units: [
          {
            number: 15,
            title: "Planning a Trip (Distance, Fuel/Ticket Costs, & Schedules)",
            lessons: [
              "Comparing Destinations and Planning a Route",
              "Calculating Journey Distances and Travel Times",
              "Estimating Fuel or Ticket Costs",
              "Building a Realistic Travel Schedule",
              "Creating and Evaluating a Complete Trip Budget",
            ],
          },
          {
            number: 16,
            title: "Running a Mini-Business (Pricing, Discounts, & Profit Margins)",
            lessons: [
              "Calculating Costs and Setting Selling Prices",
              "Calculating Revenue and Total Costs",
              "Understanding Profit and Loss",
              "Applying Discounts and Calculating Profit Margins",
              "Creating a Simple Business Budget and Evaluating Profitability",
            ],
          },
          {
            number: 17,
            title: "Designing a Room or Park (Scale, Area, & Material Budgets)",
            lessons: [
              "Reading and Creating Scale Plans",
              "Measuring Spaces and Calculating Areas",
              "Dividing a Design into Measurable Sections",
              "Estimating Material Quantities and Costs",
              "Producing a Scaled Design with a Materials Budget",
            ],
          },
          {
            number: 18,
            title: "Data Detective Investigation (Analyzing Surveys & Making Predictions)",
            lessons: [
              "Designing Clear and Unbiased Survey Questions",
              "Collecting and Organizing Survey Data",
              "Choosing Suitable Tables, Charts, and Averages",
              "Identifying Patterns, Limitations, and Possible Biases",
              "Presenting Evidence-Based Conclusions and Predictions",
            ],
          },
        ],
      },
    ],
  },
];
