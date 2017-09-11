$(document).ready(function () {

    function inicijaliziraj() {
        var zupanija = $('.land');
        var mapCont = $('.map-container');
        var mapa = $('#mapa');
        var imeRegije = $('.region-name');
        var odabraneZupanije = [];


        zupanija.on('click', (e) => {
            let odabir = $(e.target);
            odabir.toggleClass('selected');
            console.log(odabir.attr('title'));
        });

        zupanija.on('mouseover', (e) => {
            imeRegije.text($(e.target).attr('title'));
        });

        zupanija.on('mouseleave', (e) => {
            imeRegije.text('');
        });


        $('#swap-map').click(() => {
            var link = '';
            var atr = $('svg').attr("class");
            var res = atr.split(" ");
            
            if (res[0] == 'cro') {
                link = './bosniaHerzegovinaCantonsHigh.svg';

            } else {
                link = './croatiaHigh.svg';

            }

            console.log(link);

            $.get(link, function (data) {

                mapCont.find('svg').first().remove();
                var xaxa = data.getElementsByTagName("svg")[0];

                mapCont.append(xaxa);
                console.log(xaxa);

                inicijaliziraj();
            });


        });

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
    inicijaliziraj();
});
