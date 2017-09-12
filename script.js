$(document).ready(function () {

    // Everything is wrapped in a function becouse of the event bindings when the map changes
    function init() {

        // Inicijalizacija varijabli koje koristimo
        let regions = $('.land');
        let mapCont = $('.map-container');
        let mapa = $('#mapa');
        let regionName = $('.region-name');
        let selectedRegionName = $('.selected-region-name');
        let swapBtn = $('#swap-map');
        let compareBtn = $('#compare');
        let comparison = false;
        let selectedRegions = [];

        // Event handlers

        regions.on('click', (e) => {
            let selected = $(e.target);
            compareButtonLogic(selected);            
        });

        regions.on('mouseover', (e) => {
            regionName.text($(e.target).attr('title'));
        });

        regions.on('mouseleave', (e) => {
            regionName.text('');
        });

        compareBtn.click(() => {
            comparison = comparison ? false : true;
            if(comparison) {
                compareBtn.addClass('btn-blue');
                compareBtn.text('Comparing...');
            }
            else {
                defaultCompareBtn();
            }
            console.log(comparison);
        });

        // Map swapping logic
        swapBtn.click((e) => {
            e.stopImmediatePropagation();

            let link = '';
            let btnTxt = '';
            let atr = $('svg').attr("class");
            let classArray = atr.split(" ");

            selectedRegions = [];
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

            $.get(link, function (data) {

                mapCont.find('svg').first().remove();
                var newMap = data.getElementsByTagName("svg")[0];

                mapCont.append(newMap);

            }).done( init );

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

        // Custom functions

        function defaultCompareBtn() {
            compareBtn.removeClass('btn-blue');
            compareBtn.text('Compare');
        }

        function compareButtonLogic(selected){
            if(comparison) {
                selected.toggleClass('selected');    
                let index = selectedRegions.indexOf(selected[0].id);       

                (index > -1) ? selectedRegions.splice(index, 1) : selectedRegions.push(selected[0].id);

                let oldText = selectedRegionName.text();
                oldText += ', ';
                oldText += selected.attr('title');
                selectedRegionName.text(oldText);
                
                console.log(selectedRegions);
            } else {
                console.log(selected.attr('title'));
                regions.removeClass('selected');
                selected.addClass('selected');
                selectedRegionName.text(selected.attr('title'));
            }
        }
    };
    document.onload = init();
});
