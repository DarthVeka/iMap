$(document).ready(function () {

    // Everything is wrapped in a function becouse of the event bindings when the map changes
    function init() {

        // SETUP INITIALIZATION
        let regions = $('.land');
        let mapCont = $('.map-container');
        let mapa = $('#mapa');
        let regionName = $('.region-name');
        let swapBtn = $('#swap-map');
        let compareBtn = $('#compare');
        let genDataCont = $('.generated-data');
        let genData = $('.dynamic-region');
        let legenda = $('.legenda');
        let comparison = false;
        let selectedRegions = [];

        // EVENT HANDLERS

        regions.on('click', (e) => {
            let selected = $(e.target);
            compareButtonLogic(selected);
        });

        // Just showing over what region are we hovering
        regions.on('mouseover', (e) => {
            regionName.text($(e.target).attr('title'));
        });

        regions.on('mouseleave', (e) => {
            regionName.text('');
        });

        // OVAJ DIO DORADITI..... LOGIKU IZDVOJITI U ZASEBNU FUNKCIJU
        // xXxXxxXXxxXxxxxxXXxXxxXXXxxxXXXxxxxXXXXxxxxXXXXxxXXXXXXXXx
        legenda.on('click', (e) => {
            // Emptyng all content from data tontainer and removing all selected class attributes
            regions.removeClass('selected');
            genDataCont.empty();
            selectedRegions = [];

            // Taking the id selector from clicked field in legend to target the specific classes
            let selector = '.';
            selector += $(e.target).attr('id');
            let selectedLegend = $(selector);

            // Generating dynamic data for all regions with class of the legend field id
            for (let i = 0; i < selectedLegend.length; i++) {
                getSelectedData(selectedLegend[i]);

                let index = selectedRegions.indexOf(selectedLegend[i].id);
                (index > -1)
                    ? (selectedRegions.splice(index, 1), removeSelectedRegion(selectedLegend))
                    : (selectedRegions.push(selectedLegend[i].id));

            }

            $(selector).addClass('selected');
            console.log(selectedRegions);
        });
        // xXxXxxXXxxXxxxxxXXxXxxXXXxxxXXXxxxxXXXXxxxxXXXXxxXXXXXXXXx

        // --------------------------------------------

        compareBtn.click(() => {
            comparison = comparison ? false : true;
            if (comparison) {
                selectedRegions = [];
                // If user has a selected region(s) before compare button click add it to list
                regions.hasClass('selected') ? $('.selected').map(function () {
                    selectedRegions.push(this.id);
                }) : null;

                // Change button layout
                compareBtn.addClass('btn-blue');
                compareBtn.text('Comparing...');
            }
            else {
                defaultCompareBtn();
            }
        });

        // Map swapping logic
        swapBtn.click((e) => {
            // Stop event propagation becouse of the inner init() function call
            e.stopImmediatePropagation();

            let link = '';
            let btnTxt = '';

            // check what map is currently loaded by checking ins class name
            let atr = $('svg').attr("class");
            let classArray = atr.split(" ");
         
            defaultCompareBtn();

            if (classArray[0] == 'cro') {
                link = './bosniaHerzegovinaCantonsHigh.svg';
                btnTxt = 'Croatia';
            } else {
                link = './croatiaHigh.svg';
                btnTxt = 'Bosnia and Herzegovina';
            }

            swapBtn.text(btnTxt);
            console.log(link);

            // Get the new map, drop the old one, and append new
            $.get(link, function (data) {

                mapCont.find('svg').first().remove();
                var newMap = data.getElementsByTagName("svg")[0];

                mapCont.append(newMap);

                // After we change the map reinitialise everything becouse of the event binding
            }).done(init);

        });

        // Map pan and zoom
        panZoomInstance = svgPanZoom('#mapa', {
            zoomEnabled: true,
            controlIconsEnabled: true,
            fit: true,
            center: true,
            minZoom: 0.1
        });

        // zoom out
        panZoomInstance.zoom(1.0);

        // CUSTOM FUNCTIONS

        function defaultCompareBtn() {
            compareBtn.removeClass('btn-blue');
            compareBtn.text('Compare');
        }

        function compareButtonLogic(selected) {
            // If we clicked the compare button allow multiple sellection
            if (comparison) {
                // togle selected class if olready selected and remove it from selectedRegions array
                selected.toggleClass('selected');
                let index = selectedRegions.indexOf(selected[0].id);

                (index > -1)
                    ? (selectedRegions.splice(index, 1), removeSelectedRegion(selected))
                    : (selectedRegions.push(selected[0].id), getSelectedData(selected));

                
                console.log(selectedRegions);
            } else {
                regions.removeClass('selected');
                genDataCont.empty();
                getSelectedData(selected);
                selected.addClass('selected');
            }
        }

        function getSelectedData(selected) {
            let link = 'http://192.168.11.60:3000/api/zupanijes';
            // Because of the two different parameters we provide by calls to this function 
            // we need to check are we prividing the id or do we need to extract it
            let selectedId = (selected.id !== undefined) ? selected.id : selected.attr('id');

            $('#loading').show();
            let htmlString = '';
            $.get(link, function (data) {
                for (let i = 0; i < data.length; i++) {
                    if (selectedId === data[i].code) {
                        htmlString = "<div class='" + data[i].code + " dynamic-region '><img src='" + data[i].coatOfArms + "' alt='" + data[i].name + "'>";
                        htmlString += "<p>" + data[i].name + "</p></div>";

                        console.log(data[i]);                        
                    }
                }
            }).done( () => {
                $('#loading').hide();   
                genDataCont.append(htmlString);             
            });
        }

        function removeSelectedRegion(selected) {
            let selectedId = '.';
            selectedId += selected.attr('id');
            $(selectedId).remove();
        }

        // TYPEAHEAD        

        $('.typeahead').on('keyup', function (e) {
            if (e.keyCode == 13) {
                e.stopImmediatePropagation();
                
                $(".tt-suggestion:first-child", this).trigger('click');
                let inputTxt = $('.tt-input').val();
                for (let i = 0; i < regions.length; i++) {

                    let selector = '#';
                    selector += regions[i].getAttribute('id');

                    if(regions[i].getAttribute('title') === inputTxt )
                        compareButtonLogic($(selector));
                }

            }
        });

        
       
    };
    // END OF INIT FUNCTION

    // TYPEAHEAD        
    
    var countries = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.whitespace,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        // url points to a json file that contains an array of country names, see
        // https://github.com/twitter/typeahead.js/blob/gh-pages/data/countries.json
        // prefetch: 'https://raw.githubusercontent.com/twitter/typeahead.js/gh-pages/data/countries.json',
        prefetch: 'test.json',
        transform: function (response) {
            console.log(response);

        }
    });

    // passing in `null` for the `options` arguments will result in the default
    // options being used
    $('#prefetch .typeahead').typeahead(null, {
        name: 'countries',
        source: countries,
        templates: {
            empty: [
                '<div class="empty-message">',
                'Nema regije s unesenim podacima',
                '</div>'
            ].join('\n')
        }
    });

    document.onload = init();

});
