/*
 * ext-inputPlusMinus.js
 *
 * Proprietary software
 *
 * Copyright(c) 2014 Nicholas Kyriakides
 *
 *
 * Dependencies:
 * 1) jQuery
 * 2) svgcanvas.js
 * 3) jquery-draginput.js
 * 4) This extension's CSS file

IMPORTANT NOTE: This extension does not conform at all to the guide for creating extensions for SVG-edit

-This extension is split in 5 parts 

1) Defining extesion and jQuery helper function
2) Define global variables
3) Define static HTML elements needed for extension
4) Define functions needed for extension
5) Return object with ability to use svg-edit events


-----------------------
*/
"use strict";

//Define extension --------------------------------------------------------------------------------------------------------------------------------------

methodDraw.addExtension("inputPlusMinus", function(S) {
    var svgcontent = S.svgcontent,
        svgns = "http://www.w3.org/2000/svg",
        svgdoc = S.svgroot.parentNode.ownerDocument,
        svgCanvas = methodDraw.canvas,
        ChangeElementCommand = svgedit.history.ChangeElementCommand,
        addToHistory = function(cmd) {
            svgCanvas.undoMgr.addCommandToHistory(cmd);
        };

    //jQuery extension function for positioning HTML elements in context menu - Do not remove/modify this
    $.fn.nthorfirst = function(path, i) {
        var elems = this.find(path);
        if (elems.length > i) return elems.eq(i);
        else return this;
    }

    //Global variables --------------------------------------------------------------------------------------------------------------------------------------


    var appendAll = true; //Set this to false if you want only SOME elements to have +/-.  Otherwise all draginput elements get +/- buttons
    var inputsToMod = []; //Type the id's of the elements you want to attach +/- to. -e.g [path_x,path_y]. Set appendToCustom=false as well.
    var pushLabelUp = true;//If true pushes the label of drag-inputs a bit up, to accomodate the buttons better.
    var longPressInt = 30;//long-press firing ms delay. rec is 20-30









    //Append necessary HTML elements (if it's a left-toolbar button define it according to svg-edit extension docs in return object.)------------------------


        //This extension uses dynamic appends from array, the HTML elements are not static,
        //so I wrapped the appendings as a function and put it in the functions section instead.







    //Functions for extension-------------------------------------------------------------------------------------------------------------------------------






    if (appendAll){
    inputsToMod.splice(0,inputsToMod.length) 
    $('.draginput input').each(function() {
    inputsToMod.push(this.id)
    });
    }

    if (pushLabelUp){
    $('.draginput input').attr('style', 'padding: 27px 0 16px !important')
    }


    function dynamicallyAppendElements(){

        for (var i = 0; i < inputsToMod.length; i++) {
            var attachId = inputsToMod[i];


            if (attachId==="angle"){

                $('#' + attachId).parent().append("<div id='dragInputClickMinusRotation' class='dragInputClickMinus'>-</div>")
                $('#' + attachId).parent().append("<div id='dragInputClickPlusRotation' class='dragInputClickPlus'>+</div>")

            }
             else if(attachId==="zoom"){
                //do nothing - appending +/- to zoom looks really ugly
            }
            else{

   
                $('#' + attachId).parent().append("<div class='dragInputClickMinus'>-</div>")
                $('#' + attachId).parent().append("<div class='dragInputClickPlus'>+</div>")

            }

            $('#' + attachId).bind("add", function() {

                var currentVal = $(this).val();
                var newVal = parseInt(currentVal) + 1;
                $(this).val(newVal);
                this.adjustValue(0);

            })

            $('#' + attachId).bind("minus", function() {
                var currentVal = $(this).val();
                var newVal = parseInt(currentVal) - 1;
                $(this).val(newVal);
                this.adjustValue(0);

            })

        };
    }

    dynamicallyAppendElements();



    $(function() {

var int;
        $(".dragInputClickPlus").mousedown(function() {
            var who = $(this).prevAll("input:first").attr("id");
    int = setInterval(function() { add(who); }, longPressInt);
}).mouseup(function() {
  clearInterval(int);  
});

$("body").mouseup(function() {
  clearInterval(int);  
});

    });

    $(function() {
var int;
        $(".dragInputClickMinus").mousedown(function() {
            var who = $(this).prevAll("input:first").attr("id");
    int = setInterval(function() { minus(who); }, longPressInt);
}).mouseup(function() {
  clearInterval(int);  
});

$("body").mouseup(function() {
  clearInterval(int);  
});


    });

    function add(who) {
        $('#' + who).trigger('add');
    }

    function minus(who) {
        $('#' + who).trigger('minus');
    }

    //Extension Return object----------------------------------------------------------------------------------------------------------------------------------
    return {
        name: "elementTracker",
        svgicons: "extensions/vectorText-icon.xml", //this is not needed since we don't need an icon but the extension throws error without it.

        /* Events are not needed in this extension

            zoomChanged: function(multiselected) {

                console.log("firing up a sample event, in this case zoomChanged.")

                return;
            }
        */
    }

});