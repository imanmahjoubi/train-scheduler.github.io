var config = {
    apiKey: "AIzaSyCXjER3NcezF-EcwjqCPeoNX3UWafdvvUs",
    authDomain: "train-scheduler-b7277.firebaseapp.com",
    databaseURL: "https://train-scheduler-b7277.firebaseio.com",
    projectId: "train-scheduler-b7277",
    storageBucket: "",
    messagingSenderId: "388241317642"
};

firebase.initializeApp(config);
var database = firebase.database();

setInterval(function(startTime) {
  $("#timer").html(moment().format('hh:mm a'))
}, 1000);

$("#add-train").on("click", function() {
  event.preventDefault();

  var train = $("#trainname-input").val().trim();
  var destination = $("#destination-input").val().trim();
  var frequency = $("#frequency-input").val().trim();
  var firstTime = $("#firsttime-input").val().trim();

  var trainInfo = { 
    formtrain: train,
    formdestination: destination,
    formfrequency: frequency,
    formfirsttime: firstTime,
    dateAdded: firebase.database.ServerValue.TIMESTAMP
  };
  database.ref().push(trainInfo);

  $("#trainname-input").val("");
  $("#destination-input").val("");
  $("#frequency-input").val("");
  $("#firsttime-input").val("");

});


// Firebase watcher + initial loader 
database.ref().on("child_added", function(childSnapshot, prevChildKey) {  
  var train = childSnapshot.val().formtrain;
  var destination = childSnapshot.val().formdestination;
  var frequency = childSnapshot.val().formfrequency;
  var firstTime = childSnapshot.val().formfirsttime;
  var firstTimeConverted = moment(firstTime, "hh:mm").subtract(1, "years");
  var currentTime = moment();

  $("#timer").text(currentTime.format("hh:mm a"));

  var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

  var tRemainder = diffTime % frequency;

  var minutesAway = frequency - tRemainder;

  var nextArrival = moment().add(minutesAway, "minutes").format("hh:mm a");

  $("#train-table > tbody").append("<tr><td>" + '<i class="fa fa-trash" id="trashcan" aria-hidden="true"></i>' + "</td><td>" + train + "</td><td>" + destination + "</td><td>" +
  frequency + "</td><td>" + nextArrival + "</td><td>" + minutesAway + "</td></tr>");
}, function(errorObject) {
});

$("body").on("click", ".fa-trash", function() {
  $(this).closest("tr").remove(); 
  alert("delete button clicked");
});

function timeUpdater() {
  $("#train-table > tbody").empty();
  
  database.ref().on("child_added", function(childSnapshot, prevChildKey) {  
  var train = childSnapshot.val().formtrain;
  var destination = childSnapshot.val().formdestination;
  var frequency = childSnapshot.val().formfrequency;
  var firstTime = childSnapshot.val().formfirsttime;

  // First Time (pushed back 1 year to make sure it comes before current time)
  var firstTimeConverted = moment(firstTime, "hh:mm").subtract(1, "years");

  var currentTime = moment();
  $("#timer").text(currentTime.format("hh:mm a"));

  var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
  console.log("DIFFERENCE IN TIME: " + diffTime);

  var tRemainder = diffTime % frequency;
  console.log("Remainder: " + tRemainder);
  //duration of the wait
  var minutesAway = frequency - tRemainder;
  console.log("MINUTES TILL TRAIN: " + minutesAway);

  //determine Next Train Arrival
  var nextArrival = moment().add(minutesAway, "minutes").format("hh:mm a");
  console.log("ARRIVAL TIME: " + moment(nextArrival).format("hh:mm a"));

  $("#train-table > tbody").append("<tr><td>" + train + "</td><td>" + destination + "</td><td>" +
  frequency + "</td><td>" + nextArrival + "</td><td>" + minutesAway + "</td></tr>");

  })
};

setInterval(timeUpdater, 6000);
