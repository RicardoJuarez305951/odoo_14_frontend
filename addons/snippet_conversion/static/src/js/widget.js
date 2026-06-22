odoo.define("snippet_conversion.widget", function (require) {
    "use strict";

    var publicWidget = require("web.public.widget");

    publicWidget.registry.WidgetConversion = publicWidget.Widget.extend({
        selector: ".s_exchange",
        disabledInEditableMode: false,
        events: {
            "change select[name='currency_from']": "_onChange",
            "change select[name='currency_to']": "_onChange",
            "input input[name='amount']": "_onChange",
        },

        start: function () {
            this.rateCache = {};
            this._setStatus("Cargando tasas...");
            return Promise.resolve(this._super.apply(this, arguments)).then(
                this._onChange.bind(this)
            );
        },

        _onChange: function () {
            var amount = parseFloat(this.$("input[name='amount']").val() || "0");
            var base = this.$("select[name='currency_from']").val();
            var quote = this.$("select[name='currency_to']").val();

            if (!base || !quote || isNaN(amount)) {
                this._setError("Selecciona ambas divisas y un monto válido.");
                return;
            }

            if (base === quote) {
                this._updateResult(amount, base, quote, 1);
                return;
            }

            var cacheKey = base + ":" + quote;
            var cachedRate = this.rateCache[cacheKey];
            if (cachedRate) {
                this._updateResult(amount, base, quote, cachedRate);
                return;
            }

            this._setStatus("Actualizando tasa...");
            this._fetchRate(base, quote)
                .then(
                    function (rate) {
                        this.rateCache[cacheKey] = rate;
                        this._updateResult(amount, base, quote, rate);
                    }.bind(this)
                )
                .catch(
                    function () {
                        this._setError("No se pudo obtener la tasa de cambio.");
                    }.bind(this)
                );
        },

        _fetchRate: function (base, quote) {
            var url =
                "https://api.frankfurter.dev/v2/rate/" +
                encodeURIComponent(base) +
                "/" +
                encodeURIComponent(quote);

            return window
                .fetch(url, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                    },
                })
                .then(function (response) {
                    if (!response.ok) {
                        throw new Error("HTTP " + response.status);
                    }
                    return response.json();
                })
                .then(function (payload) {
                    if (!payload || typeof payload.rate !== "number") {
                        throw new Error("Invalid payload");
                    }
                    return payload.rate;
                });
        },

        _updateResult: function (amount, base, quote, rate) {
            var converted = amount * rate;
            var formattedAmount = this._formatNumber(amount);
            var formattedRate = this._formatNumber(rate, 6);
            var formattedConverted = this._formatNumber(converted);

            this.$("#result").text(formattedConverted + " " + quote);
            this.$("#exchange_info").text(
                "1 " +
                    base +
                    " = " +
                    formattedRate +
                    " " +
                    quote +
                    " | " +
                    formattedAmount +
                    " " +
                    base +
                    " = " +
                    formattedConverted +
                    " " +
                    quote
            );
        },

        _setStatus: function (message) {
            this.$("#result").text(message);
            this.$("#exchange_info").text("");
        },

        _setError: function (message) {
            this.$("#result").text("Error");
            this.$("#exchange_info").text(message);
        },

        _formatNumber: function (value, digits) {
            var fractionDigits = digits === undefined ? 2 : digits;

            return new Intl.NumberFormat("es-MX", {
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits,
            }).format(value);
        },
    });
});
