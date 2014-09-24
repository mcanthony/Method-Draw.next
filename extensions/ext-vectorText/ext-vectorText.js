/*
 * ext-vectorText.js
 *
 * Proprietary software
 *
 * Copyright(c) 2014 Nicholas Kyriakides
 *
 *
 * Dependencies:
 * 1) jQuery
 * 2) opentype.min.js
 * 3) svgcanvas.js
 * 4) A folder with fonts in this .js file's root directory "e.g extensions/vectorTextFonts".
 */

"use strict";

methodDraw.addExtension("vectorText", function(S) {
    var svgcontent = S.svgcontent,
        svgns = "http://www.w3.org/2000/svg",
        svgdoc = S.svgroot.parentNode.ownerDocument,
        svgCanvas = methodDraw.canvas,
        ChangeElementCommand = svgedit.history.ChangeElementCommand,
        addToHistory = function(cmd) {
            svgCanvas.undoMgr.addCommandToHistory(cmd);
        },
        currentStyle = {
            fillPaint: "red",
            fillOpacity: 1.0,
            strokePaint: "black",
            strokeOpacity: 1.0,
            strokeWidth: 5,
            strokeDashArray: null,
            opacity: 1.0,
            strokeLinecap: 'butt',
            strokeLinejoin: 'miter'
        };

    function getStyle(opts) {
        // if we are in eyedropper mode, we don't want to disable the eye-dropper tool
        var mode = svgCanvas.getMode();
        if (mode == "vectorText") return;
        var tool = $('#tool_vectorText');

    }

    //Global variables
    //Define the fonts from the folder - format: actual path / display name
    var loadedFonts = [
        ["extensions/ext-vectorText/vectorTextFonts/laplac.ttf", "LaPlac"],
        ["extensions/ext-vectorText/vectorTextFonts/Roboto-Black.ttf", "Roboto-Black"],
        ["extensions/ext-vectorText/vectorTextFonts/Fingbanger.otf", "Fingbanger"]
    ];

    //Startup Variables
    var startupFont = 'extensions/ext-vectorText/vectorTextFonts/Fingbanger.otf';
    var resultFontSize = 50; //Startup font-size. Rec value is 30-60.
    var fontSize = 120; //Only for preview on canvas
    var resultSvgFill = "#4880FF"; //You can change this into any hex color value. Fill color of resultant SVG elements.








    

    //Append a Font Selector Window to the editor HTML
    $('body').append("<div id='fontSelectorDiv' style='position:relative; display:none; width:25%; height:80%; padding:2%; background-color:#2F2F2C; margin:0 auto; margin-right:-1%; border-radius:3px; border:2px solid #4B80FF; z-index:9999;' <div class='container'> <div class='explain' style='color:white; font-size:12px; font-weight:bold; padding:1%;'> Select a font from the menu below and type in the letters you want to import to your canvas. </div> <input id='file' type='file' style='display:none'> <span class='info' id='font-name' style='display:none'>Fingbanger</span> <select id='fontSelector' style='display:block; margin:1%;'> </select> <input id='fontTxtInput' type='text' class='text-input' style='margin-left:1%; width:80%; height:10%; font-size:16px; color:white; font-weight:bold; border-radius:3px; background-color:#2F2F2C; border:1px solid #4B80FF;' value='Hello, World!' autofocus id='textField'> <input type='range' min='6' max='500' step='2' value='150' id='font-size-range' autocomplete='off' style='display:none'><span id='fontSize' style='display:none'>150</span> <canvas id='preview' width='940' height='300' class='text' style='width:80%; margin-left:1%; margin-top:1%; border-radius:3px; background-color:#2F2F2C; border:1px solid #4B80FF;'></canvas> <div id='message'></div> <label> <input id='drawPointsCheckBox' type='checkbox' style='margin-left:1%;'>Draw Points</label> <label> <input id='drawMetricsCheckBox' type='checkbox' style='margin-left:1%;'>Draw Metrics</label> <label> <input id='kerningCheckBox' type='checkbox' style='margin-left:1%;'>Kerning</label> <div id='glyphs' style='display:none;'></div><hr style='margin-left:1%; width:80%;'><button type='button' id='placeFontBtn'>Place letters</button><button type='button' id='cancelFontBtn'>Cancel</button></div>");

    //Append fonts into font selector dropdown
    for (var i = loadedFonts.length - 1; i >= 0; i--) {
        var itemval = '<option value=' + loadedFonts[i][0] + '>' + loadedFonts[i][1] + '</option>';
        $('#fontSelector').append(itemval);
    };

    //Startup Variables for opentype font convertor
    var textToRender = "Hello, World!";
    var drawPoints = false;
    var drawMetrics = false;
    var kerning = true;
    var previewPath = null;
    var snapPath = null;
    var snapStrength = 0;
    var snapDistance = 53;
    var snapX = 0;
    var snapY = 0;
    var fontSizeSlider = document.getElementById("font-size-range");

    //Prototypal Inheritance. A renderJob object.

    function renderJob() {
        var renderFont;
        var lettersArray = [];
        var result = "";

        var canvasX, canvasY; //Where to place the letters?
        this.renderText = function() {
            if (!this.renderFont) return;
            textToRender = document.getElementById('fontTxtInput').value;
            var previewCtx = document.getElementById('preview').getContext("2d");
            previewCtx.clearRect(0, 0, 940, 300);
            this.renderFont.draw(previewCtx, textToRender, 0, 200, fontSize, {
                kerning: kerning
            });
            if (drawPoints) {
                this.renderFont.drawPoints(previewCtx, textToRender, 0, 200, fontSize, {
                    kerning: kerning
                });
            }
            if (drawMetrics) {
                this.renderFont.drawMetrics(previewCtx, textToRender, 0, 200, fontSize, {
                    kerning: kerning
                });
            }
            snapPath = this.renderFont.getPath(textToRender, 0, 0, resultFontSize, {
                kerning: kerning
            });
            this.doSnap(snapPath);
            //Convert ''relative'' commands to SVG path commands.
            //TODO: Examine the results. I think 'Z' is not appended.
            this.result = "";
            this.lettersArray = [];
            for (var i = 0; i < snapPath.commands.length; i++) {
                if (snapPath.commands[i].type === "Q") {
                    this.result = this.result + snapPath.commands[i].type + snapPath.commands[i].x1 + " " + snapPath.commands[i].y1 + " " + snapPath.commands[i].x + " " + snapPath.commands[i].y + " ";
                } else if (snapPath.commands[i].type === "Z") {
                    this.result = this.result.replace(/^Z/, "");
                    this.lettersArray.push(this.result);
                    this.result = "";
                    this.result = this.result + snapPath.commands[i].type;
                } else {
                    this.result = this.result + snapPath.commands[i].type + snapPath.commands[i].x + " " + snapPath.commands[i].y + " ";
                }
            }
        }
        this.appendElements = function() {
            var selectedElements = [];
            for (var i = this.lettersArray.length - 1; i >= 0; i--) {
                var nextId = svgCanvas.getNextId();
                svgCanvas.addSvgElementFromJson({
                    "element": "path",
                    "curStyles": true,
                    "attr": {
                        "d": this.lettersArray[i],
                        "id": nextId,
                        "fill": resultSvgFill,
                        "opacity": 1,
                        "stroke": 0,
                        "x": 100
                    }
                });
                var str = svgCanvas.getSvgString();
                $('#svg_source_textarea').val(str);
                svgCanvas.setSvgString($('#svg_source_textarea').val())
                selectedElements.push(nextId);
            };

            var movableElems = [];

            for (var i = 0; i < selectedElements.length; i++) {
                movableElems.push(svgCanvas.getElem(selectedElements[i]));
            };

            svgCanvas.addToSelection(movableElems.reverse(), false);
            svgCanvas.moveSelectedElements(this.canvasX, this.canvasY, true);
            $("#fontSelectorDiv").fadeOut('fast');

        }
        this.doSnap = function(path) {
            var i;
            var strength = snapStrength / 100.0;
            for (i = 0; i < path.commands.length; i++) {
                var cmd = path.commands[i];
                if (cmd.type !== 'Z') {
                    cmd.x = snap(cmd.x + snapX, snapDistance, strength) - snapX;
                    cmd.y = snap(cmd.y + snapY, snapDistance, strength) - snapY;
                }
                if (cmd.type === 'Q' || cmd.type === 'C') {
                    cmd.x1 = snap(cmd.x1 + snapX, snapDistance, strength) - snapX;
                    cmd.y1 = snap(cmd.y1 + snapY, snapDistance, strength) - snapY;
                }
                if (cmd.type === 'C') {
                    cmd.x2 = snap(cmd.x2 + snapX, snapDistance, strength) - snapX;
                    cmd.y2 = snap(cmd.y2 + snapY, snapDistance, strength) - snapY;
                }
            }
        }
    }
    var renderJob1 = new renderJob(); //Instantiate only once a renderJob object.

    // Create a canvas and adds it to the document.
    // Returns the 2d drawing context.
    function createGlyphCanvas(glyph, size) {
        var canvasId, html, glyphsDiv, wrap, canvas, ctx;
        canvasId = 'c' + glyph.index;
        html = '<div class="wrapper" style="width:' + size + 'px"><canvas id="' + canvasId + '" width="' + size + '" height="' + size + '"></canvas><span>' + glyph.index + '</span></div>';
        glyphsDiv = document.getElementById('glyphs');
        wrap = document.createElement('div');
        wrap.innerHTML = html;
        glyphsDiv.appendChild(wrap);
        canvas = document.getElementById(canvasId);
        ctx = canvas.getContext('2d');
        return ctx;
    }

    function showErrorMessage(message) {
        var el = document.getElementById('message');
        if (!message || message.trim().length === 0) {
            el.style.display = 'none';
        } else {
            el.style.display = 'block';
        }
        el.innerHTML = message;
    }

    //Load/Change fonts functions

    function onFontLoaded(font) {
        var glyphsDiv, i, x, y, fontSize;

        // Show the first 100 glyphs.
        glyphsDiv = document.getElementById('glyphs');
        glyphsDiv.innerHTML = '';

        var amount = Math.min(100, font.glyphs.length);
        x = 50;
        y = 120;
        fontSize = 72;
        for (i = 0; i < amount; i++) {
            var glyph = font.glyphs[i];
            var ctx = createGlyphCanvas(glyph, 150);
            glyph.draw(ctx, x, y, fontSize);
            glyph.drawPoints(ctx, x, y, fontSize);
            glyph.drawMetrics(ctx, x, y, fontSize);
        }

        renderJob1.renderFont = font;
        renderJob1.renderText();
    }

    function changeFont(fontUrl) {

        opentype.load(fontUrl, function(err, font) {
            if (err) {
                alert('Font could not be loaded: ' + err);
            } else {
                onFontLoaded(font);
            }
        });
    };

    document.getElementById('font-name').innerHTML = startupFont.split('/')[1];

    // FireFox & Chrome fire the 'input' event continuously, then the 'change' event on mouse up.
    // IE 11 doesn't fire the 'input' event at all, but the 'change' event continuously.
    fontSizeSlider.addEventListener('input', fontSizeChanged, false);
    fontSizeSlider.addEventListener('change', fontSizeChanged, false);

    opentype.load(startupFont, function(err, font) {
        var amount, glyph, ctx, x, y, fontSize;
        if (err) {
            showErrorMessage(err.toString());
            return;
        }
        onFontLoaded(font);
    });

    //Utility functions for opentype.js

    function drawPointsChanged() {
        if (!drawPoints){drawPoints=true}else{drawPoints=false};
        renderJob1.renderText();
    }

    function drawMetricsChanged() {
        if (!drawMetrics){drawMetrics=true}else{drawMetrics=false};
        renderJob1.renderText();
    }

    function kerningChanged() {
        if (!kerning){kerning=true}else{kerning=false};
        renderJob1.renderText();
    }

    function fontSizeChanged() {
        fontSize = fontSizeSlider.value;
        document.getElementById('fontSize').innerHTML = '' + fontSize;
        renderJob1.renderText();
    }

    function snapStrengthChanged(e) {
        snapStrength = e.value;
        document.getElementById('snapStrength').innerHTML = '' + snapStrength;
        renderJob1.renderText();
    }

    function snapDistanceChanged(e) {
        snapDistance = e.value;
        document.getElementById('snapDistance').innerHTML = '' + snapDistance;
        renderJob1.renderText();
    }

    function snapXChanged(e) {
        snapX = e.value * 1.0;
        document.getElementById('snapX').innerHTML = '' + snapX;
        renderJob1.renderText();
    }

    function snapYChanged(e) {
            snapY = e.value * 1.0;
            document.getElementById('snapY').innerHTML = '' + snapY;
            renderText();
        }
        // Round a value to the nearest "step".

    function snap(v, distance, strength) {
        return (v * (1.0 - strength)) + (strength * Math.round(v / distance) * distance);
    }

    //Click handlers

    $("#cancelFontBtn").click(function() {
        $("#fontSelectorDiv").fadeOut('fast');
    });
    $("#fontTxtInput").keyup(function() {
        renderJob1.renderText();
    });
    $("#placeFontBtn").click(function() {
        renderJob1.appendElements();
    });
    $('#fontSelector').on('change', function() {
        changeFont(this.value);
    });

    $('#drawPointsCheckBox').click(function() {
            drawPointsChanged(this,false);
    })

    $('#drawMetricsCheckBox').click(function() {
            drawMetricsChanged(this,false);
    })

    $('#kerningCheckBox').click(function() {
            kerningChanged(this,false);
    })

    return {
        name: "vectorText",
        svgicons: "extensions/ext-vectorText/vectorText-icon.xml",
        buttons: [{
            id: "tool_vectorText",
            type: "mode",
            title: "Vector Text Tool",
            position: 9,
            key: "Y",
            icon: "extensions/ext-vectorText/tool_vectorText.png",
            events: {
                "click": function() {
                    svgCanvas.setMode("vectorText");
                }
            }
        }],

        mouseDown: function(opts) {
            var mode = svgCanvas.getMode();
            if (mode == "vectorText") {
                var e = opts.event;
                var x = opts.start_x;
                var y = opts.start_y;
                renderJob1.canvasX = x;
                renderJob1.canvasY = y;

                $("#fontSelectorDiv").fadeIn('fast');

            }

            return;
        }

    }

});