from django.contrib import admin
from .models import Videojuego

# Registra tus modelos aquí.

@admin.register(Videojuego)
class VideojuegoAdmin(admin.ModelAdmin):
    list_display = ('id', 'titulo', 'plataforma', 'genero', 'precio', 'stock', 'desarrollador', 'fecha_lanzamiento')
    list_filter = ('plataforma', 'genero', 'created_at', 'updated_at')
    search_fields = ('titulo', 'desarrollador', 'descripcion')
    ordering = ('-created_at',)
    date_hierarchy = 'fecha_lanzamiento'
