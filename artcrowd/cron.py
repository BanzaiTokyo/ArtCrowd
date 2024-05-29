from django.db.models.expressions import RawSQL
from django.utils import timezone
from .models import Project
from . import blockchain


def close_expired_projects():
    projects = Project.objects.filter(pk__in=RawSQL(f'''
        SELECT id FROM {Project.objects.model._meta.db_table} 
        WHERE status=%s AND (deadline < %s OR max_shares > 0
            AND (SELECT sum(quantity) FROM artcrowd_share
            WHERE project_id=artcrowd_project.id) >= max_shares)
    ''', (Project.OPEN, timezone.now()))).all()

    for project in projects:
        project.status = Project.SALE_CLOSED
        blockchain.update_project_status(project)
        project.save()
