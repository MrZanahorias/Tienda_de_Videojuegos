from django.urls import path
from . import views

urlpatterns = [
    path('videojuegos/', views.listar_videojuegos, name='listar_videojuegos'),
    path('videojuegos/crear/', views.crear_videojuego, name='crear_videojuego'),
    path('videojuegos/<int:id>/', views.obtener_videojuego, name='obtener_videojuego'),
    path('videojuegos/<int:id>/actualizar/', views.actualizar_videojuego, name='actualizar_videojuego'),
    path('videojuegos/<int:id>/eliminar/', views.eliminar_videojuego, name='eliminar_videojuego'),
]
