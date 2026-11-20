import sys
from pathlib import Path

from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, renderer_classes
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework import status

PROJECT_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(PROJECT_ROOT))

from backend.agent.system_info import get_system_info
from backend.agent.metrics import GetSystemMetrics

from .models import Server
from .serializers import ServerSerializer
from backend.agent.health_check import CheckServerHealth


# System Information API
@api_view(['GET'])
@renderer_classes([JSONRenderer])
def SystemInfo(request):
    system_data = get_system_info()
    return Response(system_data)


# System Monitoring API
@api_view(['GET'])
@renderer_classes([JSONRenderer])
def SystemMetrics(request):
    metrics_data = GetSystemMetrics()
    return Response(metrics_data)


# Server List and Registration API
@api_view(['GET', 'POST'])
@renderer_classes([JSONRenderer])
def ServerList(request):

    if request.method == 'GET':
        servers = Server.objects.all().order_by('-created_at')
        serializer = ServerSerializer(servers, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ServerSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# Server Details, Update and Delete API
@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@renderer_classes([JSONRenderer])
def ServerDetail(request, pk):

    server = get_object_or_404(Server, pk=pk)

    if request.method == 'GET':
        serializer = ServerSerializer(server)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:

        serializer = ServerSerializer(
            server,
            data=request.data,
            partial=(request.method == 'PATCH')
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    elif request.method == 'DELETE':
        server.delete()

        return Response(
            {"message": "Server deleted successfully."},
            status=status.HTTP_200_OK
        )
# Server Health Check API
@api_view(['GET'])
@renderer_classes([JSONRenderer])
def ServerHealth(request, pk):

    server = get_object_or_404(Server, pk=pk)

    health_data = CheckServerHealth(
        server.host,
        server.port
    )

    health_data["server_id"] = server.id
    health_data["server_name"] = server.name

    return Response(health_data)