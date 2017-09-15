// var countries = new Bloodhound({
//     datumTokenizer: Bloodhound.tokenizers.whitespace,
//     queryTokenizer: Bloodhound.tokenizers.whitespace,
//     // url points to a json file that contains an array of country names, see
//     // https://github.com/twitter/typeahead.js/blob/gh-pages/data/countries.json
//     // prefetch: 'https://raw.githubusercontent.com/twitter/typeahead.js/gh-pages/data/countries.json',
//     prefetch: 'test.json',
//     transform : function(response) {
//       console.log(response);
      
//   }
//   });
  
//   // passing in `null` for the `options` arguments will result in the default
//   // options being used
//   $('#prefetch .typeahead').typeahead(null, {
//     name: 'countries',
//     source: countries,
//     templates: {
//       empty: [
//         '<div class="empty-message">',
//           'Nema regije s unesenim podacima',
//         '</div>'
//       ].join('\n')
//     }
//   });

//   $('.typeahead').on('keydown', function(e) {
//     if (e.keyCode == 13) {

//       let inputtxt = $(this).val();
     
//     }
//   });