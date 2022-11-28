'use strict';

$(() => {
  const updateURL = () => {
    const lat = $('#Lat').val();
    const lon = $('#Lon').val();
    const filter = $('#Filter').val().trim();
    const cats = !$('#Categories input.on:checked').length ?
                   [...['clear'],
                    ...$('#Categories input.off:checked'     ).map(function() {return '+' + this.value})
                   ] :

                   [...$('#Categories input.on:not(:checked)').map(function() {return '-' + this.value}),
                    ...$('#Categories input.off:checked'     ).map(function() {return '+' + this.value})
                   ];

    $('#Data thead, #Data tbody').empty();

    // let url = `https://api.precisionsustainableag.org/ssurgo?lat=${lat}&lon=${lon}`;
    let url = window.location.origin + `/?lat=${lat}&lon=${lon}`;
    
    if (cats.length) {
      url += `&categories=${cats}`;
    }

    if (filter) {
      url += `&filter=${filter}`;
    }
    
    $('#URL').html(`<a target="new" href="${url}">${url}</a>`);

    fetch($('#URL').text() + '&output=query')
      .then(response => response.text())
      .then(data => {
        $('#Query').text(data.replace(/[\n\r]\s*/g, '\n'));
      });
  } // updateQuery

  const query = () => {
    $('#Status').html('<img src="/spinner.gif">');

    $('#Data thead, #Data tbody').empty();

    fetch($('#URL').text() + '&output=html')
      .then(response => response.text())
      .then(data => {
        if (!data.length) {
          $('#Status').html('No data found');
        } else {
          $('#Status').html('<p>Processing <img src="spinner.gif">');
          setTimeout(() => {
            $('#Data').html(data);
            $('#Status').empty();
          }, 10)
        }
      }
    );
  } // query

  const output = (s, type) => {
    s = `data:text/${type};charset=utf-8,${s}`;

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(s));
    link.setAttribute('download', `data.${type.replace('text', 'txt')}`);
    document.body.appendChild(link);

    link.click();
    link.remove();
  } // output

  const events = () => {
    $('#Query').keypress(e => {
      e.stopImmediatePropagation()
      e.stopPropagation();
      return false;
    });

    $('#HTML').click(query);

    $('#CSV').click(function() {
      $('#Status').html('<img src="/spinner.gif">');
      
      fetch($('#URL').text() + '&output=csv')
        .then(data => data.text())
        .then(data => {
          $('#Status').empty();
          output(data, 'csv')
        });
    });

    $('#JSON').click(function() {
      $('#Status').html('<img src="/spinner.gif">');
      
      fetch($('#URL').text() + '&output=json')
        .then(data => data.json())
        .then(data => {
          $('#Status').empty();
          output(JSON.stringify(data, null, 2), 'text')
        });
    });

    $('#Lat, #Lon, #Categories input').change(updateURL);

    $('#Clear').click(function() {
      $('#Categories input').prop('checked', false);
      updateURL();
    });

    $('#Defaults').click(function() {
      $('#Categories td:nth-child(1) input').prop('checked', true);
      $('#Categories td:nth-child(2) input').prop('checked', false);
      updateURL();
    });

    $('#Filter').on('input', updateURL);

    $('nav button').click(function() {
      $('nav button').removeClass('selected');
      $(this).addClass('selected');
    });

    $('button.documentation').click(function() {
      $('#SSURGO').hide();
      $('#Documentation').show();
    });

    $('button.ssurgo').click(function() {
      $('#Documentation').hide();
      $('#SSURGO').show();
    });
  } // events

  fetch('Inventory.txt?' + Math.random())
    .then(data => data.text())
    .then(data => {
      // $('#Documentation').show(); $('#SSURGO').hide();

      $('#Dictionary').html('<tr><td>' + data.replace(/\t/g, '<td>').split(/[\n\r]+/).join('<tr><td>'));

      for (let i = 3; i >= 1; i--) {
        let span = 1;
        $([...$(`#Dictionary tr:nth-child(n + 2) td:nth-child(${i})`)].reverse()).each(function(i) {
          if ($(this).text().trim()) {
            $(this).attr('rowspan', span).addClass('sticky').parent().addClass('sticky');
            span = 1;
          } else {
            $(this).addClass('remove');
            span++;
          }
        });
        
        $('td.remove').addClass('hidden');
        // $('td.remove').remove();
      }

      const colors = ['#def', '#fed', '#dfd', '#fdf'];
      let c = 0;
      $('#Dictionary tr:nth-child(n + 2) td:nth-child(1):not(:empty)').each(function(i) {
        c++;

        for (let $tr = $(this).parent(), i = 1; i <= this.rowSpan; i++, $tr = $tr.next()) {
          $('td', $tr).css('background', colors[c % colors.length]);
        }
      });
    }
  );

  events();
  updateURL();
});