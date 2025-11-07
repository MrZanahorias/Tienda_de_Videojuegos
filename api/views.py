from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Videojuego
import json

# Create your views here.

@require_http_methods(["GET"])
def listar_videojuegos(request):
    """Lista todos los videojuegos"""
    videojuegos = Videojuego.objects.all()
    data = []
    for v in videojuegos:
        data.append({
            'id': v.id,
            'titulo': v.titulo,
            'descripcion': v.descripcion,
            'precio': str(v.precio),
            'stock': v.stock,
            'plataforma': v.plataforma,
            'genero': v.genero,
            'desarrollador': v.desarrollador,
            'fecha_lanzamiento': v.fecha_lanzamiento.isoformat() if v.fecha_lanzamiento else None,
            'created_at': v.created_at.isoformat(),
            'updated_at': v.updated_at.isoformat(),
        })
    return JsonResponse(data, safe=False)

@require_http_methods(["GET"])
def obtener_videojuego(request, id):
    """Obtiene un videojuego por ID"""
    try:
        videojuego = Videojuego.objects.get(id=id)
        data = {
            'id': videojuego.id,
            'titulo': videojuego.titulo,
            'descripcion': videojuego.descripcion,
            'precio': str(videojuego.precio),
            'stock': videojuego.stock,
            'plataforma': videojuego.plataforma,
            'genero': videojuego.genero,
            'desarrollador': videojuego.desarrollador,
            'fecha_lanzamiento': videojuego.fecha_lanzamiento.isoformat() if videojuego.fecha_lanzamiento else None,
            'created_at': videojuego.created_at.isoformat(),
            'updated_at': videojuego.updated_at.isoformat(),
        }
        return JsonResponse(data)
    except Videojuego.DoesNotExist:
        return JsonResponse({'error': 'Videojuego no encontrado'}, status=404)

@csrf_exempt
@require_http_methods(["POST"])
def crear_videojuego(request):
    """Crea un nuevo videojuego"""
    try:
        data = json.loads(request.body)
        videojuego = Videojuego.objects.create(
            titulo=data.get('titulo'),
            descripcion=data.get('descripcion', ''),
            precio=data.get('precio'),
            stock=data.get('stock', 0),
            plataforma=data.get('plataforma', 'PC'),
            genero=data.get('genero', 'ACCION'),
            desarrollador=data.get('desarrollador', ''),
            fecha_lanzamiento=data.get('fecha_lanzamiento', None)
        )
        return JsonResponse({
            'id': videojuego.id,
            'titulo': videojuego.titulo,
            'descripcion': videojuego.descripcion,
            'precio': str(videojuego.precio),
            'stock': videojuego.stock,
            'plataforma': videojuego.plataforma,
            'genero': videojuego.genero,
            'desarrollador': videojuego.desarrollador,
            'fecha_lanzamiento': videojuego.fecha_lanzamiento.isoformat() if videojuego.fecha_lanzamiento else None,
            'created_at': videojuego.created_at.isoformat(),
            'updated_at': videojuego.updated_at.isoformat(),
        }, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["PUT"])
def actualizar_videojuego(request, id):
    """Actualiza un videojuego existente"""
    try:
        videojuego = Videojuego.objects.get(id=id)
        data = json.loads(request.body)
        
        videojuego.titulo = data.get('titulo', videojuego.titulo)
        videojuego.descripcion = data.get('descripcion', videojuego.descripcion)
        videojuego.precio = data.get('precio', videojuego.precio)
        videojuego.stock = data.get('stock', videojuego.stock)
        videojuego.plataforma = data.get('plataforma', videojuego.plataforma)
        videojuego.genero = data.get('genero', videojuego.genero)
        videojuego.desarrollador = data.get('desarrollador', videojuego.desarrollador)
        if data.get('fecha_lanzamiento'):
            videojuego.fecha_lanzamiento = data.get('fecha_lanzamiento')
        videojuego.save()
        
        return JsonResponse({
            'id': videojuego.id,
            'titulo': videojuego.titulo,
            'descripcion': videojuego.descripcion,
            'precio': str(videojuego.precio),
            'stock': videojuego.stock,
            'plataforma': videojuego.plataforma,
            'genero': videojuego.genero,
            'desarrollador': videojuego.desarrollador,
            'fecha_lanzamiento': videojuego.fecha_lanzamiento.isoformat() if videojuego.fecha_lanzamiento else None,
            'created_at': videojuego.created_at.isoformat(),
            'updated_at': videojuego.updated_at.isoformat(),
        })
    except Videojuego.DoesNotExist:
        return JsonResponse({'error': 'Videojuego no encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
@require_http_methods(["DELETE"])
def eliminar_videojuego(request, id):
    """Elimina un videojuego"""
    try:
        videojuego = Videojuego.objects.get(id=id)
        videojuego.delete()
        return JsonResponse({'message': 'Videojuego eliminado correctamente'})
    except Videojuego.DoesNotExist:
        return JsonResponse({'error': 'Videojuego no encontrado'}, status=404)
