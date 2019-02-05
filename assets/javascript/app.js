$(document).ready(function(){

    //RUNNING CLOCK
    function runningClock() {
        time = moment().format("H:mm:ss A");
        $("#time").text(time);
    }
    //CALL FUNCTION WITH setInterval
    clock = setInterval(runningClock , 1000);
    
    
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyDhYLeSqTBOeGRHVdIqWAkSkyvPv2Rwve4",
        authDomain: "train-scheduler-d034a.firebaseapp.com",
        databaseURL: "https://train-scheduler-d034a.firebaseio.com",
        projectId: "train-scheduler-d034a",
        storageBucket: "train-scheduler-d034a.appspot.com",
        messagingSenderId: "316920606080"
    };
    firebase.initializeApp(config);

    //DATABASE REF
    var database = firebase.database();

    //VARS FOR onClick EVENTS
    var name;
    var destination;
    var firstTrain;
    var frequency = 0;

    $("#add-train").on("click", function() {
        event.preventDefault();
        //STORING AND RETRIEVING NEW TRAIN DATA
        name = $("#train-name").val().trim();
        destination = $("#destination").val().trim();
        firstTrain = $("#first-train").val().trim();
        frequency = $("#frequency").val().trim();

        //PUSHING TO DATABASE
        database.ref().push({
            name: name,
            destination: destination,
            firstTrain: firstTrain,
            frequency: frequency,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });
        $("form")[0].reset();
    });

    database.ref().on("child_added", function(childSnapshot) {
        var nextArr;
        var minAway;
        //CONVERTS FIRST TRAIN TIME BACK A YEAR. MAKES SURE IT'S SET BEFORE THE CURRENT TIME BEFORE PUSHING TO FIREBASE.
        var firstTrainNew = moment(childSnapshot.val().firstTrain, "hh:mm").subtract(1, "years");
        //DIFFERENCE BETWEEN THE CURRENT AND FIRST TRAIN.
        var diffTime = moment().diff(moment(firstTrainNew), "minutes");
        var remainder = diffTime % childSnapshot.val().frequency;
        //MINUTES UNTIL NEXT TRAIN.
        var minAway = childSnapshot.val().frequency - remainder;
        //NEXT TRAIN TIME.
        var nextTrain = moment().add(minAway, "minutes");
        nextTrain = moment(nextTrain).format("hh:mm");


        //APPEND ALL INFO FOR TRAIN DATE SUBMITTED BY THE USER.
        $("#add-row").append("<tr><td>" + childSnapshot.val().name +
                "</td><td>" + childSnapshot.val().destination +
                "</td><td>" + childSnapshot.val().frequency +
                "</td><td>" + nextTrain + 
                "</td><td>" + minAway + "</td></tr>");

            //HANDLE THE ERRORS.
        }, function(errorObject) {
            console.log("Errors handled: " + errorObject.code);
    });

    database.ref().orderByChild("dateAdded").limitToLast(1).on("child_added", function(snapshot) {
        //CHANGE THE HTML TO REFLECT.
        $("#name-display").html(snapshot.val().name);
        $("#email-display").html(snapshot.val().email);
        $("#age-display").html(snapshot.val().age);
        $("#comment-display").html(snapshot.val().comment);
    });
});