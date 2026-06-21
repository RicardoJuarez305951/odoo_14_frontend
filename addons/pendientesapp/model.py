from odoo import models,fields,api


class Pendiente(models.Model):
    _name = "pe.pendiente"
    _description = "Pendientes"

    name = fields.Char("Descripción")
    sequence = fields.Char("Secuencia")
