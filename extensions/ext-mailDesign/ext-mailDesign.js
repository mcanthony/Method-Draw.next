/*
 * ext-mailDesign.js
 *
 * Proprietary software
 *
 * Copyright(c) 2014 Nicholas Kyriakides
 *
 *
 * Dependencies:
 * 1) jQuery
 * 2) canvg.js
 * 3) Mandrill Email provider - https://mandrillapp.com/docs/
 * 4) This extensions CSS file/s


IMPORTANT NOTE: This extension does not conform at all to the guide for creating extensions for SVG-edit

-This extension is split in 5 parts 

1) Defining extesion and jQuery helper function
2) Define global variables
3) Define static HTML elements needed for extension
4) Define functions needed for extension
5) Return object with ability to use svg-edit events.

 */
"use strict";


 //Define extension --------------------------------------------------------------------------------------------------------------------------------------

methodDraw.addExtension("mailDesign", function(S) {
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

//Global variables ---------------------------------------------------------------------------------------------------------------------------------------

    var manufacturerMailAddress = "nik.kyriakides@gmail.com"; //Manufacturer's mail.
    var mandrillApiKey = 'gpo5bJ5TVOIKa4p3F1CsEA';

    var mailHtml = "<p>Your order has been placed</p>";
    var mailText = "Thank you for your order! You can find attached here an image of your ordered file!";
    var mailSubject = "Order placed from Laser Cut Studio, Dresden";
    var mailFromAddress = "lasercut-noreply@laser-noreply.com" //usually the same as manufacturerMailAddress above.
    var mailFromName = "Laser Cut Studio, Dresden"

    var noNameErrMsg = "Seems you forgot to type your name..";
    var noEmailErrMsg = "Seems you forgot to type your email address..";
    var wrongEmailErrMsg = "Make sure you are typing your email correctly.."
    var noCityErrMsg = "Seems you forgot to type your city..";
    var noAddressErrMsg = "Seems you forgot to type your address..";

    var sendingErrMsg = "We cannot send your message at this moment";

    var thanksMsg = "Thank you for your order!"
    var thanksMsg2 = "A nice and polite human will be contacting you soon about this design..Until then feel free to play around more"



//Append necessary HTML elements (if it's a left-toolbar button define it according to svg-edit extension docs in return object.)--------------------------

    var attachToPanel = 'tools_top'; //Type here the panel you want to attach the element to.
    var extElementConfig1 = {
        extElementPosition: 10,
        extElementId: 'mailOrderBtn'
    }; //Config options for element. Add a position and a unique id.
    //Template for adding a button - do not remove or modify this.
    $('#' + attachToPanel).nthorfirst('> *', extElementConfig1.extElementPosition).before("<div id='placeOrderBtnWrapper' style=' margin-top: 1%;'><div id='" + extElementConfig1.extElementId + "' style='position: relative;width: 141px;height: 47px;background-color: #3F3F3C;border-radius: 3px;text-align: center;vertical-align: middle;display: table-cell;color: #4880FF;font-weight: 400;cursor:pointer'>Place Order</div></div>");
    $('#' + extElementConfig1.extElementId).click(function() {
        $("#formOverlay,#form-div").fadeIn();
        resetForm();
    }); //What to do when button is pressed?
    //To add more buttons, declare another extElementConfig object,e.g 'extElementConfig2', it's append commands and it's click handler.

    //Appending a form as well. Specific to this extension only.
    $('body').append("<div id='formOverlay' class='formOverlay'></div><div id='form-main'><div id='form-div'><p class='name'><div id='closeFormBtn'>Close</div></p><form class='form' id='form1'><p class='name'><input name='name' type='text' class='validate[required,custom[onlyLetter],length[0,100]] feedback-input' placeholder='Name' id='name'/></p><p class='email'><input name='email' type='text' class='validate[required,custom[email]] feedback-input' id='email' placeholder='Email'/></p><p class='city'><input name='city' type='text' class='validate[required,custom[email]] feedback-input' id='city' placeholder='City'/></p><p class='text'><textarea name='address' class='validate[required,length[6,300]] feedback-input' id='address' placeholder='Address'></textarea></p><div id='mailOrderFormErrMsg' class='formErrMsg'></div><div class='submit'><div id='formSubmitBtn'>Send Order</div><div class='ease'></div></div></form><div id='thanksDiv'><div class='thanksMsg'>" + thanksMsg + "</div><p class='thanksMsg2'>" + thanksMsg2 + "</p><div class='submit'><div id='thanksCloseBtn'>Continue</div><div class='ease'></div></div></div></div>");
    $("#formSubmitBtn").click(function() {
        validate();
    });
    $("#closeFormBtn,#thanksCloseBtn").click(function() {
        $("#formOverlay,#form-div").fadeOut()
    });









    //Functions for extension-----------------------------------------------------------------------------------------------------------------------------

    //Check for empty fields. Validation util function
    function validateEmpty(str) {
        if ((/\S+/.test(str))) {
            return false;
        } else {
            return true;
        }
    }

    //Check for correct email format. Validation util function

    function validateEmail(emailAddress) {
        var sQtext = '[^\\x0d\\x22\\x5c\\x80-\\xff]';
        var sDtext = '[^\\x0d\\x5b-\\x5d\\x80-\\xff]';
        var sAtom = '[^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+';
        var sQuotedPair = '\\x5c[\\x00-\\x7f]';
        var sDomainLiteral = '\\x5b(' + sDtext + '|' + sQuotedPair + ')*\\x5d';
        var sQuotedString = '\\x22(' + sQtext + '|' + sQuotedPair + ')*\\x22';
        var sDomain_ref = sAtom;
        var sSubDomain = '(' + sDomain_ref + '|' + sDomainLiteral + ')';
        var sWord = '(' + sAtom + '|' + sQuotedString + ')';
        var sDomain = sSubDomain + '(\\x2e' + sSubDomain + ')*';
        var sLocalPart = sWord + '(\\x2e' + sWord + ')*';
        var sAddrSpec = sLocalPart + '\\x40' + sDomain; // complete RFC822 email address spec
        var sValidEmail = '^' + sAddrSpec + '$'; // as whole string

        var reValidEmail = new RegExp(sValidEmail);

        if (reValidEmail.test(emailAddress)) {
            return true;
        }

        return false;
    }

    //Call on Send order - validates and if OK call prepare order which prepares the order files and call the 2 Ajax emails calls
    function validate() {

        $("#popupFormErrMsg").html("");

        //Define Validation vars here and an IF below. That's it.

        var clientName = $('#name').val();
        var clientMailAddress = $('#email').val();
        var clientCity = $('#city').val();
        var clientAddress = $('#address').val();

        if (validateEmpty(clientName)) {
            $("#mailOrderFormErrMsg").html(noNameErrMsg)
            return false;
        } else if (validateEmpty(clientMailAddress)) {
            $("#mailOrderFormErrMsg").html(noEmailErrMsg)
            return false;
        } else if (!validateEmail(clientMailAddress)) {
            $("#mailOrderFormErrMsg").html(wrongEmailErrMsg)
            return false;
        } else if (validateEmpty(clientCity)) {
            $("#mailOrderFormErrMsg").html(noCityErrMsg)
            return false;
        } else if (validateEmpty(clientAddress)) {
            $("#mailOrderFormErrMsg").html(noAddressErrMsg)
            return false;
        }

        prepareOrder(clientName, clientMailAddress, clientCity, clientAddress);
    }

    //Create PNG and SVG base64 files, create HTML to include in emails and call 2 different AJAX to email to both customer/manufacturer.
    function prepareOrder(clientName, clientMailAddress, clientCity, clientAddress) {

        var manufacturerMailHtml = "<p><strong>Customer Name:</strong> " + clientName + "<strong></p><p>Customer Email</strong>: " + clientMailAddress + "</p><p><strong>Customer City:</strong> " + clientCity + "</p><p><strong>Customer Address: </strong>" + clientAddress + "</p>";

        var exportedSVG = svgCanvas.svgCanvasToString();
        window.exportedSVG = exportedSVG;
        var svg = exportedSVG;
        var canvas = document.getElementById('myCanvas');
        canvg(canvas, svg, {
                renderCallback: function() {
                    var exportedPNG = canvas.toDataURL("image/png");
                    window.exportedPNG = exportedPNG;
                }
            })
            //Use utility function to encode string to B64.
        exportedSVG = window.btoa(exportedSVG);
        console.log(exportedSVG);

        //Trim off the first 22 characters which are the Base64 template ''words''. http://stackoverflow.com/questions/24068198/sending-images-in-mandrill
        exportedPNG = exportedPNG.replace(new RegExp("^.{0," + 22 + "}(.*)"), "$1");

        sendMailToManufacturer(exportedPNG, exportedSVG, manufacturerMailHtml);
        sendMailToClient(exportedPNG, clientMailAddress);

    }

    function sendMailToManufacturer(exportedPNG, exportedSVG, manufacturerMailHtml) {
        $.ajax({
                type: "POST",
                url: "https://mandrillapp.com/api/1.0/messages/send.json",
                data: {
                    'key': mandrillApiKey,
                    'message': {
                        "html": manufacturerMailHtml,
                        "text": mailText,
                        "subject": mailSubject,
                        "from_email": manufacturerMailAddress,
                        "from_name": mailFromName,
                        "to": [{
                            "email": manufacturerMailAddress,
                            "name": "Method-Draw.next Incoming Order",
                            "type": "to"
                        }],
                        "attachments": [{
                            "type": "image/svg+xml",
                            "name": "orderedPart.svg",
                            "content": exportedSVG
                        }],

                        "images": [{
                            "type": "image/png",
                            "name": "orderedPart.png",
                            "content": exportedPNG
                        }]
                    }
                }
            })
            .done(function(response) {
                successFailNotice('OK') // show success message

            })
            .fail(function(response) {
                successFailNotice("FAIL")
            });
        return false; // prevent page refresh
    };

    function sendMailToClient(exportedPNG, clientMailAddress) {
        $.ajax({
                type: "POST",
                url: "https://mandrillapp.com/api/1.0/messages/send.json",
                data: {
                    'key': mandrillApiKey,
                    'message': {
                        "html": mailHtml,
                        "text": mailText,
                        "subject": mailSubject,
                        "from_email": mailFromAddress,
                        "from_name": mailFromName,
                        "to": [{
                            "email": clientMailAddress,
                            "name": "Nikolas Kyriakides",
                            "type": "to"
                        }],

                        "images": [{
                            "type": "image/png",
                            "name": "orderedPart.png",
                            "content": exportedPNG
                        }]
                    }
                }
            })
            .done(function(response) {
                console.log('Send mail to client OK')

            })
            .fail(function(response) {
                alert('Error sending message.');
            });
        return false; // prevent page refresh
    };

    function successFailNotice(flag) {

        if (flag === "OK") {

            $("#form1").fadeOut();
            $("#thanksDiv").fadeIn();

        } else {

            $("#mailOrderFormErrMsg").html(sendingErrMsg);

        }

    }

    //Reset form util function.
    function resetForm() {
        $("#thanksDiv").fadeOut();
        $("#form1").fadeIn();
        $("#form1").find("input").val("");
        $("#mailOrderFormErrMsg").html("");
    }



//Extension Return object----------------------------------------------------------------------------------------------------------------------------------

    return {
        name: "mailDesign",
        svgicons: "extensions/vectorText-icon.xml", //this is not needed since we don't need an icon but the extension throws error without it.

        /* //We dont need any events here so this is commented out.
        
         selectedChanged: function(multiselected) {
        console.log("firing up a sample event, in this case selectedChangeed")
             return;
         }

         */

    }

});