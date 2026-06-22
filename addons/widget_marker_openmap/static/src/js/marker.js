odoo.define("widget_marker_openmap.marker", function (require) {
    "use strict";

    var AbstractField = require("web.AbstractField");
    var fieldRegistry = require("web.field_registry");

    var DEFAULT_LAT = -11.978485;
    var DEFAULT_LNG = -77.0009887;
    var DEFAULT_ZOOM = 15;
    var DEFAULT_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    var DEFAULT_ATTRIBUTION = "&copy; OpenStreetMap contributors";

    var FieldMarkerOpenMap = AbstractField.extend({
        template: "widget_marker_openmap_tmpl",
        supportedFieldTypes: ["char"],
        events: {
            "click .marker_openmap": "geolocalizame",
        },

        init: function (parent, name, record, options) {
            this._super(parent, name, record, options);
            var nodeOptions = this.nodeOptions || {};
            this.tileUrl = nodeOptions.tile_url || DEFAULT_TILE_URL;
            this.tileAttribution = nodeOptions.tile_attribution || DEFAULT_ATTRIBUTION;
            this.maxZoom = nodeOptions.max_zoom || 19;
            this._readCoordinates();
        },

        destroy: function () {
            this._destroyMap();
            this._super.apply(this, arguments);
        },

        geolocalizame: function () {
            var self = this;

            if (!("geolocation" in navigator)) {
                return;
            }

            navigator.geolocation.getCurrentPosition(function (position) {
                self._setCoordinates(
                    position.coords.latitude,
                    position.coords.longitude,
                    20
                );
            });
        },

        _readCoordinates: function () {
            var parts = (this.value || "").split("|");
            var lng = parseFloat(parts[0]);
            var lat = parseFloat(parts[1]);

            if (parts.length === 2 && isFinite(lat) && isFinite(lng)) {
                this.lat = lat;
                this.lng = lng;
            } else {
                this.lat = DEFAULT_LAT;
                this.lng = DEFAULT_LNG;
            }

            this.zoom = DEFAULT_ZOOM;
        },

        _renderReadonly: function () {
            this._renderMap(false);
        },

        _renderEdit: function () {
            this._renderMap(true);
        },

        _renderMap: function (editable) {
            var self = this;
            var mapElement = this.$(".openmap")[0];

            if (!mapElement || typeof L === "undefined") {
                return;
            }

            this._destroyMap();

            this.map = L.map(mapElement, {
                doubleClickZoom: !editable,
            }).setView([this.lat, this.lng], this.zoom);

            L.tileLayer(this.tileUrl, {
                maxZoom: this.maxZoom,
                attribution: this.tileAttribution,
            }).addTo(this.map);

            this.marker = L.marker([this.lat, this.lng], {
                draggable: editable,
            }).addTo(this.map);

            if (editable) {
                this.map.on("dblclick", function (event) {
                    self._setCoordinates(event.latlng.lat, event.latlng.lng);
                });

                this.marker.on("dragend", function (event) {
                    var position = event.target.getLatLng();
                    self._setCoordinates(position.lat, position.lng);
                });
            }

            setTimeout(function () {
                if (self.map) {
                    self.map.invalidateSize();
                }
            }, 0);
        },

        _setCoordinates: function (lat, lng, zoom) {
            this.lat = lat;
            this.lng = lng;

            if (zoom) {
                this.zoom = zoom;
            }

            if (this.map) {
                this.map.setView([this.lat, this.lng], this.zoom);
            }

            if (this.marker) {
                this.marker.setLatLng([this.lat, this.lng]);
            }

            this._setValue(String(this.lng) + "|" + String(this.lat));
        },

        _destroyMap: function () {
            if (this.map) {
                this.map.remove();
                this.map = null;
                this.marker = null;
            }
        },
    });

    fieldRegistry.add("field_marker_openmap", FieldMarkerOpenMap);
});
