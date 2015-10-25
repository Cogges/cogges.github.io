<!--
/**
 * Converts an xs:date or xs:dateTime formatted string into the local timezone
 * and outputs a human-readable form of this date or date/time.
 *
 * @param {string} gCalTime is the xs:date or xs:dateTime formatted string
 * @return {string} is the human-readable date or date/time string
 */
function formatGCalTime(gCalTime) {
  // text for regex matches
  var remtxt = gCalTime;

  function consume(retxt) {
    var match = remtxt.match(new RegExp('^' + retxt));
    if (match) {
      remtxt = remtxt.substring(match[0].length);
      return match[0];
    }
    return '';
  }

  // minutes of correction between gCalTime and GMT
  var totalCorrMins = 0;

  var year = consume('\\d{4}');
  consume('-?');
  var month = consume('\\d{2}');
  consume('-?');
  var dateMonth = consume('\\d{2}');
  var timeOrNot = consume('T');

  // if a DATE-TIME was matched in the regex
  if (timeOrNot == 'T') {
    var hours = consume('\\d{2}');
    consume(':?');
    var mins = consume('\\d{2}');
    consume('(:\\d{2})?(\\.\\d{3})?');
    var zuluOrNot = consume('Z');

    // if time from server is not already in GMT, calculate offset
    if (zuluOrNot != 'Z') {
      var corrPlusMinus = consume('[\\+\\-]');
      if (corrPlusMinus != '') {
        var corrHours = consume('\\d{2}');
        consume(':?');
        var corrMins = consume('\\d{2}');
        totalCorrMins = (corrPlusMinus=='-' ? 1 : -1) *
            (Number(corrHours) * 60 +
      (corrMins=='' ? 0 : Number(corrMins)));
      }
    }

    // get time since epoch and apply correction, if necessary
    // relies upon Date object to convert the GMT time to the local
    // timezone
    var originalDateEpoch = Date.UTC(year, month - 1, dateMonth, hours, mins);
    var gmtDateEpoch = originalDateEpoch + totalCorrMins * 1000 * 60;
    var ld = new Date(gmtDateEpoch);

    // date is originally in YYYY-MM-DD format
    // time is originally in a 24-hour format
    // this converts it to MM/DD hh:mm (AM|PM)
    dateString = (ld.getMonth() + 1) + '/' + ld.getDate() + ' ' +
        ((ld.getHours()>12)?(ld.getHours()-12):(ld.getHours()===0?12:
  ld.getHours())) + ':' + ((ld.getMinutes()<10)?('0' +
  ld.getMinutes()):(ld.getMinutes())) + ' ' +
  ((ld.getHours()>=12)?'PM':'AM');
  } else {
    // if only a DATE was matched
    dateString =  parseInt(month, 10) + '/' + parseInt(dateMonth, 10);
  }
  return dateString;
}

/**
 * Creates an unordered list of events in a human-readable form
 *
 * @param {json} root is the root JSON-formatted content from GData
 * @param {string} divId is the div in which the events are added
 */
function listEvents(feed, divId) {
  var events = document.getElementById(divId);

  //if (events.childNodes.length > 0) {
  //  events.removeChild(events.childNodes[0]);
  //}

  // create a new unordered list
  var ul = document.createElement('ul');
  var monthNames = [ "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

  // loop through each event in the feed
  for (var i = 0; i < feed.items.length; i++) {
    var entry = feed.items[i];
    //console.log(entry);
    var title = entry.summary;
    if (title === undefined) {
      continue;
    }
    var body = entry.description;
    if (body === undefined) {
      body = "";
    }

    var where = entry.location;
    if (where === undefined) {
      where = "";
    }

    var start = entry.start.dateTime;
    var series = false;

    if (title.search('Funeral') != -1) {
      continue;
    }

    if (title.search('Wedding') != -1) {
      continue;
    }

    if (entry.sequence > 0) {
      series = true;
    }


    // get the URL to link to the event
    // for (var linki = 0; linki < entry['link'].length; linki++) {
    //   if (entry['link'][linki]['type'] == 'text/html' &&
    //       entry['link'][linki]['rel'] == 'alternate') {
    //     var entryLinkHref = entry['link'][linki]['href'];
    //   }
    // }

    var dateString = formatGCalTime(start);

    var monthString = monthNames[parseInt(start.substr(5,2),10)];
    var dayString = start.substr(8,2);

    var daySpan = document.createElement('span');
    daySpan.setAttribute('class', "day");
    daySpan.appendChild(document.createTextNode(dayString));

    var monthSpan = document.createElement('span');
    monthSpan.setAttribute('class', "month");
    monthSpan.appendChild(document.createTextNode(monthString));

    var startSpan = document.createElement('span');
    startSpan.setAttribute('class', "start");

    if (dateString.search("PM") > 0 || dateString.search("AM") > 0) {
      var timeList = dateString.split(' ').slice(1,3)
      startSpan.appendChild(document.createTextNode(timeList[0] + ' ' + timeList[1]));
    }

    var dateDiv = document.createElement('div');
    dateDiv.setAttribute('class', "date");
    dateDiv.appendChild(daySpan);
    dateDiv.appendChild(monthSpan);
    dateDiv.appendChild(startSpan);

    var titleSpan = document.createElement('span');
    titleSpan.setAttribute('class', "title");
    titleSpan.appendChild(document.createTextNode(title));

    var contentSpan = document.createElement('span');
    contentSpan.setAttribute('class', "event-content");
    contentSpan.appendChild(document.createTextNode(body));

    var whereSpan = document.createElement('span');
    whereSpan.setAttribute('class', "event-where");
    whereSpan.appendChild(document.createTextNode(where));

    var eventDiv = document.createElement('div');
    eventDiv.setAttribute('class', "event");
    eventDiv.appendChild(titleSpan);
    eventDiv.appendChild(contentSpan);
    eventDiv.appendChild(whereSpan);

    var li = document.createElement('li');
    li.appendChild(dateDiv);
    li.appendChild(eventDiv);

    // append the list item onto the unordered list
    ul.appendChild(li);

  }
  events.appendChild(ul);
}

// date functions
Date.prototype.getWeek = function(start)  {
  start = start || 0;
  var today = new Date(this.setHours(0, 0, 0, 0));
  var day = today.getDay() - start;
  var date = today.getDate() - day;

  var StartDate = new Date(today.setDate(date));
  var EndDate = new Date(today.setDate(date + 6));
  return [StartDate, EndDate];
}
// set Dates to the start & end days of the week
var Dates = new Date().getWeek();

// calculate today's date
var today = new Date();
today = today.toISOString();

// google api console clientID and apiKey (https://code.google.com/apis/console/#project:568391772772)
var clientId = 'cogges-calendar';
var apiKey = 'AIzaSyBlJ5ZHc1aK-62XBGx_7ZR5_azI_xF9C2E';

// enter the scope of current project (this API must be turned on in the google console)
var scopes = 'https://www.googleapis.com/auth/calendar.readonly';


function handleClientLoad() {
  gapi.client.setApiKey(apiKey);
  makeApiCall('calendar@coggesparish.com', 'calendar-list');
  makeApiCall('events@coggesparish.com', 'social-calendar-list');
}

// function load the calendar api and make the api call
function makeApiCall(calendar_id, list_id) {
  gapi.client.load('calendar', 'v3', function() {       // load the calendar api (version 3)
    var request = gapi.client.calendar.events.list({
      'calendarId': calendar_id,
      'maxResults': 20,                 // show max of 20 events
      'singleEvents': true,               // split recurring events into individual events
      'timeMin':    today,                // start showing events starting at today
      'orderBy':    'startTime'             // order events by their start time
    });

    // handle the response from our api call
    request.execute(function(resp) {
      // for (var i = 0; i < resp.items.length; i++) {    // loop through events and write them out to a list
      //  var li = document.createElement('li');
      //  console.log(resp.items[i]);
      //  var eventInfo = resp.items[i].summary + ' ' +resp.items[i].start.dateTime;
      //  li.appendChild(document.createTextNode(eventInfo));
      //  document.getElementById('events').appendChild(li);
      // }
      listEvents(resp, list_id);
    });
  });
}

//-->
