var Chat = {
    Views : {
        Users: [],
        Message: [],
        Master: [],
        Writing: []
    },
    Router : [],
    Socket: io.connect('http://localhost:8080')
};

$(function () {

    var app = {};

    // Sends a new mchat message
    Chat.Socket.on('updatechat', function (username, data) {
        var msg = new Chat.Views.Message(username, data);
    });

    // Updates the list of current users
    Chat.Socket.on('updateusers', function (users) {
        if (!app.usersView) {
            app.usersView = new Chat.Views.Users(users);
        }
        else {
            app.usersView.refresh(users);
        }
    });

    // Single Message View
    Chat.Views.Message = Backbone.View.extend({

        template: _.template($('#message').html()),

        initialize: function (username, data) {
            this.render(username, data);
        },

        render: function (username, data) {
            var $conversation = $('#conversation');

            $conversation.append($(this.el).html(this.template({
                username: username, data: data
            })));
            $conversation.scrollTop($conversation[0].scrollHeight);
            return this;
        }
    });

    // Users View
    Chat.Views.Users = Backbone.View.extend({

        template: _.template($('#users-list').html()),
        className: 'users',

        initialize: function (data) {
            this.render(data);
        },

        render: function (users) {
            $('.wrapper').append($(this.el).html(this.template()));
            this.refresh(users);
            return this;
        },

        refresh: function (users) {
            var list = $(this.el).find('ul');
            list.empty();

            $.each(users, function (key, value) {
                list.append('<li>' + key + '</li>');
            });
        }
    });

    // Writing Box View
    Chat.Views.Writing = Backbone.View.extend({

        template: _.template($('#writing-box').html()),
        className: 'new-message',

        events: {
            'click #datasend' : 'sendMessage',
            'keypress #data'  : 'sendMessage'
        },

        initialize: function () {
            this.render();
        },

        sendMessage: function (evt) {
            if (evt.type === 'click' || (evt.type === 'keypress' && evt.which === 13)) {
                var box = $(this.el).find('#data'),
                    message = box.val();

                box.val('');
                if (message) Chat.Socket.emit('sendchat', message);
            }
        },

        render: function () {
            $('.wrapper').append($(this.el).html(this.template()));
            return this;
        }
    });

    // Master View
    Chat.Views.Master = Backbone.View.extend({

        template: _.template($('#prompt').html()),

        events: {
            'keypress input' : 'createUser'
        },

        createUser: function (evt) {
            var self     = this,
                username = '';

            if (evt.keyCode === 13) {
                username = evt.target.value;

                if (username) {
                    Chat.Socket.emit('adduser', username);
                    this.close(self);
                    app.writingBoxView = new Chat.Views.Writing();
                }
                else {
                    console.log('You must write a name');
                }
            }
        },

        render: function () {
            $(this.el).html(this.template());
            return this;
        },

        close: function (el) {
            el.unbind();
            el.remove();
        }

    });

    Chat.Router = Backbone.Router.extend({

        routes: {
            '/' : 'home'
        },

        initialize: function () {
            $('.about').html(new Chat.Views.Master().render().el);
        },

        home: function () {}
    });

    var chatRouter = new Chat.Router();
});