from django.contrib import admin
from django.contrib.auth.admin import Group
from .models import Dataset, AccessProfile
from jsonfield import JSONField
from jsoneditor.forms import JSONEditor


class DatasetAdmin(admin.ModelAdmin):

    formfield_overrides = {
        JSONField: {
            'widget': JSONEditor    # substiture raw json text input with a rich editor
        }
    }


class AccessProfileAdmin(admin.ModelAdmin):

    class Media:

        js = [
            # this js files enable a widget to edit permission (access_detail) in a user-friendly way
            'datasets/js/permission_chooser.js',
            'datasets/libs/jquery/jquery-3.2.1.min.js',
            'datasets/libs/chosen/chosen.jquery.min.js',
            'datasets/libs/underscore-min.js'
        ]

        css = {
            'all': ['datasets/libs/chosen/chosen.min.css']
        }

    filter_horizontal = ['users']




admin.site.register(Dataset, DatasetAdmin)
admin.site.register(AccessProfile, AccessProfileAdmin)

admin.site.unregister(Group)
