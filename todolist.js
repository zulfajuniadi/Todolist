TodoCollection = new Meteor.Collection("Todos");

if (Meteor.isClient) {

    Meteor.Collection.prototype.purge = function() {
        var self = this;
        this.find().fetch().forEach(function(record) {
            self.remove(record._id);
        });
    }

    Handlebars.registerHelper('formatDate', function(date){
        return moment(date).format('D/M/YY H:mm:ss');
    });

    Template.todos.activeTodos = function(){
        if(Meteor.userId()) {
            return TodoCollection.find({$and : [{uid : Meteor.userId()}, {isDone : false}]}, {sort : {'insertedAt': -1}}).fetch();
        }
        return TodoCollection.find({isDone : false}, {sort : {'insertedAt': -1}});
    };

    Template.todos.doneTodos = function(){
        if(Meteor.userId()) {
            return TodoCollection.find({$and : [{uid : Meteor.userId()}, {isDone : true}]}, {sort : {'insertedAt': -1}}).fetch();
        }
        return TodoCollection.find({isDone : true}, {sort : {'insertedAt': -1}});
    };

    Template.todos.showDone = function() {
        return Session.equals('showDone', true);
    }

    function save() {
        var el = document.getElementById('newTodo');
        var value = el.value;
        if(el.value.trim() !== '') {
            var obj = {
                name : el.value,
                isDone : false,
                insertedAt : new Date()
            };
            if(Meteor.userId()) {
                obj.uid = Meteor.userId();
            }
            TodoCollection.insert(obj);
            el.value = '';
        }

    }

    Template.todos.events({
        'click #save' : save,
        'keyup #newTodo' : function(e){
            if(e.keyCode === 13) {
                save();
            }
        },
        'change .done' : function(e) {
            if(e.target.checked === true) {
                return TodoCollection.update({_id : this._id}, {$set : {isDone : true, doneAt : new Date()}});
            }
            return TodoCollection.update({_id : this._id}, {$set : {isDone : false, doneAt : null}});
        },
        'change #showDone' : function(e) {
            if(e.target.checked === true) {
                return Session.set('showDone', true);
            }
            return Session.set('showDone', false);
        },
        'click .deleteTodo' : function(){
            TodoCollection.remove({_id : this._id});
        }
    });
}
