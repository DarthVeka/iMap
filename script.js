$(document).ready(function () {

    // Everything is wrapped in a function becouse of the event bindings when the map changes
    function init() {

        // SETUP INITIALIZATION
        let regions = $('.land');
        let mapCont = $('.map-container');
        let mapa = $('#mapa');
        let regionName = $('.region-name');
        let selectedRegionName = $('.selected-region-name');
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
            for(let i = 0; i < selectedLegend.length; i++) {
                getSelectedData(selectedLegend[i]);                

                let index = selectedRegions.indexOf(selectedLegend[i].id);
                (index > -1) 
                    ? (selectedRegions.splice(index, 1), removeSelectedRegion(selectedLegend))
                    : (selectedRegions.push(selectedLegend[i].id));

                // Add region name to html
                let oldText = selectedRegionName.text();
                let newRegion = selectedLegend.attr('title');
                let indexOfRegion = oldText.indexOf(newRegion);
                // If the region is already added remove it from the list
                (indexOfRegion == -1)
                    ? (oldText += ' ', oldText += newRegion) 
                    : (oldText = oldText.split(newRegion).join(''));

                selectedRegionName.text(oldText);

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

            selectedRegionName.text('');
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

                // Add region name to html
                let oldText = selectedRegionName.text();
                let newRegion = selected.attr('title');
                let indexOfRegion = oldText.indexOf(newRegion);
                // If the region is already added remove it from the list
                (indexOfRegion == -1)
                    ? (oldText += ' ', oldText += newRegion) 
                    : (oldText = oldText.split(newRegion).join(''));

                selectedRegionName.text(oldText);

                console.log(selectedRegions);
            } else {
                regions.removeClass('selected');
                genDataCont.empty();
                getSelectedData(selected);
                selected.addClass('selected');
                selectedRegionName.text(selected.attr('title'));
            }
        }

        function getSelectedData(selected) {
            let link = './zupanije.json';
            // Because of the two different parameters we provide by calls to this function 
            // we need to check are we prividing the id or do we need to extract it
            let selectedId = (selected.id !== undefined) ? selected.id : selected.attr('id');

            $.get(link, function (data) {
                for(let i = 0; i < data.zupanije.length; i++) {
                    if(selectedId === data.zupanije[i].id) {
                        let htmlString = "<div class='"+ data.zupanije[i].id +" dynamic-region '><img src='"+ data.zupanije[i].grb +"' alt='"+ data.zupanije[i].name +"'>";
                        htmlString += "<p>"+ data.zupanije[i].name +"</p></div>";

                        genDataCont.append(htmlString);
                    }
                }
            });
        }

        function removeSelectedRegion(selected) {
            let selectedId = '.';
            selectedId += selected.attr('id');
            $(selectedId).remove();
        }

    };
    document.onload = init();

});
