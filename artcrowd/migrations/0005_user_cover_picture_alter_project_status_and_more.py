# Generated by Django 5.0a1 on 2023-10-19 07:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('artcrowd', '0004_user_description_alter_projectstatus_project_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='cover_picture',
            field=models.ImageField(blank=True, null=True, upload_to='cover_pictures/'),
        ),
        migrations.AlterField(
            model_name='project',
            name='status',
            field=models.CharField(choices=[('new', 'new'), ('approved by artist', 'approved by artist'), ('rejected by artist', 'rejected by artist'), ('rejected by admin', 'rejected by admin'), ('open', 'open'), ('refund requested', 'refund requested'), ('sale closed', 'sale closed'), ('completed', 'completed'), ('refunded', 'refunded')], default='new', max_length=50),
        ),
        migrations.AlterField(
            model_name='user',
            name='first_name',
            field=models.CharField(blank=True, max_length=150, verbose_name='first name'),
        ),
    ]
