odoo.define("ventas_chart.chart",function(require){
    var AbstractAction = require("web.AbstractAction")
    var core = require("web.core")

    var VentasChart = AbstractAction.extend({
        template:"template_ventas_chart"
    })

    core.action_registry.add("ventas_chart",VentasChart)
})