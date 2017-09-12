$(document).ready(function () {

    // Everything is wrapped in a function becouse of the event bindings when the map changes
    function init() {

        // Inicijalizacija varijabli koje koristimo
        let zupanija = $('.land');
        let mapCont = $('.map-container');
        let mapa = $('#mapa');
        let regionName = $('.region-name');
        let swapBtn = $('#swap-map');
        let odabraneZupanije = [];

        // Event handlers
        zupanija.on('click', (e) => {
            let selected = $(e.target);
            selected.toggleClass('selected');
            console.log(selected.attr('title'));
        });

        zupanija.on('mouseover', (e) => {
            regionName.text($(e.target).attr('title'));
        });

        zupanija.on('mouseleave', (e) => {
            regionName.text('');
        });


        // Map swapping logic
        swapBtn.click((e) => {
            e.stopImmediatePropagation();

            let link = '';
            let btnTxt = '';
            let atr = $('svg').attr("class");
            let classArray = atr.split(" ");

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
        panZoomInstance.zoom(1.0)
    };
    document.onload = init();
});
