//Small requests Script. I don't want to create .js files for each minor change/addition 'Denis the customer' requests, so I'm putting them all here



//Remove tools

$(function() {
 $('#tool_move_top,#tool_move_bottom,#tool_move_up,#tool_move_down,#tool_wireframe, #tool_image,#tool_eyedropper, main_button, #tool_source, #sidepanels,#tool_fhpath,#tool_stroke,#tool_text,#tool_path,#tool_line,#color_tools,#palette,#tool_snap,#tool_clear,#tool_save,#tool_open,#tool_import,#canvas_panel ').remove();

 /*Some elements cannot be removed because their values need to be exposed for some Method-Draw function to work. 
 Disable them using CSS visibility and absolutes instead*/

 $('#stroke_panel,#tool_opacity,#tool_blur').css({'visibility':'hidden','position':'absolute','pointer-events':'none'});








//Add a group/ungroup button in the selected panel

   //Use helper function for positioning HTML elements
   $.fn.attachToPanelPosition = function(i) {
        if(i===0){i=1};
        i=i-1; 
        var elems = this.find('> *');
        if (elems.length > i) return elems.eq(i);
        else return this;
    }


  $('#selected_panel').attachToPanelPosition(7).before("<div class='groupBtn' id='groupBtn'>Group/Ungroup</div>");
  $('.groupBtn').css({'position': 'relative','width': '147px','clear':'both','height': '32px','margin-top':'7px','margin-bottom':'4px','background-color': '#3F3F3C','border-radius': '3px','text-align': 'center','line-height': '32px','display': 'block','color': '#4880FF','font-weight': '400','cursor': 'pointer'})

  $( "#groupBtn" ).click(function() { document.getElementById('tool_group').click(); });//trigger already existing tool_group 



});





