import sys
from pathlib import Path

from rest_framework.decorators import api_view, renderer_classes
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer

PROJECT_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(PROJECT_ROOT))

from backend.agent.system_info import get_system_info


@api_view(['GET'])
@renderer_classes([JSONRenderer])
def SystemInfo(request):
    system_data = get_system_info()
    return Response(system_data)