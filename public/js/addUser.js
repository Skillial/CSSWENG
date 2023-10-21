$(document).ready(function() {

    

    // check #clusterSelect element type
    if($("#clusterSelect").is('select')){
    
        // Changes the available options for the self help group select
        $("#clusterSelect").change(function() {
            // I do not know how slow this can be
            $('#groupSelect option:not(:first)').remove();
            let newOption = `<option value="test">NEW OPTION</option>`
            $("#groupSelect").append(newOption);
            $("#groupSelect").append(newOption);
            $("#groupSelect").append(newOption);
        });
    }
    // if the user is a SEDO
    else if ($("#clusterSelect").is('input')){
        //append options to the select here OR do it in the ejs file
        //for ejs file, make sure to put an if auth === SEDO before adding options
    }
});