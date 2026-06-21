odoo.define('pendientesapp.pendientes_widget',function(require){
    var AbstractAction = require("web.AbstractAction")
    var core = require("web.core")

    /*
        create
        write
        unlink
        search_read
    */

    var PendienteAction = AbstractAction.extend({
        template:"pendientes_template",
        events:{
            "click .btn_add_pendiente":"add_pendiente"
        },
        start:function(){
            this._super()
            this.fetchPendientes()
        },
        renderTemplate:function(){

        },
        fetchPendientes:function(){
            var list_pendientes = $(this.$el).find(".list_pendientes")
            this._rpc({
                model:"pe.pendiente",
                method:"search_read",
                args:[],
                kwargs:{}
            }).then(function(pendientes){
                _.each(pendientes,function(pendiente){
                    list_pendientes.append("<li>"+pendiente.name +"</li>")  
                })
            })
        },
        add_pendiente:function(ev){
            var self = this;
            var new_pendiente = $(this.$el).find("input[name='pendiente']").val()
            if(new_pendiente != ""){
                this._rpc({
                    model:"pe.pendiente",
                    method:"create",
                    args:[{"name":new_pendiente}],
                    kwargs:{}
                }).then(function(res){
                    if(res){
                        var list_pendientes = $(self.$el).find(".list_pendientes")
                        list_pendientes.append("<li>"+new_pendiente +"</li>")
                        console.log(new_pendiente)
                    }
                })
                
            }else{
                alert("Esta intentando agregar una pendiente vacío")
            }
        }
    }) 
    console.log(PendienteAction)
    

    core.action_registry.add("pendientes_widget",PendienteAction)
    return PendienteAction
})