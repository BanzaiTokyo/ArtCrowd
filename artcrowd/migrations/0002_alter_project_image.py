# Generated by Django 5.0a1 on 2023-10-11 09:33

import sorl.thumbnail.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('artcrowd', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='image',
            field=sorl.thumbnail.fields.ImageField(upload_to='projects/'),
        ),
    ]
