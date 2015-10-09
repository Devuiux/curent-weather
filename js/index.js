var data, dataout, metric, timer;

var matchRecent = [];
var beforeRecent = [];
var recent = [];

window.onhashchange = OnHashChange;
window.onload = OnHashChange;

var ractive = new Ractive({
  el: '.main',
  template: '#template',
  data: {
    metric: 'metric',
    degrees: '°C',
    second: recent
  }
});

//on input keyup
ractive.on('trigger-search', function(ev) {
  clearTimeout(timer);

  timer = setTimeout(function() {
    SetHashLocation();
  }, 900);

});

//use the metric or imperial units from API
ractive.on('degrees-switched', function(ev) {
  ractive.set('metric', 'metric');
  if (ractive.get('degrees') == '°F') {
    ractive.set('metric', 'imperial');
  }
  CustomSearch(false);
});

ractive.on('select-recent', function(ev) {
  SetHashLocation();
});

function CustomSearch(newRecent) {
  var city = ractive.get('city');
  if (city == '') return false;

  //can't find how to get json with Ractive
  $.getJSON('http://api.openweathermap.org/data/2.5/weather?q=' + city + '&APPID=e4a92db9bfa984d9485173ba486101c7&mode=json&units=' + ractive.get('metric')).done(function(datain) {

    //set the weather JSON in ractive data
    ractive.set('dataout', datain);

    //check for errors
    ErrorCheck();

    //set new recent only for search trigger
    if (newRecent) {
      AddRecent(datain.name);
    }
  });
}

function AddRecent(city) {
  var inarr = matchRecent.indexOf(city);
  var inarr1 = beforeRecent.indexOf(city);

  //a list of non-duplicate searches
  if (matchRecent.length == 0 || inarr < 0) {
    matchRecent.push(city);
  }

  //a list of duplicate searches
  if (inarr > -1 && inarr1 < 0 && city != undefined) {

    //beforeRecent is for inarray
    beforeRecent.push(city);
    recent.unshift(0);
    recent[0] = {
      name: city
    };

    //update in ractive
    ractive.update('second');
  }
}

function ErrorCheck() {
  if (ractive.get('dataout.cod') == '404') {
    ractive.set('error', 'Error: Not found city');
    ractive.set('dataout.weather[0].icon', '01n');
    ractive.set('dataout.main.temp', '0');
  } else {
    ractive.set('error', undefined);
  }
}

function SetHashLocation() {
  var city = ractive.get('city');
  window.location.hash = '#' + city;
}

function OnHashChange() {
  var hash = window.location.hash;
  if (hash != undefined || hash != "") {
    ractive.set('city', hash.substring(1));
    CustomSearch(true);
  }
}
