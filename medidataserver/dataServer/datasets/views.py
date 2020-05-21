from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from .serializers import DatasetSerializer
from .models import Dataset


class DatasetViewSet(ModelViewSet):
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer

    def get_queryset(self):
        # limit request to one single dataset whose name is passed from GET parmas
        dataset_name = self.request.query_params['datasetName']
        return Dataset.objects.filter(name=dataset_name)

