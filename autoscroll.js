
var PULSE_TIME = 500;
// timer might be inefficient. It'll be great if there's a DIV height change listener available
var pageTimer = null; // check for new page change every second
var $currentPage = null;
var $docScroller = null;
var $ruler = null;
var autoscrollEnabled = false;
var viewLoc = 0;
var pageCount = 0;
var pageHeight = 0;
var firstMarginHeight = 0;
var toolbarHeight = 0;
var initialized = false;


//$(document).ready(function(){
$(window).load(function(){
   //add a checkbox to "docs-title-outer" div
   $("div.docs-title-outer").append("<div class=\"goog-inline-block autoscroll-title\">Enable AutoScroll: <input type=\"checkbox\" name=\"cb-autoscroll\" id=\"cb-autoscroll\"/></div>");
   //now set a hook for a checkbox with id="cb-autoscroll"
   $("#cb-autoscroll").click(setupAutoscroll);
});


function init(){
   // cache objects/values that don't change
   $docScroller = $("div.kix-appview-editor");
   firstMarginHeight = $("div.kix-print-block").first().height();
   $ruler = $("#kix-ruler");
   toolbarHeight = $("#docs-chrome").height();

   console.log("firstMargin: %s, toolbar: %s, ruler: %s", firstMarginHeight, toolbarHeight, $ruler.height());
}


function getTopMarginHeight(){
   var height = 0;
   var $margin = $("div.kix-print-block").last();
   if($margin && $margin.css('display') != 'none'){
      height = $margin.height();
   }
   return height;
}


function getRulerHeight(){
   return ($ruler && $ruler.css('display') != "none") ? $ruler.height() : 0;
}


// auto scroll callback function for the timer
function setupAutoscroll() {
   //see if the box is checked, if not, do nothing, if yes, activate the peer tracker
   if($("#cb-autoscroll").is(':checked')){
      console.log("Activating auto scroll...");
      autoscrollEnabled = true;
      //if(!initialized){
         init();
      //   initialized = true;
      //}
      startAutoscroll();
   } else {
      console.log("Deactivating auto scroll...");
      autoscrollEnabled = false;
      clearInterval(pageTimer);
   }
}


// Starts the auto scroll timer
function startAutoscroll(){
   // if this is null, show alert, uncheck the box
   if($("li.docs-user-roster").length){
      pageTimer = window.setInterval(autoScrollFunc, PULSE_TIME);
   } else {
      $("#cb-autoscroll").attr('checked',false);
      alert("You must have at least one other contributors present");
   }
}


function autoScrollFunc(){
   if(autoscrollEnabled){
      var oldCount = pageCount;
      // get all the pages
      var $pages = $("div.kix-page");
      // count how many pages there are
      pageCount = $pages.length;
      //console.dir($pages);
      //console.dir($pages.last());
      //console.dir($pages.last().find("div.kix-paragraphrenderer"));
      $currentPage = $pages.last().find("div.kix-paragraphrenderer").parent();
      //console.dir($currentPage);
      //pageHeight = $pages.first().height();
      if(pageCount != oldCount){
         // update data if there are changes in page count
         console.log("Number of pages changed! Count: " + pageCount);
         pageHeight = $pages.first().height();
      }
      // scroll to new position
      scrollToNewPosition();
   }
}

function scrollToNewPosition(){
   if(autoscrollEnabled){
      oldHeight = viewLoc;
      var upperSection = toolbarHeight + getRulerHeight();
      var windowHeight = $(window).height();
      var marginHeight = (pageCount > 1) ? getTopMarginHeight() : firstMarginHeight;
      var docViewHeight = (windowHeight > upperSection) ? (windowHeight - upperSection) : 0;

      // calculate the scroll location
      var totalDocHeight = (pageHeight * (pageCount-1)) + $currentPage.height() + marginHeight;
      viewLoc = (totalDocHeight < docViewHeight) ? 0 : totalDocHeight - docViewHeight + $currentPage.height();

      console.log("upperSection: %s, windowHeight: %s, marginHeight: %s, docViewHeight: %s, totalDocHeight: %s, viewLoc: %s, currentPage.height(): %s",
            upperSection, windowHeight, marginHeight, docViewHeight, totalDocHeight, viewLoc, $currentPage.height());

      if(oldHeight != viewLoc){
         // if there are changes in height, then scroll to the new position
         $docScroller.animate({ scrollTop: viewLoc}, 250);
      }
   }
}

