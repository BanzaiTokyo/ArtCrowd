from datetime import datetime, timedelta, timezone
from django import forms
from django.core.validators import MinValueValidator
from . import models


class ProjectCreateForm(forms.ModelForm):
    class Meta:
        model = models.Project
        fields = ['title', 'description', 'image', 'deadline', 'share_price', 'min_shares', 'max_shares']

    deadline = forms.DateTimeField(validators=[MinValueValidator(datetime.now(tz=timezone.utc)+timedelta(days=1))])
    share_price = forms.DecimalField(min_value=1)
    min_shares = forms.IntegerField(required=False, min_value=1)
    max_shares = forms.IntegerField(required=False, min_value=1)

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data['min_shares'] and cleaned_data['max_shares']:
            if cleaned_data['max_shares'] < cleaned_data['min_shares']:
                raise forms.ValidationError({'max_shares': ["Max shares must be greater than min shares"]})
        return cleaned_data


class ProjectUpdateForm(forms.ModelForm):
    class Meta:
        model = models.ProjectUpdate
        fields = ['description', 'image']


class BuySharesForm(forms.Form):
    num_shares = forms.IntegerField(min_value=1)
