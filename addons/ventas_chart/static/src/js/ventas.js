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
        start: function () {
            var self = this;
            self._super()
            core.bus.on("DOM_updated", this, function () {
                self.renderChart()
            })
        },
        renderChart: function () {
            this._rpc({
                model: "sale.order",
                method: "group_by_state",
                args: [],
                kwargs: {}
            }).then(function (res) {
                console.log(res)
                const ctx = document.getElementById("myChart").getContext("2d");

                var myChart = new Chart(ctx, {
                    type: "bar",
                    data: {
                        labels: _.map(res, function (el) { return states[el.state] || el.state }),
                        datasets: [{
                            label: "Ventas por Estado",
                            data: _.map(res, function (el) { return el.sum }),
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });

            })
        }
    })

    core.action_registry.add("ventas_chart", VentasChart)
})
