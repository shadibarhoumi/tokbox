$(function() {



    var apikey = "33720742";

    TB.addEventListener("exception", exceptionHandler);
    // TODO don't attach this to the window
    // window.session = TB.initSession("2_MX4zMzcyMDc0Mn4xMjcuMC4wLjF-U2F0IEp1biAyOSAxNTozMDoyOSBQRFQgMjAxM34wLjgwMDM3OTZ-");

    // enable OpenTok controller to send events to js functions
    // session.addEventListener("sessionConnected", sessionConnectedHandler);
    // session.addEventListener("streamCreated", streamCreatedHandler);

    // code to pick which room...
    // if room in collection

    // if they want a new sesh

    // waiting screen
    // Meteor.call("newSession", function(err, id) {
    //   //session.connect(apiKey, id);
    //   console.log('croissant', id);
    // });

    // connect to session
    // session.connect(apikey, "T1==cGFydG5lcl9pZD0zMzcyMDc0MiZzZGtfdmVyc2lvbj10YnJ1YnktdGJyYi12MC45MS4yMDExLTAyLTE3JnNpZz02YjhhODA4NDA0M2NlZTcxNTUwMGFiNzBkYjdjZTM2NWY5OTdkMjc2OnJvbGU9cHVibGlzaGVyJnNlc3Npb25faWQ9Ml9NWDR6TXpjeU1EYzBNbjR4TWpjdU1DNHdMakYtVTJGMElFcDFiaUF5T1NBeE5Ub3pNRG95T1NCUVJGUWdNakF4TTM0d0xqZ3dNRE0zT1RaLSZjcmVhdGVfdGltZT0xMzcyNTQ1NzY1Jm5vbmNlPTAuOTE2MzkxNTU1NjA0Nzk2MSZleHBpcmVfdGltZT0xMzcyNjMyMTY1JmNvbm5lY3Rpb25fZGF0YT0=");

    window.allStreams = [];

    // handlers
    function sessionConnectedHandler(event) {
      console.log('connected to session!');
      console.log(event.streams);
      // subscribe to existing streams in session
      subscribeToStreams(event.streams);
      // publish camera's video to session
      console.log('publishing my own stream!');
      $('<div/>').attr('id', 'me').appendTo('#mystream');
      session.publish('me');
    }

    function streamCreatedHandler(event) {
      console.log('new stream created!')
      console.log(event.streams);
      subscribeToStreams(event.streams);
    }

    // subscribe to streams helper method
    function subscribeToStreams(streams) {
      console.log('subscribing to streams!');
      console.log(streams);
      for (var i = 0; i < streams.length; i++) {
        var stream = streams[i];
        allStreams.push(stream);
        // stream is another person's stream
        if (stream.connection.connectionId != session.connection.connectionId) {
          console.log('adding stream with id ' + stream.id + ' to otherstreams');
          $('<div/>').attr('id', 'stream_' + stream.id).appendTo('#otherstreams');
          session.subscribe(stream, 'stream_' + stream.id);
        }
        
      }
    }

    function unsubscribe(streamId) {
      for (var i = 0; i < streams.length; i++) {
          var stream = streams[i];
          if (stream.streamId == streamId) {
              session.unsubscribe(stream);
          }
      }
    }

    // exception handler
    function exceptionHandler(event) {
        alert(event.message);
    }

  });