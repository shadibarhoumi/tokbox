Rooms = new Meteor.Collection("rooms");
if (Meteor.isClient) {
  var tok_session;

  // handlers
  function sessionConnectedHandler(event) {
    console.log('connected to session!');
    console.log(event.streams);
    // subscribe to existing streams in session
    subscribeToStreams(event.streams);
    // publish camera's video to session
    console.log('publishing my own stream!');
    $('<div/>').attr('id', 'me').appendTo('#mystream');
    tok_session.publish('me');
  }

  function streamCreatedHandler(event) {
    console.log('new stream created!')
    console.log(event.streams);
    subscribeToStreams(event.streams);
  }

  function subscribeToStreams(streams) {
    console.log('subscribing to streams!');
    console.log(streams);
    for (var i = 0; i < streams.length; i++) {
      var stream = streams[i];
      allStreams.push(stream);
      // stream is another person's stream
      if (stream.connection.connectionId != tok_session.connection.connectionId) {
        console.log('adding stream with id ' + stream.id + ' to otherstreams');
        $('<div/>').attr('id', 'stream_' + stream.id).appendTo('#otherstreams');
        tok_session.subscribe(stream, 'stream_' + stream.id);
      }
      
    }
  }

  var apikey = "33720742";

  if (! Cookie.get('userToken')) {
    Cookie.set('userToken', Math.floor(Math.random() * 100000000));
  }

















  Template.room.events({
    'submit .room-form': function(e) {
      var roomName = $('.room-name').val();
      Session.set('room', roomName);

      var roomId;
      if (Rooms.findOne({'roomName': Session.get('room')})) {
        console.log('room ' + roomName + ' fucking exists already bitch');
        var room = Rooms.findOne({roomName: Session.get('room')});
        // roomId = room._id;
        // console.log('existing room ' + room.roomName + ' has sesh id ' + room.sessionId);
        // tok_session.disconnect();
        // Meteor.call('newToken', room.sessionId, function(err, token) {
        //     console.log('got a new token', token);
        //     tok_session = TB.initSession(room.sessionId);
        //     tok_session.connect(apikey, token);
        //   });
      } else {
        console.log('room ' + roomName + ' is brand fukcing new bitch');
        roomId = Rooms.insert({'roomName': Session.get('room'), userIds:[], sessionId: 0});

        

        // disconnect from current tok_session
        // if (tok_session) {
        //   tok_session.disconnect();
          
        // }
        // console.log('before', tok_session);
        // // create new room with new tok_session id
        Meteor.call('newSession', function(err, id) {
          console.log('created new room ', Session.get('room'));
          console.log('new room has sessionId: ', id);

          Rooms.update(roomId,  {$set: {sessionId: id}});
          
        //   console.log('trying to connect to session');
          
          tok_session = TB.initSession(id);
        //   console.log('after', tok_session);
          Meteor.call('newToken', id, function(err, token) {
        //     console.log('got a new token', token);
            tok_session.connect(apikey, token);
            tok_session.addEventListener("sessionConnected", sessionConnectedHandler);
            tok_session.addEventListener("streamCreated", streamCreatedHandler);
          });
          

        });
      }
      
      Rooms.update({_id: roomId}, { $addToSet: { userIds: Cookie.get('userToken')}});

      // add current user into room

      return false;

    }
  });



















  Template.room.roomName = function() {
    return Session.get('room');
  }

  Template.room.peopleCount = function() {
    var room =  Rooms.findOne({'roomName': Session.get('room')});
    if (room) {
      return room.userIds.length;
    }
    return 0;
  }

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    Future = Npm.require('fibers/future');
    var key = "33720742";
    var secret = "912834e28cbd4e1b79f6ba1ec1b203e0cf4802bf";
    var opentok = new OpenTok.OpenTokSDK(key, secret);


    Meteor.methods({
      newSession: function() {
        console.log('trying to get a new sesh id');
        var fut = new Future();
        opentok.createSession('localhost', function(id) {
          fut.ret(id);
        });
        return fut.wait();
      },

      newToken: function(sessionId) {
        var tokenProps = {
          session_id: sessionId,               
          role:OpenTok.RoleConstants.PUBLISHER
        }
        console.log('getting token with session id', sessionId);
        return opentok.generateToken(tokenProps);
      }


    });

  });
}
