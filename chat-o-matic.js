Channels = new Mongo.Collection("channels");
Messages = new Mongo.Collection("messages");



if (Meteor.isServer) {



  Meteor.publish("messages", function () {
    return Messages.find();
  });

  Meteor.publish("channels", function () {
    return Messages.find();
  });
}


if (Meteor.isClient) {



 Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});

 Meteor.subscribe("channels");
 Meteor.subscribe("messages");

  Session.set('viewState', 'messages');
  Session.set('currentChannel', 'default');
 
 //Session.get('currentChannel') || 'default'

  // Body

  Template.body.helpers({
    channelState: function(){
      return Session.get('viewState') == 'channels';
    },
    messageState: function(){
      return Session.get('viewState') == 'messages';
    },
    userListState: function(){
      return Session.get('viewState') == 'userList';
    }
  });

  Template.body.events({

  });




  // MessageView

  Template.messagesView.helpers({
    messages: function(){
      return Messages.find({'channel': Session.get('currentChannel') || 'default'});
    },
    isOwner: function () {
      return this.owner === Meteor.userId();
    },
    currentChannel: function (){
      return Session.get('currentChannel') || 'default';
    }
  });

  Template.messagesMenu.helpers({
    currentChannel: function (){
      return Session.get('currentChannel') || 'default';
    }
  });

  Template.messagesMenu.events({
    "click .choose-channel": function (event) {
      Session.set('viewState', 'channels');
      
    },
    "click .invite-user": function (event) {
      alert('Couldn\'t finish this feature so, by the moment everybody can join to any channel without any restriction');
    }
  });

  Template.messagesView.events({
    "click .delete": function () {
      if(confirm('Delete Message? Sure?')){
        Meteor.call("deleteMessage", this._id);
      }
    }
  });

  Template.messagesFooter.events({
    "submit .new-message": function (event) {
      event.preventDefault();
      var text = event.target.text.value;
      if(!text){
        return;
      };
      var currentChannel = Session.get('currentChannel');
      Meteor.call("addMessage", text, currentChannel);
      setTimeout( function(){ scrollToBottom(true) }, 500);
      event.target.text.value = "";
    }
  });






  // Channels

  Template.channelsView.helpers({
    channels: function(){
      return Channels.find();
    },
    isOwner: function () {
      return this.owner === Meteor.userId();
    }
  });

  Template.channelsMenu.events({
    "click .go-back": function (event) {
      Session.set('viewState', 'messages');
      scrollToBottom();
    }
  });

  Template.channelsView.events({
    "click .line": function (event) { console.log( this.text)
      Session.set('currentChannel', this.text+'' );
      Session.set('viewState', 'messages');
    },
    "click .delete": function () {
      if(confirm('Delete Channel? Sure?')){
        Meteor.call("deleteChannel", this._id);
      }
    }
  });


  Template.channelsFooter.events({
    "submit .new-channel": function (event) { 
      event.preventDefault();
      var text = event.target.text.value;

      if(!text){
        return;
      };

      Meteor.call("addChannel", text);
      setTimeout( function(){ scrollToBottom(true) }, 500);
      event.target.text.value = "";
    }
  });


};








// Methods

Meteor.methods({
  addMessage: function (text, currentChannel) {

    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    };

    Messages.insert({
      text: text,
      channel: currentChannel || 'default',
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteMessage: function (MessageId) {

    Messages.remove(MessageId);
  },
  addChannel: function (text) {

    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    };

    Channels.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteChannel: function (ChannelId) {
    Channels.remove(ChannelId);
    // TODO: Remove all the messages related to this channel
  },
});


function scrollToBottom( shouldAnim ){
  var shouldAnim = shouldAnim || false;
  if(shouldAnim){
    $("html, body").animate({ scrollTop: $(document).height() }, 1000);
  }else{
    $("html, body").scrollTop($(document).height());
  }
}