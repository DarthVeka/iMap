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
        let regionData = [];

        // EVENT HANDLERS

        regions.on('click', (e) => {
            let selected = $(e.target);
            compareButtonLogic(selected);
        });

        // Just showing over what region are we hovering
        regions.on('mouseover', function (e) {
            let rName = $(e.target).attr('title-region');

            $(this).qtip({
                overwrite: false,
                content: {
                    text: rName
                },
                style: {
                    classes: 'qtip-tipsy'
                },
                position: {
                    my: 'center center',
                    at: 'top center'
                },
                show: {
                    event: e.type,
                    ready: true
                }
            },e);
        });

        regions.on('mouseleave', (e) => {
            regionName.text('');
        });

        
        legenda.on('click', (e) => {
            comparison = false;
            compareBtn.trigger('click');

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
        });
        // xXxXxxXXxxXxxxxxXXxXxxXXXxxxXXXxxxxXXXXxxxxXXXXxxXXXXXXXXx

        // --------------------------------------------

        compareBtn.click(() => {
            comparison = comparison ? false : true;
            if (comparison) {
                selectedRegions = [];
                regionData = [];

                regions.removeClass('selected');
                genDataCont.empty();

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

            // Get the new map, drop the old one, and append new
            $.get(link, function (data) {

                mapCont.find('svg').first().remove();
                let newMap = data.getElementsByTagName("svg")[0];

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

            } else {
                regions.removeClass('selected');
                genDataCont.empty();
                regionData = [];
                selected.addClass('selected');
                getSelectedData(selected);
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
                        regionData.push(data[i]);

                        htmlString = "<div class='tooltip " + data[i].code
                            + " dynamic-region'><img src='"
                            + data[i].coatOfArms + "' alt='"
                            + data[i].name + "' title='"+ data[i].code +"'>";

                        htmlString += "<p class='tooltipTxt'>" + data[i].name + "</p></div>";
                    }
                }
            }).done(() => {
                $('#loading').hide();
                genDataCont.append(htmlString);
                comparison ? addDataToChartComparison(regionData) : addDataToChart(regionData);
                addEventsToImages();
            });

        }

        function removeSelectedRegion(selected) {
            let selectedId = '.';
            selectedId += selected.attr('id');
            $(selectedId).remove();

            removeOneDataset(selected);
            for (let i = 0; i < regionData.length; i++) {
                regionData[i].code === selected[0].id ? regionData.splice(i, 1) : null;
            }
        }

        function addEventsToImages() {
            $('.dynamic-region img').on('click', (e) => {
                e.stopImmediatePropagation();
                
                let sel = '#';
                sel += $(e.target).attr('title');
                let elem = $(sel);

                compareButtonLogic(elem);
                
            });
        }

        // TYPEAHEAD

        $('.typeahead').on('keyup', function (e) {
            if (e.keyCode == 13) {
                e.stopImmediatePropagation();

                let suggestion = $("pre")[0].innerHTML;
                for (let i = 0; i < regions.length; i++) {

                    let selector = '#';
                    selector += regions[i].getAttribute('id');
                    
                    if (regions[i].getAttribute('title-region') === suggestion)
                        compareButtonLogic($(selector));
                }
                $('.typeahead').typeahead('val', '');
            }
        });

        $('.typeahead').bind('typeahead:select', function (ev, suggestion) {
            for (let i = 0; i < regions.length; i++) {

                let selector = '#';
                selector += regions[i].getAttribute('id');

                if (regions[i].getAttribute('title-region') === suggestion)
                    compareButtonLogic($(selector));
            }
            $('.typeahead').typeahead('val', '');
        });


    };
    // END OF INIT FUNCTION

    // TYPEAHEAD

    let countries = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.whitespace,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
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

    function createChart() {

        let ctx = document.getElementById("bar-chart").getContext("2d");
        window.myBar = new Chart(ctx, {
            type: 'bar',
            data: [],
            options: {
                title: {
                    display: true,
                    text: "Level of budget transparency"
                },
                tooltips: {
                    mode: 'index',
                    intersect: false
                },
                responsive: true,
                scales: {
                    xAxes: [{
                        stacked: true,
                    }],
                    yAxes: [{
                        stacked: true
                    }]
                }
            }
        });
    }

    function addDataToChart(data) {
        removeDataFromChart();

        let chart = myBar;

        let label = data.map((obj) => {
            return obj.name.replace('županija', '');
        });

        let rev = data.map((obj) => {
            return obj.budgetTransparencyData[0].revenue;
        });

        let exp = data.map((obj) => {
            return (obj.budgetTransparencyData[0].expenditure * -1);
        });

        let surpDef = rev.map((val, idx) => parseFloat(val) + parseFloat(exp[idx]));
        surpDef = surpDef.map((number) => { return (number.toFixed(3)); })

        let newData = [{
            label: 'Revenue',
            backgroundColor: 'rgba(0,0,255,0.3)',
            stack: 'Stack 0',
            data: [...rev]
        },
        {
            label: 'Expenditure',
            backgroundColor: 'rgba(255,0,0,0.3)',
            stack: 'Stack 0',
            data: [...exp]
        },
        {
            label: 'Surplus/Deficit',
            backgroundColor: 'rgba(0,255,0,0.3)',
            stack: 'Stack 1',
            data: [...surpDef]
        }];

        chart.data.labels.push(label);
        newData.map((nd) => {
            chart.data.datasets.push(nd);
        });
        chart.update();
    }


    function addDataToChartComparison(data) {
        removeDataFromChart();

        let chart = myBar;

        let label = data.map((obj) => {
            return obj.name.replace('županija', '');
        });

        let rev = data.map((obj) => {
            return obj.budgetTransparencyData[0].revenue;
        });

        let exp = data.map((obj) => {
            return (obj.budgetTransparencyData[0].expenditure * -1);
        });

        let surpDef = rev.map((val, idx) => parseFloat(val) + parseFloat(exp[idx]));
        surpDef = surpDef.map((number) => { return (number.toFixed(3)); })

        let newData = [{
            label: 'Revenue',
            backgroundColor: 'rgba(0,0,255,0.3)',
            stack: 'Stack 0',
            data: [...rev]
        },
        {
            label: 'Expenditure',
            backgroundColor: 'rgba(255,0,0,0.3)',
            stack: 'Stack 0',
            data: [...exp]
        },
        {
            label: 'Surplus/Deficit',
            backgroundColor: 'rgba(0,255,0,0.3)',
            stack: 'Stack 1',
            data: [...surpDef]
        }];

        label.map((lbl) => {
            chart.data.labels.push(lbl);
        });

        newData.map((nd) => {
            chart.data.datasets.push(nd);
        });
        chart.update();
    }

    function removeOneDataset(ds) {
        let removalLabel = ds.attr('title-region').replace('županija', '');
        let removalIndex = myBar.data.labels.indexOf(removalLabel);

        if (removalIndex >= 0) {
            myBar.data.datasets[0].data.splice(removalIndex, 1);
            myBar.data.datasets[1].data.splice(removalIndex, 1);
            myBar.data.datasets[2].data.splice(removalIndex, 1);
            myBar.data.labels.splice(removalIndex, 1);
        }

        myBar.update();
    }

    function removeDataFromChart() {
        let chart = myBar;
        chart.data.labels = [];

        for (let i = 0; i < chart.data.datasets.length;) {
            chart.data.datasets.pop();
        };
        chart.update();
    }

    document.onload = init();
    createChart();
});