from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Videojuego
import json
from datetime import datetime

# Crea tus vistas aquí.

def parse_fecha(fecha_str):
    """Convierte un string de fecha a objeto date"""
    if not fecha_str:
        return None
    if isinstance(fecha_str, str):
        try:
            return datetime.strptime(fecha_str, '%Y-%m-%d').date()
        except ValueError:
            raise ValueError('Formato de fecha inválido. Use YYYY-MM-DD')
    return fecha_str

def validar_datos_videojuego(data, es_actualizacion=False):
    """Valida los datos del videojuego"""
    errores = []
    
    # Validar campos requeridos solo en creación
    if not es_actualizacion:
        if not data.get('titulo'):
            errores.append('El título es requerido')
        if data.get('precio') is None:
            errores.append('El precio es requerido')
    
    # Validar precio
    if 'precio' in data and data.get('precio') is not None:
        try:
            precio = float(data.get('precio'))
            if precio < 0:
                errores.append('El precio debe ser mayor o igual a 0')
        except (ValueError, TypeError):
            errores.append('El precio debe ser un número válido')
    
    # Validar stock
    if 'stock' in data and data.get('stock') is not None:
        try:
            stock = int(data.get('stock'))
            if stock < 0:
                errores.append('El stock debe ser mayor o igual a 0')
        except (ValueError, TypeError):
            errores.append('El stock debe ser un número entero válido')
    
    # Validar plataforma
    if 'plataforma' in data and data.get('plataforma'):
        plataformas_validas = [choice[0] for choice in Videojuego.PLATAFORMAS]
        if data.get('plataforma') not in plataformas_validas:
            errores.append(f'Plataforma inválida. Opciones válidas: {", ".join(plataformas_validas)}')
    
    # Validar género
    if 'genero' in data and data.get('genero'):
        generos_validos = [choice[0] for choice in Videojuego.GENEROS]
        if data.get('genero') not in generos_validos:
            errores.append(f'Género inválido. Opciones válidas: {", ".join(generos_validos)}')
    
    # Validar fecha de lanzamiento
    if 'fecha_lanzamiento' in data and data.get('fecha_lanzamiento'):
        try:
            parse_fecha(data.get('fecha_lanzamiento'))
        except ValueError as e:
            errores.append(str(e))
    
    return errores

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
@require_http_methods(["POST", "OPTIONS"])
def crear_videojuego(request):
    """Crea un nuevo videojuego"""
    # Manejar peticiones OPTIONS (preflight de CORS)
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken'
        return response
    
    try:
        data = json.loads(request.body)
        
        # Validar datos
        errores = validar_datos_videojuego(data, es_actualizacion=False)
        if errores:
            return JsonResponse({'error': '; '.join(errores)}, status=400)
        
        # Parsear fecha
        fecha_lanzamiento = None
        if data.get('fecha_lanzamiento'):
            try:
                fecha_lanzamiento = parse_fecha(data.get('fecha_lanzamiento'))
            except ValueError as e:
                return JsonResponse({'error': str(e)}, status=400)
        
        # Crear videojuego
        videojuego = Videojuego.objects.create(
            titulo=data.get('titulo'),
            descripcion=data.get('descripcion') or '',
            precio=float(data.get('precio')),
            stock=int(data.get('stock', 0)),
            plataforma=data.get('plataforma', 'PC'),
            genero=data.get('genero', 'ACCION'),
            desarrollador=data.get('desarrollador') or '',
            fecha_lanzamiento=fecha_lanzamiento
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
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': 'Error al crear el videojuego. Verifique los datos enviados.'}, status=400)

@csrf_exempt
@require_http_methods(["PUT", "OPTIONS"])
def actualizar_videojuego(request, id):
    """Actualiza un videojuego existente"""
    # Manejar peticiones OPTIONS (preflight de CORS)
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'PUT, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken'
        return response
    
    try:
        videojuego = Videojuego.objects.get(id=id)
        data = json.loads(request.body)
        
        # Validar datos
        errores = validar_datos_videojuego(data, es_actualizacion=True)
        if errores:
            return JsonResponse({'error': '; '.join(errores)}, status=400)
        
        # Actualizar campos solo si están presentes
        if 'titulo' in data:
            videojuego.titulo = data.get('titulo')
        if 'descripcion' in data:
            videojuego.descripcion = data.get('descripcion') or ''
        if 'precio' in data and data.get('precio') is not None:
            videojuego.precio = float(data.get('precio'))
        if 'stock' in data and data.get('stock') is not None:
            videojuego.stock = int(data.get('stock'))
        if 'plataforma' in data:
            videojuego.plataforma = data.get('plataforma')
        if 'genero' in data:
            videojuego.genero = data.get('genero')
        if 'desarrollador' in data:
            videojuego.desarrollador = data.get('desarrollador') or ''
        
        # Manejar fecha_lanzamiento (permite establecer a null)
        if 'fecha_lanzamiento' in data:
            if data.get('fecha_lanzamiento') is None or data.get('fecha_lanzamiento') == '':
                videojuego.fecha_lanzamiento = None
            else:
                try:
                    videojuego.fecha_lanzamiento = parse_fecha(data.get('fecha_lanzamiento'))
                except ValueError as e:
                    return JsonResponse({'error': str(e)}, status=400)
        
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
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': 'Error al actualizar el videojuego. Verifique los datos enviados.'}, status=400)

@csrf_exempt
@require_http_methods(["DELETE", "OPTIONS"])
def eliminar_videojuego(request, id):
    """Elimina un videojuego"""
    # Manejar peticiones OPTIONS (preflight de CORS)
    if request.method == 'OPTIONS':
        response = JsonResponse({})
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken'
        return response
    
    try:
        videojuego = Videojuego.objects.get(id=id)
        videojuego.delete()
        return JsonResponse({'message': 'Videojuego eliminado correctamente'})
    except Videojuego.DoesNotExist:
        return JsonResponse({'error': 'Videojuego no encontrado'}, status=404)
