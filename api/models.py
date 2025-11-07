from django.db import models

# Crea tus modelos aquí.

class Videojuego(models.Model):
    PLATAFORMAS = [
        ('PC', 'PC'),
        ('PS5', 'PlayStation 5'),
        ('PS4', 'PlayStation 4'),
        ('XBOX_SERIES', 'Xbox Series X/S'),
        ('XBOX_ONE', 'Xbox One'),
        ('SWITCH', 'Nintendo Switch'),
        ('MULTI', 'Multiplataforma'),
    ]
    
    GENEROS = [
        ('ACCION', 'Acción'),
        ('AVENTURA', 'Aventura'),
        ('RPG', 'RPG'),
        ('DEPORTES', 'Deportes'),
        ('ESTRATEGIA', 'Estrategia'),
        ('SIMULACION', 'Simulación'),
        ('CARRERAS', 'Carreras'),
        ('SHOOTER', 'Shooter'),
        ('TERROR', 'Terror'),
        ('PUZZLE', 'Puzzle'),
    ]
    
    titulo = models.CharField(max_length=200, verbose_name='Título')
    descripcion = models.TextField(blank=True, null=True, verbose_name='Descripción')
    precio = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Precio')
    stock = models.IntegerField(default=0, verbose_name='Stock')
    plataforma = models.CharField(max_length=20, choices=PLATAFORMAS, default='PC', verbose_name='Plataforma')
    genero = models.CharField(max_length=20, choices=GENEROS, default='ACCION', verbose_name='Género')
    desarrollador = models.CharField(max_length=200, blank=True, null=True, verbose_name='Desarrollador')
    fecha_lanzamiento = models.DateField(blank=True, null=True, verbose_name='Fecha de Lanzamiento')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        verbose_name = 'Videojuego'
        verbose_name_plural = 'Videojuegos'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.titulo} ({self.plataforma})"
