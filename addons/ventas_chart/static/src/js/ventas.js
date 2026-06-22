odoo.define("ventas_chart.chart", function (require) {
    var AbstractAction = require("web.AbstractAction")
    var core = require("web.core")

    var states = {
        "sent": "Cotizado",
        "draft": "Borrador",
        "sale": "Ordenes de Venta",
    }

    var VentasChart = AbstractAction.extend({
        template: "template_ventas_chart",
        events:{
            "change .sale_state":"change_sale_state",
        },
        start: function () {
            var self = this;
            self.sale_chart = undefined
            self.lines = []
            self._super()
            core.bus.on("DOM_updated", this, function () {
                self.fetch_group_by_state().then(function(lines){
                    self.lines = lines || []
                    self.renderChart(self.getFilteredLines())
                })
            })
        },

        fetch_group_by_state:function(){
            return this._rpc({
                model: "sale.order",
                method: "group_by_state",
                args: [],
                kwargs: {}
            })
        },
        getFilteredLines: function () {
            var enabledStates = _.map(
                _.filter($(".sale_state"), function (el) { return $(el).is(":checked") }),
                function (el) { return $(el).data("name") }
            )

            return _.filter(this.lines, function (line) {
                return enabledStates.indexOf(line.state) >= 0
            })
        },
        renderChart: function (lines) {
            var ctx = document.getElementById("myChart").getContext("2d")

            if (this.sale_chart) {
                this.sale_chart.destroy()
            }

            this.sale_chart = new Chart(ctx, {
                type: "pie",
                data: {
                    labels: _.map(lines, function (el) { return states[el.state] || el.state }),
                    datasets: [{
                        label: "Ventas por Estado",
                        data: _.map(lines, function (el) { return el.sum }),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgb(255, 205, 86)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgb(255, 205, 86)'
                        ],
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            })
        },
        change_sale_state:function(ev){
            this.renderChart(this.getFilteredLines())
        },
    })

    core.action_registry.add("ventas_chart", VentasChart)
})
