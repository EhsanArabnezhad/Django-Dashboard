
from rest_framework.serializers import HyperlinkedModelSerializer
from .models import Dataset

class DatasetSerializer(HyperlinkedModelSerializer):
    class Meta:
        model  = Dataset
        fields = ('name', 'permission_schema_values')
