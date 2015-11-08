var cheerio = require('cheerio');
var request = require('request');
var express = require('express');

var app = express();

app.use(express.static('static'));
app.get('/api', function (req, res) {
  var a = req.query.arriving;
  var d = req.query.daparting;

  parseFlight(a, 4, function(Adata){
    console.log("A data:", Adata)
    if(Adata !== false) {
      parseFlight(d, 1, function(Bdata){
        console.log(Bdata);
        var diff = Math.round((Adata - Bdata)/60000);
        console.log(diff)
        if(diff<0) {
          res.status(404).send();
        } else {
          res.send(diff.toString());
        }
      });
    } else {
      res.status(404).send();
    }
  });
});

var server = app.listen(80, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});

function parseFlight(id, i, callback){
  request('https://www.google.fi/search?q='+id, function (error, response, body) {
    //Check for error
    if(error){
      return console.log('Error:', error);
    }

    //Check for right status code
    if(response.statusCode !== 200){
      return console.log('Invalid Status Code Returned:', response.statusCode);
    }
    $ = cheerio.load(body);
    // Find card
    var card = $('li.g>div').first()
    if (card.length>0) {
      //Find flight info
      var trs = card.find('tr').toArray();
      console.log('trs:', trs.length)
      if (trs.length == 6) {
        var Atds = $(trs[i]).find('td').toArray();
        console.log('Atds:', Atds.length)
        if (Atds.length>2) {
          var airport = $(Atds[1]).text();
          var clock = $(Atds[2]).text().split('.');
          console.log(airport, clock);
          var Btds = $(trs[i+1]).find('td').toArray();
          console.log('Btds:', Btds.length)
          if (airport=='HEL' && Btds.length>2) {
            var date = $(Btds[2]).text().split('.');
            if (date.length===2) {
              var hours = clock[0];
              var minutes = clock[1];
              var day = date[0];
              var month = date[1];
              var d = new Date();
              d.setMinutes(parseInt(minutes))
              d.setHours(parseInt(hours))
              d.setDate(parseInt(day))
              d.setMonth(parseInt(month))  
              callback(d);
            }
            return;
          }
        }

        
      }
    } 
    callback(false);
  });
}




