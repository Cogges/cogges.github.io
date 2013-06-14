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
    var dateSpan = document.createElement('span');
    dateSpan.setAttribute('class', "event-date");
    dateSpan.appendChild(document.createTextNode(dateString));

    var li = document.createElement('li');

    // if we have a link to the event, create an 'a' element
    if (typeof entryLinkHref != 'undefined') {
      entryLink = document.createElement('a');
      entryLink.setAttribute('href', entryLinkHref);
      entryLink.appendChild(document.createTextNode(title + ' '));
      li.appendChild(entryLink);
      li.appendChild(dateSpan);
    } else {
      li.appendChild(document.createTextNode(title + ' '));
      li.appendChild(dateSpan);
    }

    // append the list item onto the unordered list
    ul.appendChild(li);
  }
  events.appendChild(ul);
}


//-->
