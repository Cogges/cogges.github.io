	/* FitText */
	jQuery(".home h1").fitText(0.8);



  /* Function to display boxes at equal height */
  jQuery.fn.tidyBoxes = function () {
   var currentTallest = 0;
   var currentRowStart = 0;
   var rowDivs = new Array();
   $(this).each(function(index) {
    if(currentRowStart != $(this).position().top) {
     // we just came to a new row. Set all the heights on the completed row
     for(currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) rowDivs[currentDiv].height(currentTallest);
     // set the variables for the new row
     rowDivs.length = 0; // empty the array
     currentRowStart = $(this).position().top;
     currentTallest = $(this).height();
     rowDivs.push($(this));
    } else {
     // another div on the current row. Add it to the list and check if it's taller
     rowDivs.push($(this));
     currentTallest = (currentTallest < $(this).height()) ? ($(this).height()) : (currentTallest);
    }
  
    // do the last row
    for(currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) rowDivs[currentDiv].height(currentTallest);
    });
  
  }  
  
  $(".content div.span6").tidyBoxes();

