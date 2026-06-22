odoo.define("snippet_conversion.snippet", function (require) {
    var options = require("web_editor.snippets.options");
    var Dialog = require("web.Dialog");
    var core = require("web.core");
    var qweb = core.qweb;

    options.registry.SnippetConversion = options.Class.extend({
        xmlDependencies: ["/snippet_conversion/static/src/xml/modal.xml"],

        start: function () {
            this._super();
        },

        edit: function () {
            var self = this;
            var content_modal = qweb.render("modal_edit_snippet_conversion", {});

            self.modal = new Dialog(this, {
                title: "Edición de Conversión",
                size: "small",
                $content: $(content_modal),
                buttons: [
                    {
                        text: "Guardar",
                        classes: "btn btn-primary",
                        close: true,
                        click: _.bind(this._saveChanges, this),
                    },
                    {
                        text: "Descartar",
                        close: true,
                    },
                ],
            }).open();

            self.modal.opened().then(function () {
                var title = self.$target.find("h2").text();
                var text = self.$target.find("p").text();

                self.modal.$("input[name='title']").val(title);
                self.modal.$("textarea[name='text']").val(text);
            });
        },

        _saveChanges: function () {
            var title = this.modal.$("input[name='title']").val();
            var text = this.modal.$("textarea[name='text']").val();

            this.$target.find("h2").text(title);
            this.$target.find("p").text(text);
        },
    });
});