"""dataServer URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls              import url, include
from django.contrib                import admin
from rest_framework                import routers
from dataServer.customers.views    import UserViewSet, GroupViewSet
from dataServer.datasets.views     import DatasetViewSet
from dataServer.prezzichiari.views import RilevazioneView, PuntoVenditaView, UniqueValuesView


admin.site.site_header = "MediPragma Admin"
admin.site.site_title =  "MediPragma Admin Portal"
admin.site.index_title = "Welcome to MediPragma Dashboard Portal"
router = routers.DefaultRouter()
router.register(r'users',       UserViewSet)
router.register(r'groups',      GroupViewSet)
router.register(r'datasets',    DatasetViewSet)
router.register(r'rilevazioni', RilevazioneView, base_name="rilevazioni")

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^admin/', admin.site.urls),
    url(r'^prezzichiari/api/rilevazioni/',  RilevazioneView.as_view()),
    url(r'^prezzichiari/api/puntivendita/', PuntoVenditaView.as_view()),
    url(r'^prezzichiari/api/uniquevalues/', UniqueValuesView.as_view()),
    # url(r'^api-auth', include('rest_framework.urls', namespace='rest_framework'))
]

urlpatterns += router.urls
