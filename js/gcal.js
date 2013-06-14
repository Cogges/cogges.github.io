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
function listEvents(root, divId) {
  var feed = root.feed;
  var events = document.getElementById(divId);

  if (events.childNodes.length > 0) {
    events.removeChild(events.childNodes[0]);
  }

  // create a new unordered list
  var ul = document.createElement('ul');
  var monthNames = [ "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

  // loop through each event in the feed
  for (var i = 0; i < feed.entry.length; i++) {
    var entry = feed.entry[i];
    var title = entry.title.$t;
    var start = entry['gd$when'][0].startTime;

    // get the URL to link to the event
    for (var linki = 0; linki < entry['link'].length; linki++) {
      if (entry['link'][linki]['type'] == 'text/html' &&
          entry['link'][linki]['rel'] == 'alternate') {
        var entryLinkHref = entry['link'][linki]['href'];
      }
    }

    var dateString = formatGCalTime(start);

    var monthString = monthNames[parseInt(start.substr(5,2),10)];
    var dayString = start.substr(8,2);

    var monthSpan = document.createElement('span');
    monthSpan.appendChild(document.createTextNode(monthString));

    var daySpan = document.createElement('p');
    daySpan.appendChild(document.createTextNode(dayString));
    daySpan.appendChild(monthSpan);

    var dateDiv = document.createElement('div');
    dateDiv.setAttribute('class', "date pull-left");
    dateDiv.appendChild(daySpan);

    var li = document.createElement('li');

    var detailDiv = document.createElement('div');
    detailDiv.setAttribute('class', "event-title pull-left");
    detailDiv.appendChild(document.createTextNode(title));

    li.appendChild(dateDiv);
    li.appendChild(detailDiv);

    if (dateString.search("PM") > 0 || dateString.search("AM") > 0) {

      var timeList = dateString.split(' ').slice(1,3)
      var timeDiv = document.createElement('div');
      timeDiv.setAttribute('class', "event-time pull-left");
      timeDiv.appendChild(document.createTextNode('Starts: ' + timeList[0] + ' ' + timeList[1]));
      li.appendChild(timeDiv);
    }





    // append the list item onto the unordered list
    ul.appendChild(li);
  }
  events.appendChild(ul);
}


//-->
