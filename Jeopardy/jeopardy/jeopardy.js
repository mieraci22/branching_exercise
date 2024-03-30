// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

const NUM_CATEGORIES = 6;

async function getCategoryIds() {
    try {
        let response = await axios.get('https://rithm-jeopardy.herokuapp.com/api/categories?count=100');
        let catIDs = response.data.map(cat => cat.id);
        return _.sampleSize(catIDs, NUM_CATEGORIES);
    } catch (error) {
        console.error("Error fetching category IDs:", error);
        alert("There was a problem fetching the categories. Please try again.");
    }
}


/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

const NUM_QUESTIONS_PER_CAT = 5;

async function getCategory(catId) {
    let response = await axios.get(`https://rithm-jeopardy.herokuapp.com/api/category?id=${catId}`);
    let category = {
      title: response.data.title,
      clues: _.sampleSize(response.data.clues, NUM_QUESTIONS_PER_CAT).map(clue => ({
        question: clue.question,
        answer: clue.answer,
        showing: null,
      })),
    };
    return category;
  }

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    $("#jeopardy thead").empty();
    $("#jeopardy tbody").empty();
  
    let $tr = $("<tr>");
    for (let cat of categories) {
      $tr.append($("<th>").text(cat.title));
    }
    $("#jeopardy thead").append($tr);
  
    for (let clueIdx = 0; clueIdx < NUM_QUESTIONS_PER_CAT; clueIdx++) {
      let $tr = $("<tr>");
      for (let catIdx = 0; catIdx < NUM_CATEGORIES; catIdx++) {
        $tr.append($("<td>").attr("id", `${catIdx}-${clueIdx}`).text("?"));
      }
      $("#jeopardy tbody").append($tr);
    }
  }
  

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    let id = evt.target.id.split("-");
    let catIdx = parseInt(id[0]);
    let clueIdx = parseInt(id[1]);
    let clue = categories[catIdx].clues[clueIdx];
  
    if (clue.showing === "question") {
      $(`#${catIdx}-${clueIdx}`).text(clue.answer);
      clue.showing = "answer";
    } else if (!clue.showing) {
      $(`#${catIdx}-${clueIdx}`).text(clue.question);
      clue.showing = "question";
    }
  }
  

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $("#start-btn").text("Loading...").prop("disabled", true);
}

function hideLoadingView() {
    $("#start-btn").text("Restart").prop("disabled", false);
}


/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    showLoadingView();
    let categoryIds = await getCategoryIds();
    categories = await Promise.all(categoryIds.map(id => getCategory(id)));
    fillTable();
    hideLoadingView();
  }
  

/** On click of start / restart button, set up game. */

// TODO

$(async function() {
    // Event handler for starting the game
    $("#start-btn").on("click", setupAndStart);
  
    // Event handler for clue clicks
    $("#jeopardy tbody").on("click", "td", handleClick);
  });
  
/** On page load, add event handler for clicking clues */

// TODO