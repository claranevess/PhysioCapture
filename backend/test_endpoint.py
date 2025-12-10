import os
import sys
import django

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

django.setup()

from prontuario.views import dashboard_statistics_gestor_filial
from django.test import RequestFactory

factory = RequestFactory()
request = factory.get('/test/')

try:
    response = dashboard_statistics_gestor_filial(request)
    print('Success:', response.status_code)
    if hasattr(response, 'data'):
        print('Data keys:', list(response.data.keys()) if isinstance(response.data, dict) else response.data)
except Exception as e:
    import traceback
    traceback.print_exc()
