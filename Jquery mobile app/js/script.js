$(document).one('pageinit',function() {
showRun();
  // Add Handler
  $('#submitAdd').on('tap', addRun);

// show all run in homepage
  function showRun(){
    var runs = getRunsObject();
    if (runs != '' && runs != null) {
      for (var i = 0; i < runs.length; i++) {
        $('#stats').append('<li class="ui-body-inherit ui-li-static"><strong>Date:</strong>'+runs[i]["date"]+
        '<br><strong>Distance:</strong>'+runs[i]["date"]+'</li>');
        $('#home').bind('pageinit', function(event) {
          /* Act on the event */
          $('#stats').listview('refresh');
        });
      }
    }
  }

  /*
  Add a run
  */
  function addRun(){
    // get form values
    var miles = $('#addMiles').val();
    var date = $('#addDate').val();

    // Create 'run' object
    var run = {
      date: date,
      miles: parseFloat(miles)
    };
    var runs=getRunsObject();
    // Add run to run arrays
    runs.push(run);
    alert("run Added");

    // set stringdffield object to localstorage
    localStorage.setItem('runs', JSON.stringify(runs));

    // redirect
    window.location.href="index.html";
  };

  /*
  Get the runs object
  */
  function getRunsObject(){
    // set runs arrays
    var runs = new Array();
    // Get current runs from local storage
    var currentRuns = localStorage.getItem('runs');

    // Check localstorage
    if (currentRuns != null) {
      // set to runs
      var runs = JSON.parse(currentRuns);
    }
    // return runs object
    return runs.sort(function(a,b){return new Date(b.date) - new Date(a.date)})
  };


})
