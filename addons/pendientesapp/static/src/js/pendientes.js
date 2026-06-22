odoo.define('pendientesapp.pendientes_widget', function(require) {
    var AbstractAction = require("web.AbstractAction");
    var core = require("web.core");

    var PendienteAction = AbstractAction.extend({
        template: "pendientes_template",

        events: {
            "click .btn_add_pendiente": "add_pendiente",
            "click .btn_delete_pendiente": "delete_pendiente",
            "keydown input[name='pendiente']": 'on_pendiente_keydown'
        },

        start: function() {
            this._super();
            this.fetchPendientes();
        },

        fetchPendientes: function() {
            var self = this;
            var list_pendientes = $(this.$el).find(".list_pendientes");

            list_pendientes.empty();

            this._rpc({
                model: "pe.pendiente",
                method: "search_read",
                args: [],
                kwargs: {
                    fields: ["id", "name"]
                }
            }).then(function(pendientes) {
                _.each(pendientes, function(pendiente) {
                    list_pendientes.append(self.renderPendiente(pendiente));
                });
            });
        },

        renderPendiente: function(pendiente) {
            var li = $("<li></li>").attr("data-id", pendiente.id);

            var texto = $("<span></span>").text(pendiente.name);

            var boton = $("<button></button>")
                .text("BORRAR")
                .attr("type", "button")
                .addClass("btn_delete_pendiente");

            li.append(texto).append(" ").append(boton);

            return li;
        },

        add_pendiente: function(ev) {
            ev.preventDefault();

            var self = this;
            var input = $(this.$el).find("input[name='pendiente']");
            var new_pendiente = input.val();

            if (new_pendiente != "") {
                this._rpc({
                    model: "pe.pendiente",
                    method: "create",
                    args: [{
                        "name": new_pendiente
                    }],
                    kwargs: {}
                }).then(function(res) {
                    if (res) {
                        var list_pendientes = $(self.$el).find(".list_pendientes");
                        $(self.$el).find("input[name='pendiente']").val("");

                        var pendiente = {
                            id: res,
                            name: new_pendiente
                        };

                        list_pendientes.append(self.renderPendiente(pendiente));
                        input.val("");

                        console.log("Pendiente creada:", pendiente);
                    }
                });
            } else {
                alert("Está intentando agregar un pendiente vacío");
            }
        },

        delete_pendiente: function(ev) {
            ev.preventDefault();

            var self = this;
            var li = $(ev.currentTarget).closest("li");
            var pendiente_id = parseInt(li.attr("data-id"));

            if (!pendiente_id) {
                alert("No se encontró el ID del pendiente");
                return;
            }

            this._rpc({
                model: "pe.pendiente",
                method: "unlink",
                args: [[pendiente_id]],
                kwargs: {}
            }).then(function(res) {
                if (res) {
                    li.remove();
                    console.log("Pendiente eliminado:", pendiente_id);
                }
            });
        },

        on_pendiente_keydown:function(ev){
            if(ev.key === "Enter"){
                ev.preventDefault();
                this.add_pendiente(ev)
            }
        },
    });

    core.action_registry.add("pendientes_widget", PendienteAction);

    return PendienteAction;
});